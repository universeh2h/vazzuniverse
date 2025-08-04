import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { Digiflazz } from "@/lib/digiflazz";
import {
  DIGI_KEY,
  DIGI_USERNAME,
  DUITKU_API_KEY,
  DUITKU_BASE_URL,
  DUITKU_CALLBACK_URL,
  DUITKU_EXPIRY_PERIOD,
  DUITKU_MERCHANT_CODE,
} from "@/constants";
import { getProfile } from "@/app/(auth)/auth/components/server";
import { GenerateRandomId } from "@/utils/generateRandomId";
import { Prisma } from "@prisma/client";
import { handleOrderStatusChange } from "@/lib/whatsapp-message";

export type RequestPayment = {
  noWa: number;
  layanan: string;
  paymentCode: string;
  accountId: string;
  serverId: string;
  voucherCode?: string;
  game: string;
  typeTransaksi: string;
  nickname: string;
};

/**
 * Helper function for safely processing vouchers with race condition handling
 */
class PaymentRequestQueue {
  private static instance: PaymentRequestQueue;
  private activeRequests: Set<string> = new Set();
  private queue: Map<string, Promise<any>> = new Map();
  private maxConcurrentRequests: number;

  private constructor(maxConcurrentRequests = 10) {
    this.maxConcurrentRequests = maxConcurrentRequests;
  }

  static getInstance(maxConcurrentRequests = 10): PaymentRequestQueue {
    if (!PaymentRequestQueue.instance) {
      PaymentRequestQueue.instance = new PaymentRequestQueue(
        maxConcurrentRequests
      );
    }
    return PaymentRequestQueue.instance;
  }

  async enqueue(key: string, processFn: () => Promise<any>): Promise<any> {
    // Jika request untuk key ini sudah ada, tunggu
    if (this.activeRequests.has(key)) {
      if (!this.queue.has(key)) {
        throw new Error("Concurrent request processing error");
      }
      return this.queue.get(key);
    }

    // Cek jumlah request aktif
    if (this.activeRequests.size >= this.maxConcurrentRequests) {
      // Tunggu sampai ada slot kosong
      await this.waitForSlot();
    }

    // Tandai request sebagai aktif
    this.activeRequests.add(key);

    try {
      // Proses request
      const requestPromise = processFn().finally(() => {
        this.activeRequests.delete(key);
        this.queue.delete(key);
      });

      // Simpan promise
      this.queue.set(key, requestPromise);

      return await requestPromise;
    } catch (error) {
      // Hapus request dari active requests jika error
      this.activeRequests.delete(key);
      this.queue.delete(key);
      throw error;
    }
  }

  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.activeRequests.size < this.maxConcurrentRequests) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }
}

// Voucher Processing Function
async function processVoucher(
  tx: Prisma.TransactionClient,
  voucherCode: string,
  price: number,
  categoryDetails: any
) {
  // First find the voucher
  const voucher = await tx.voucher.findFirst({
    where: {
      code: voucherCode,
      isActive: true,
      expiryDate: { gt: new Date() },
      startDate: { lte: new Date() },
    },
    include: {
      categories: true,
    },
  });

  if (!voucher) {
    throw new Error("Invalid or expired voucher code");
  }

  // Lock the voucher row to prevent concurrent modifications
  await tx.$executeRaw`SELECT * FROM vouchers WHERE id = ${voucher.id} FOR UPDATE`;

  // Refetch after locking to get the most up-to-date state
  const lockedVoucher = await tx.voucher.findUnique({
    where: { id: voucher.id },
  });

  if (!lockedVoucher) {
    throw new Error("Voucher no longer available");
  }

  // Check usage limits
  if (
    lockedVoucher.usageLimit &&
    lockedVoucher.usageCount >= lockedVoucher.usageLimit
  ) {
    throw new Error("Voucher usage limit reached");
  }

  // Check minimum purchase requirement
  if (voucher.minPurchase && price < voucher.minPurchase) {
    throw new Error(
      `Minimum purchase of ${voucher.minPurchase} required for this voucher`
    );
  }

  const isApplicable =
    voucher.isForAllCategories ||
    voucher.categories.some((vc) => vc.categoryId === categoryDetails.id);

  if (!isApplicable) {
    throw new Error("Voucher not applicable to this product category");
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (voucher.discountType === "PERCENTAGE") {
    discountAmount = (price * voucher.discountValue) / 100;
    if (voucher.maxDiscount) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    }
  } else {
    discountAmount = voucher.discountValue;
  }

  // Update voucher usage count immediately while we have the lock
  await tx.voucher.update({
    where: { id: voucher.id },
    data: { usageCount: { increment: 1 } },
  });

  return {
    price: Math.max(0, price - discountAmount),
    discountAmount,
    appliedVoucherId: voucher.id,
  };
}

