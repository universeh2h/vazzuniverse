// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { DUITKU_MERCHANT_CODE, DUTIKU_API_KEY } from '../types';

export async function POST(req: NextRequest) {
  try {
    // Get callback data from Duitku
    let callbackData;

    // Try to parse as JSON first
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      callbackData = await req.json();
    } else {
      // Handle form data
      const formData = await req.formData();
      callbackData = Object.fromEntries(formData.entries());

      // Convert amount to string if it exists (to match expected format)
      if (callbackData.amount) {
        callbackData.amount = callbackData.amount.toString();
      }
    }

    console.log('called callback request');
    console.log('Received callback data:', callbackData);

    // Extract important fields
    const {
      wwmerchantCode,
      merchantOrderId,
      amount,
      signature,
      resultCode,
      reference,
      settlementDate,
    } = callbackData;

    // Validate required fields
    if (
      !merchantCode ||
      !merchantOrderId ||
      !amount ||
      !signature ||
      !resultCode
    ) {
      console.error('Missing required fields in callback data');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate merchantCode
    if (merchantCode !== DUITKU_MERCHANT_CODE) {
      console.error('Invalid merchant code:', merchantCode);
      return NextResponse.json(
        { success: false, message: 'Invalid merchant code' },
        { status: 400 }
      );
    }

    // Validate signature
    const expectedSignature = crypto
      .createHash('md5')
      .update(
        merchantCode + merchantOrderId + amount + resultCode + DUTIKU_API_KEY
      )
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Get transaction by merchantOrderId
    const transaction = await prisma.transaction.findUnique({
      where: { merchantOrderId },
    });

    if (!transaction) {
      console.error('Transaction not found:', merchantOrderId);
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Get deposit ID from merchantOrderId (assuming format: DEP-{depositId}-{timestamp})
    const depositIdMatch = merchantOrderId.match(/^DEP-(\d+)-/);
    const depositId = depositIdMatch ? parseInt(depositIdMatch[1]) : null;

    if (!depositId) {
      console.error('Could not extract deposit ID from:', merchantOrderId);
      return NextResponse.json(
        { success: false, message: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Map Duitku result code to payment status
    let paymentStatus = 'PENDING';
    if (resultCode === '00' || resultCode === '0') {
      paymentStatus = 'SUCCESS';
    } else if (resultCode === '01') {
      paymentStatus = 'PENDING';
    } else {
      paymentStatus = 'FAILED';
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { merchantOrderId },
      data: {
        paymentStatus,
        paymentReference: reference || transaction.paymentReference,
        statusMessage: getStatusMessage(resultCode),
        updatedAt: settlementDate || null,
      },
    });

    // Update deposit status
    if (depositId) {
      await prisma.deposits.update({
        where: { id: depositId },
        data: { status: paymentStatus },
      });

      // If payment is successful, you might want to update user balance
      if (paymentStatus === 'SUCCESS') {
        const deposit = await prisma.deposits.findUnique({
          where: { id: depositId },
        });

        if (deposit) {
          // Update user balance (assuming you have a balance field in your user model)
          await prisma.users.update({
            where: { id: deposit.userId },
            data: {
              balance: {
                increment: deposit.amount,
              },
            },
          });

          // You could also log this transaction in a separate table if needed
          // await prisma.balanceHistory.create({ ... })
        }
      }
    }

    // Return success response to Duitku
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback processing error:', error);

    // Always return 200 status to Duitku even if there's an error
    // This prevents Duitku from retrying the callback repeatedly
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

// Helper function to get a readable status message
function getStatusMessage(resultCode: string): string {
  switch (resultCode) {
    case '00':
    case '0':
      return 'Pembayaran Berhasil';
    case '01':
      return 'Pembayaran Pending';
    case '02':
      return 'Pembayaran Gagal';
    case '03':
      return 'Pembayaran Expired';
    default:
      return 'Status Tidak Diketahui';
  }
}
