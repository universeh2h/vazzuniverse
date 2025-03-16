import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';
import {
  DUITKU_BASE_URL,
  DUITKU_CALLBACK_URL,
  DUITKU_EXPIRY_PERIOD,
  DUITKU_MERCHANT_CODE,
  DUITKU_RETURN_URL,
  DUTIKU_API_KEY,
} from '../types';

export type RequestPayment = {
  noWa: string;
  layanan: string;
  paymentCode: string;
  accountId: string;
  serverId: string;
  voucherCode?: string;
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
      accountId,
      serverId,
    }: RequestPayment = body;

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
    } else if (session?.user?.role === 'Platinum') {
      price = productDetails.hargaPlatinum;
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
    if (!DUITKU_MERCHANT_CODE || !DUTIKU_API_KEY) {
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
    const randomStr = Math.random().toString(36).substring(2, 8);
    const merchantOrderId = 'ORD-' + Date.now() + '-' + randomStr;

    const transactionData = {
      merchantOrderId,
      layananId: productDetails.id,
      categoryId: categoryDetails.id,
      transactionType: 'Top-up',
      originalAmount: productDetails.harga,
      discountAmount,
      finalAmount: price,
      paymentStatus: 'PENDING',
      paymentCode,

      noWa,
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
    console.log(transactionData);
    if (appliedVoucherId) {
      Object.assign(transactionData, { voucherId: appliedVoucherId });
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        transactionType: 'Top up',
        accountId,
        serverId,
      },
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
      .update(
        DUITKU_MERCHANT_CODE + merchantOrderId + paymentAmount + DUTIKU_API_KEY
      )
      .digest('hex');

    const payload = {
      merchantCode: DUITKU_MERCHANT_CODE,
      paymentAmount: paymentAmount,
      merchantOrderId: merchantOrderId,
      productDetails: 'Pembayaran #' + merchantOrderId,
      email: 'wafiuddin@gmail.com',
      paymentMethod: paymentCode,
      customerVaName: 'vazzuniverse',
      phoneNumber: noWa,
      returnUrl: `${DUITKU_RETURN_URL}`,
      callbackUrl: DUITKU_CALLBACK_URL,
      signature: signature,
      expiryPeriod: DUITKU_EXPIRY_PERIOD,
    };

    console.log('Sending payload to Duitku:', payload);

    try {
      const response = await axios.post(
        `${DUITKU_BASE_URL}/api/merchant/v2/inquiry`,
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
      if (data.statusCode === '00') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentReference: data.reference,
            paymentUrl: data.paymentUrl,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  } catch (error) {
    console.error('Callback processing error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing callback',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