export async function POST(req: NextRequest) {
  const requestQueue = PaymentRequestQueue.getInstance();

  try {
    // Parse request body
    const body = await req.json();
    const session = await getProfile();

    // Destructure request payload
    const {
      layanan,
      paymentCode,
      noWa,
      voucherCode,
      serverId,
      nickname,
      accountId,
    }: RequestPayment = body;

    // Generate unique request key for concurrency control
    const requestKey = `${accountId}-${layanan}-${serverId}`;

    // Enqueue and process the request
    return await requestQueue.enqueue(requestKey, async () => {
      // Initialize Digiflazz
      const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_KEY);

      if (!paymentCode || !layanan || !noWa) {
        return NextResponse.json(
          {
            statusCode: "400",
            statusMessage: "Missing required parameters",
          },
          { status: 400 }
        );
      }

      // Validate environment variables
      if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY) {
        console.error("Missing Duitku configuration");
        return NextResponse.json(
          {
            statusCode: "500",
            statusMessage: "Server configuration error",
          },
          { status: 500 }
        );
      }
      // Generate order IDs
      const merchantOrderId = GenerateRandomId();
      const baseUrl = process.env.NEXTAUTH_URL || "";

      return await prisma.$transaction(
        async (tx) => {
          const [productDetails] = await tx.$queryRaw<
            Array<{
              kategori_id: number;
              is_flash_sale: boolean;
              harga: number;
              harga_reseller: number;
              harga_platinum: number;
              harga_gold: number;
              harga_flash_sale: number | null;
              expired_flash_sale: Date | null;
              profit: number;
              profit_reseller: number;
              profit_platinum: number;
              profit_gold: number;
              provider_id: string;
              layanan: string;
              status: string;
              category_name: string;
              category_brand: string;
              category_id: number;
            }>
          >`
  SELECT 
    l.kategori_id,
    l.is_flash_sale,
    l.harga,
    l.harga_reseller,
    l.harga_platinum,
    l.harga_gold,
    l.harga_flash_sale,
    l.expired_flash_sale,
    l.profit,
    l.profit_reseller,
    l.profit_platinum,
    l.profit_gold,
    l.provider_id,
    l.layanan,
    l.status,
    c.nama as category_name,
    c.brand as category_brand,
    c.id as category_id
  FROM layanans l
  LEFT JOIN kategoris c ON l.kategori_id = c.id
  WHERE l.layanan = ${layanan} 
  FOR UPDATE
`;

          if (!productDetails) {
            return NextResponse.json(
              { statusCode: 404, message: "Product not found" },
              { status: 404 }
            );
          }

          const categoryDetails = {
            id: productDetails.category_id,
            name: productDetails.category_name,
            brand: productDetails.category_brand,
          };

          let price: number;
          let discountAmount = 0;
          let appliedVoucherId: number | null = null;

          if (
            productDetails.is_flash_sale &&
            productDetails.expired_flash_sale &&
            new Date(productDetails.expired_flash_sale) > new Date()
          ) {
            price = productDetails.harga_flash_sale || 0;
          } else if (session?.session?.role === "Platinum") {
            const platinumPrice = productDetails.harga_platinum;
            const flashSalePrice = productDetails.harga_flash_sale;

            if (
              productDetails.is_flash_sale &&
              productDetails.expired_flash_sale &&
              new Date(productDetails.expired_flash_sale) > new Date() &&
              (flashSalePrice ?? 0) < (platinumPrice ?? 0)
            ) {
              price = flashSalePrice ?? 0;
            } else {
              price = platinumPrice ?? 0;
            }
          } else if (session?.session?.role === "Reseller") {
            price = productDetails.harga_reseller ?? 0;
          } else if (session?.session?.role === "Gold") {
            price = productDetails.harga_gold ?? 0;
          } else {
            price = productDetails.harga ?? 0;
          }

          // Process voucher if provided
          if (voucherCode) {
            try {
              const voucherResult = await processVoucher(
                tx,
                voucherCode,
                price,
                categoryDetails
              );
              price = voucherResult.price;
              discountAmount = voucherResult.discountAmount;
              appliedVoucherId = voucherResult.appliedVoucherId;
            } catch (error) {
              return NextResponse.json(
                {
                  statusCode: 400,
                  message:
                    error instanceof Error ? error.message : `error ${error}`,
                },
                { status: 400 }
              );
            }
          }

          const paymentAmount = price;

          // Get payment method details
          const metode = await tx.method.findFirst({
            where: { code: paymentCode },
          });

          // Create transaction record
          const transaction = await tx.pembayaran.create({
            data: {
              orderId: merchantOrderId,
              metode: metode?.name ?? paymentCode,
              reference: merchantOrderId,
              status: "PENDING",
              noPembeli: noWa.toString(),
              harga: paymentAmount.toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // Get user ID if logged in
          let userId = null;
          if (session?.session?.id) {
            const userExists = await tx.users.findUnique({
              where: { id: session.session.id },
            });

            if (userExists) {
              userId = session.session.id;
            }
          }

          let Profit: number;
          if (session?.session && session.session.role === "Platinum") {
            Profit = productDetails.profit_platinum;
          } else if (session?.session && session.session.role === "Reseller") {
            Profit = productDetails.profit_reseller;
          } else if (session?.session && session.session.role === "Gold") {
            Profit = productDetails.profit_gold;
          } else {
            Profit = productDetails.profit;
          }

          await tx.$queryRaw`
          INSERT INTO pembelians (
            harga,
            layanan,
            order_id,
            profit,
            status,
            tipe_transaksi,
            username,
            user_id,
            zone,
            provider_order_id,
            nickname,
            ref_id,
            is_digi,
            success_report_sended,
            created_at,
            updated_at
          ) VALUES (
            ${paymentAmount},
            ${layanan},
            ${merchantOrderId},
            ${Profit},
            ${"PENDING"},
            ${"TOPUP"},
            ${session?.session?.username},
            ${accountId},
            ${serverId},
            ${productDetails.provider_id},
            ${nickname},
            ${merchantOrderId},
            ${true},
            ${false},
            ${new Date()},
            ${new Date()}
          )
        `;

          // Prepare WhatsApp notifications
          const invoiceLink = `${baseUrl}/invoice?invoice=${merchantOrderId}`;
          const customerName = session?.session?.username ?? "Guest";

          // Handle SALDO payment method
          if (session?.session?.id && paymentCode === "SALDO") {
            // Lock user record for balance check
            await tx.$executeRaw`SELECT * FROM users WHERE id = ${session.session.id} FOR UPDATE`;

            // Check balance
            const user = await tx.users.findUnique({
              where: { id: session.session.id },
              select: { balance: true, username: true },
            });

            if (!user || user.balance < paymentAmount) {
              return NextResponse.json(
                { statusCode: 400, message: "Saldo tidak mencukupi" },
                { status: 400 }
              );
            }

            // Process with Digiflazz
            const digiResponse = await digiflazz.TopUp({
              productCode: productDetails.provider_id as string,
              userId: accountId,
              serverId: serverId,
              reference: merchantOrderId,
            });

            // Update status based on Digiflazz response
            const digiData = digiResponse?.data;
            if (digiData) {
              const newStatus =
                digiData.status === "Pending"
                  ? "PROCESS"
                  : digiData.status === "Sukses"
                  ? "SUCCESS"
                  : "FAILED";

              if (newStatus !== "FAILED") {
                await tx.$queryRaw`
                  UPDATE pembelians 
                  SET status = "PAID", 
                      sn = ${digiData.sn},
                      profit_amount = ${paymentAmount - digiData.price},    
                      purchase_price = ${digiData.price},
                      updated_at = ${new Date()}
                  WHERE order_id = ${merchantOrderId}
                `;

                await tx.$queryRaw` 
                UPDATE pembayarans 
                  SET status = "PAID"  
                WHERE order_id = ${merchantOrderId}`

                await tx.$queryRaw`
                INSERT INTO balance_histories (
                  username,
                  balance_change,
                  balance_before,
                  balance_after,
                  change_type,
                  description_detail,
                  updated_at,
                  created_at
                ) VALUES (
                  ${user.username}, 
                  ${-paymentAmount}, 
                  ${user.balance}, 
                  ${user.balance - paymentAmount}, 
                  ${"USAGE"},       
                  ${`USAGE ${merchantOrderId} - ${layanan}`}, 
                  NOW(), 
                  NOW()
                )
              `;

                await tx.users.update({
                  where: { id: session.session.id },
                  data: { balance: { decrement: paymentAmount } },
                });

                await handleOrderStatusChange({
                  orderData: {
                    amount: paymentAmount,
                    link: invoiceLink,
                    productName: layanan,
                    status: "PAID",
                    customerName,
                    method: "SALDO",
                    orderId: merchantOrderId,
                    whatsapp: noWa.toString(),
                  },
                });
              } else {
                await tx.pembelian.update({
                  where: { orderId: merchantOrderId },
                  data: {
                    status: newStatus,
                    sn: digiData.sn,
                    updatedAt: new Date(),
                  },
                });

                await handleOrderStatusChange({
                  orderData: {
                    amount: paymentAmount,
                    link: invoiceLink,
                    productName: layanan,
                    status: "FAILED",
                    customerName,
                    method: "SALDO",
                    orderId: merchantOrderId,
                    whatsapp: noWa.toString(),
                  },
                });
              }
            }

            return NextResponse.json({
              reference: merchantOrderId,
              statusCode: "00",
              paymentUrl: `${baseUrl}/invoice?invoice=${merchantOrderId}`,
              statusMessage: "PROCESS",
              merchantOrderId: merchantOrderId,
              transactionId: transaction.id,
            });
          }

          const signature = crypto
            .createHash("md5")
            .update(
              DUITKU_MERCHANT_CODE +
                merchantOrderId +
                paymentAmount +
                DUITKU_API_KEY
            )
            .digest("hex");

          // Prepare Duitku payload
          const payload = {
            merchantCode: DUITKU_MERCHANT_CODE,
            paymentAmount: paymentAmount,
            merchantOrderId: merchantOrderId,
            productDetails: layanan,
            paymentMethod: paymentCode,
            customerVaName: nickname,
            phoneNumber: noWa,
            returnUrl: `${baseUrl}/invoice?invoice=${merchantOrderId}`,
            callbackUrl: DUITKU_CALLBACK_URL,
            signature: signature,
            expiryPeriod: DUITKU_EXPIRY_PERIOD,
          };

          try {
            // Call Duitku API
            const response = await axios.post(
              `${DUITKU_BASE_URL}/api/merchant/v2/inquiry`,
              payload,
              {
                headers: { "Content-Type": "application/json" },
              }
            );

            const data = response.data;
            let fee: number = 0;
            if (metode?.code === "NQ") {
              fee = Math.round(paymentAmount * 0.007);
            } else {
              fee = 0;
            }
            // Validate response
            if (!data.statusCode) {
              return NextResponse.json(
                {
                  success: false,
                  message: "Invalid response from payment gateway",
                },
                { status: 500 }
              );
            }

            // Categorize payment methods
            const urlPaymentMethods = ["DA", "OV", "SP", "QR"];
            const vaPaymentMethods = [
              "I1",
              "BR",
              "B1",
              "BT",
              "SP",
              "FT",
              "M2",
              "VA",
            ];

            // Prepare payment info based on method type
            let updateData = {
              updatedAt: new Date(),
              noPembayaran: "",
            };

            if (urlPaymentMethods.includes(paymentCode)) {
              updateData.noPembayaran = data.paymentUrl;
            } else if (vaPaymentMethods.includes(paymentCode)) {
              updateData.noPembayaran = data.vaNumber || "";
            } else {
              updateData.noPembayaran = data.vaNumber || data.paymentUrl || "";
            }

            await tx.$queryRaw`
          UPDATE pembayarans
          SET no_pembayaran = ${updateData.noPembayaran},
              fee = ${fee},
              updated_at = ${new Date()}
          WHERE order_id = ${merchantOrderId}
          `;
            await handleOrderStatusChange({
              orderData: {
                amount: paymentAmount,
                link: invoiceLink,
                productName: layanan,
                status: "PENDING",
                customerName,
                method: metode?.name || paymentCode,
                orderId: merchantOrderId,
                whatsapp: noWa.toString(),
              },
            });

            return NextResponse.json({
              paymentUrl: data.paymentUrl,
              reference: merchantOrderId,
              providerReference: data.reference,
              statusCode: data.statusCode,
              statusMessage: data.statusMessage,
              merchantOrderId: merchantOrderId,
              transactionId: transaction.id,
            });
          } catch (apiError: any) {
            // Update status to FAILED
            await tx.pembayaran.update({
              where: { orderId: merchantOrderId },
              data: {
                status: "FAILED",
                updatedAt: new Date(),
              },
            });

            await tx.pembelian.update({
              where: { orderId: merchantOrderId },
              data: {
                status: "FAILED",
                updatedAt: new Date(),
              },
            });

            return NextResponse.json(
              {
                statusCode: apiError.response?.status || "500",
                statusMessage:
                  apiError.response?.data?.message || "Payment gateway error",
              },
              { status: apiError.response?.status || 500 }
            );
          }
        },
        {
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Error processing transaction",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
