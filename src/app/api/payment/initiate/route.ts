import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';

const MERCHANT_CODE = '9ecc7819ac45c6f63e4351e0329dc123';
const API_KEY = 'D16328';
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://passport.duitku.com/webapi'
    : 'https://sandbox.duitku.com/webapi';
const CALLBACK_URL =
  'https://67e9-2001-448a-2012-25ed-6aa5-4848-6b37-2107.ngrok-free.app/api/payment/callback';
const RETURN_URL =
  'https://67e9-2001-448a-2012-25ed-6aa5-4848-6b37-2107.ngrok-free.app/payment/check-status';
const EXPIRY_PERIOD = 60 * 24;

export type RequestPayment = {
  noWa: string;
  layanan: string;
  paymentCode: string;
};

export async function POST(req: NextRequest) {
  try {
    // Dapatkan body dari request
    const body = await req.json();
    console.log(body);

    const session = await auth();
    const {
      layanan,
      paymentCode,
      noWa,
      voucherCode,
    }: RequestPayment & { voucherCode?: string } = body;

    // Fetch the service details
    const productDetails = await prisma.layanan.findFirst({
      where: { layanan },
    });

    if (!productDetails) {
      return NextResponse.json(
        { statusCode: 404, message: 'Product NotFound' },
        { status: 404 }
      );
    }

    // Get category details for voucher validation
    const categoryDetails = await prisma.categories.findFirst({
      where: { id: parseInt(productDetails.kategoriId) },
    });

    if (!categoryDetails) {
      return NextResponse.json(
        { statusCode: 404, message: 'Category NotFound' },
        { status: 404 }
      );
    }

    // Base price calculation
    let price: number;
    let discountAmount = 0;
    let appliedVoucherId: number | null = null;

    if (
      productDetails.isFlashSale &&
      productDetails.expiredFlashSale &&
      new Date(productDetails.expiredFlashSale) > new Date()
    ) {
      price = productDetails.hargaFlashSale || 0;
    } else if (session?.user?.role === 'platinum') {
      price = productDetails.hargaPlatinum;
    } else if (session?.user?.role === 'gold') {
      price = productDetails.hargaGold;
    } else {
      price = productDetails.harga;
    }

    // Apply voucher if provided
    if (voucherCode) {
      const voucher = await prisma.voucher.findFirst({
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

      if (voucher) {
        // Check if usage limit is reached
        if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
          return NextResponse.json(
            { statusCode: 400, message: 'Voucher usage limit reached' },
            { status: 400 }
          );
        }

        // Check if minimum purchase requirement is met
        if (voucher.minPurchase && price < voucher.minPurchase) {
          return NextResponse.json(
            {
              statusCode: 400,
              message: `Minimum purchase of ${voucher.minPurchase} required for this voucher`,
            },
            { status: 400 }
          );
        }

        // Check if voucher is applicable to this category
        const isApplicable =
          voucher.isForAllCategories ||
          voucher.categories.some((vc) => vc.categoryId === categoryDetails.id);

        if (isApplicable) {
          // const originalPrice = price;

          if (voucher.discountType === 'PERCENTAGE') {
            // Apply percentage discount
            discountAmount = (price * voucher.discountValue) / 100;
            if (voucher.maxDiscount) {
              discountAmount = Math.min(discountAmount, voucher.maxDiscount);
            }
          } else {
            discountAmount = voucher.discountValue;
          }

          price = Math.max(0, price - discountAmount);
          appliedVoucherId = voucher.id;
        } else {
          return NextResponse.json(
            {
              statusCode: 400,
              message: 'Voucher not applicable to this product category',
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { statusCode: 400, message: 'Invalid or expired voucher code' },
          { status: 400 }
        );
      }
    }

    // Validasi input
    if (!paymentCode || !layanan || !noWa) {
      return NextResponse.json(
        {
          statusCode: '400',
          statusMessage: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!MERCHANT_CODE || !API_KEY) {
      console.error('Missing Duitku configuration');
      return NextResponse.json(
        {
          statusCode: '500',
          statusMessage: 'Server configuration error',
        },
        { status: 500 }
      );
    }

    // Generate signature
    const merchantOrderId = 'ORD-' + Date.now();

    // Updated signature generation
    const priceForSignature = Math.floor(price); // Jika perlu bulatkan ke bawah
    // atau
    // const priceForSignature = price.toFixed(0); // Jika perlu format tanpa desimal

    // Generate signature - tambahkan log untuk debugging
    const rawSignature =
      MERCHANT_CODE + merchantOrderId + priceForSignature + API_KEY;
    console.log('Raw signature input:', rawSignature);

    // Prepare transaction data
    const transactionData = {
      merchantOrderId,
      layananId: productDetails.id,
      categoryId: categoryDetails.id,
      originalAmount: productDetails.harga,
      discountAmount,
      finalAmount: price,
      paymentStatus: 'PENDING',
      paymentCode,
      noWa,
      createdAt: new Date(),
    };

    // Add userId only if a user is logged in
    if (session?.user?.id) {
      // Check if user exists first
      const userExists = await prisma.users.findUnique({
        where: { id: session.user.id },
      });

      if (userExists) {
        Object.assign(transactionData, { userId: session.user.id });
      }
    }

    // Add voucher only if it was applied
    if (appliedVoucherId) {
      Object.assign(transactionData, { voucherId: appliedVoucherId });
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: transactionData,
    });

    // If voucher is applied, increment its usage count
    if (appliedVoucherId) {
      await prisma.voucher.update({
        where: { id: appliedVoucherId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Buat payload untuk Duitku API
    const paymentAmount = price; // Gunakan nama variabel yang sama seperti kode berhasil

    // Updated signature generation
    const signature = crypto
      .createHash('md5')
      .update(MERCHANT_CODE + merchantOrderId + paymentAmount + API_KEY)
      .digest('hex');

    const payload = {
      merchantCode: MERCHANT_CODE,
      paymentAmount: paymentAmount,
      merchantOrderId: merchantOrderId,
      productDetails: 'Pembayaran #' + merchantOrderId,
      email: 'wafiuddin@gmail.com',
      paymentMethod: paymentCode,
      customerVaName: 'vazzuniverse',
      phoneNumber: noWa,
      returnUrl: `${RETURN_URL}/${merchantOrderId}`,
      callbackUrl: CALLBACK_URL,
      signature: signature,
      expiryPeriod: EXPIRY_PERIOD,
    };

    console.log('Sending payload to Duitku:', payload);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/merchant/v2/inquiry`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Duitku API response:', response.data);
      const data = response.data;

      // Check for valid response
      if (!data.statusCode) {
        return {
          success: false,
          message: 'Invalid response from API: ' + JSON.stringify(data),
        };
      }

      // Check for error status
      if (data.statusCode !== '00') {
        return {
          success: false,
          message: 'Error from API: ' + data.statusMessage,
        };
      }

      // Update transaction with payment reference
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          paymentReference: data.reference,
          paymentUrl: data.paymentUrl,
          paymentStatus: data.statusMessage,
        },
      });

      // Return appropriate data based on payment method
      if (
        ['DA', 'SA', 'OV', 'OL', 'LA', 'FT', 'NQ', 'SP'].includes(paymentCode)
      ) {
        return {
          success: true,
          paymentUrl: data.paymentUrl,
          reference: data.reference,
          amount: data.amount || paymentAmount,
          data: data,
          statusCode: data.statusCode,
          statusMessage: data.statusMessage,
          merchantOrderId: merchantOrderId,
          transactionId: transaction.id,
        };
      } else {
        return {
          success: true,
          no_pembayaran: data.vaNumber,
          reference: data.reference,
          amount: data.amount || paymentAmount,
          data: data,
          statusCode: data.statusCode,
          statusMessage: data.statusMessage,
          merchantOrderId: merchantOrderId,
          transactionId: transaction.id,
        };
      }

      // Update transaction with payment reference
      if (data.statusCode === '00') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentReference: data.reference,
            paymentUrl: data.paymentUrl,
            paymentStatus: data.statusMessage,
          },
        });

        return NextResponse.json({
          paymentUrl: data.paymentUrl,
          reference: data.reference,
          statusCode: data.statusCode,
          statusMessage: data.statusMessage,
          merchantOrderId: merchantOrderId,
          transactionId: transaction.id,
        });
      } else {
        // Update transaction status to failed
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: 'FAILED',
            statusMessage: data.statusMessage,
          },
        });

        return NextResponse.json(
          {
            statusCode: data.statusCode,
            statusMessage: data.statusMessage,
          },
          { status: 400 }
        );
      }
    } catch (apiError: any) {
      console.error('Duitku API error:', apiError.message);
      console.error('Response data:', apiError.response?.data);

      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          paymentStatus: 'FAILED',
          statusMessage:
            apiError.response?.data?.message || 'Payment gateway error',
        },
      });

      return NextResponse.json(
        {
          statusCode: apiError.response?.status || '500',
          statusMessage:
            apiError.response?.data?.message || 'Payment gateway error',
        },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      {
        statusCode: '500',
        statusMessage: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
