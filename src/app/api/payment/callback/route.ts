import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Digiflazz } from "@/lib/digiflazz";
import { DIGI_KEY, DIGI_USERNAME, DUITKU_MERCHANT_CODE } from "@/constants";
import { handleOrderStatusChange } from "@/lib/whatsapp-message";

export async function POST(req: NextRequest) {
  try {
    let callbackData;
    const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_KEY);

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      callbackData = await req.json();
    } else {
      const formData = await req.formData();
      callbackData = Object.fromEntries(formData.entries());

      if (callbackData.amount) {
        callbackData.amount = callbackData.amount.toString();
      }
    }

    const {
      merchantCode,
      amount,
      merchantOrderId,
      resultCode,
      signature,
    } = callbackData;
    const baseUrl = process.env.NEXTAUTH_URL || "";

    const invoiceLink = `${baseUrl}/invoice?invoice=${merchantOrderId}`;

    if (
      !merchantCode ||
      !merchantOrderId ||
      !amount ||
      !signature ||
      !resultCode
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate merchantCode
    if (merchantCode !== DUITKU_MERCHANT_CODE) {
      return NextResponse.json(
        { success: false, message: "Invalid merchant code" },
        { status: 400 }
      );
    }

    // Using Prisma transaction for all database operations
    return await prisma.$transaction(
      async (tx) => {
        const orderTopUp = merchantOrderId.match(/^VAZ-(\d+)/);
        if (orderTopUp) {
          // Find the pembelian record
          const pembelian = await tx.pembelian.findFirst({
            where: {
              orderId: merchantOrderId,
            },
          });

          if (pembelian && pembelian.status === "SUCCESS") {
            return NextResponse.json({
              success: true,
              message: "Order already processed",
              data: { orderId: merchantOrderId, status: pembelian.status },
            });
          }

         

          const pembayaran = await tx.pembayaran.findFirst({
            where: {
              orderId: merchantOrderId,
            },
          });
          if (pembayaran) {
            await tx.pembayaran.update({
              where: {
                orderId: merchantOrderId,
              },
              data: {
                status: "PAID",
                updatedAt: new Date(),
              },
            });
          }
          
          if (pembelian) {
            const reqtoDigi = await digiflazz.TopUp({
              productCode: pembelian?.providerOrderId as string,
              userId: pembelian.userId as string,
              reference: merchantOrderId as string,
              serverId: pembelian.zone as string,
            });

            const datas = reqtoDigi?.data;
            if (datas) {
              const newStatus =
                datas.status === "Pending"
                  ? "PROCESS"
                  : datas.status === "Sukses"
                  ? "SUCCESS"
                  : "FAILED";

              if (newStatus !== "FAILED") {
                 let purchaseDuitku = pembelian.harga as number;
                if (
                  pembayaran?.metode === "QRIS ( All Payment )" ||
                  pembayaran?.metode === "NQ"
                ) {
                  const fee = Math.round(pembelian.harga * (0.7 / 100));
                  purchaseDuitku = pembelian.harga - fee;
                }
                
              await tx.$queryRaw`
                  UPDATE pembelians 
                  SET sn = ${datas.sn}, 
                      purchase_price = ${datas.price},
                      profit_amount = ${purchaseDuitku - datas.price},
                      updated_at = ${new Date()}
                  WHERE order_id = ${merchantOrderId}
                `;
              } else {
                if (pembelian.username) {
                  const user = await tx.users.findUnique({
                    where: {
                      username: pembelian.username,
                    },
                  });

                  let logMessage;

                  if (user) {
                    let saldo = pembelian.harga as number;
                    if (
                      pembayaran?.metode === "QRIS ( All Payment )" ||
                      pembayaran?.metode === "NQ"
                    ) {
                      const fee = Math.round(pembelian.harga * (0.7 / 100));
                      saldo = pembelian.harga - fee;
                    }

                   
                    await tx.users.update({
                      where: {
                        username: user.username,
                      },
                      data: {
                        balance: { increment: saldo },
                      },
                    });

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
                        ${pembelian.username}, 
                        ${saldo}, 
                        ${user.balance}, 
                        ${user.balance + saldo}, 
                        ${"REFUND"},       
                        ${`REFUND ${pembelian.orderId} via ${pembayaran?.metode}`}, 
                        NOW(), 
                        NOW()
                      )
                    `
                    logMessage =
                      "Transaksi gagal, saldo otomatis dikembalikan ke Saldo Akun";
                  } else {
                    logMessage = "Transaksi gagal, Silahkan Hubungi Admin!";
                  }



                  await tx.pembelian.update({
                    where: { orderId: merchantOrderId },
                    data: {
                      status: newStatus,
                      log: logMessage,
                      successReportSended: true,
                      updatedAt: new Date(),
                    },
                  });

                  // Handle order status change notification
                  await handleOrderStatusChange({
                    orderData: {
                      amount: pembelian?.harga,
                      link: invoiceLink,
                      productName: pembelian.layanan,
                      status: "FAILED",
                      customerName: pembelian?.nickname ?? "",
                      method: pembayaran?.metode,
                      orderId: merchantOrderId,
                      whatsapp: pembayaran?.noPembeli?.toString(),
                    },
                  });
                } else {
                  await tx.pembelian.update({
                    where: { orderId: merchantOrderId },
                    data: {
                      status: newStatus,
                      log: "Transaksi gagal, tidak dapat mengembalikan saldo ",
                      successReportSended: true,
                      updatedAt: new Date(),
                    },
                  });
                  await handleOrderStatusChange({
                    orderData: {
                      amount: pembelian?.harga,
                      link: invoiceLink,
                      productName: pembelian.layanan,
                      status: "FAILED",
                      customerName: pembelian?.nickname ?? "",
                      method: pembayaran?.metode,
                      orderId: merchantOrderId,
                      whatsapp: pembayaran?.noPembeli?.toString(),
                    },
                  });
                }
              }
            }
          } else {
            return NextResponse.json(
              {
                success: false,
                message: "Layanan or pembelian not found",
              },
              { status: 200 }
            );
          }
        }

        return NextResponse.json({ success: true });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error processing callback",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
