import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DUITKU_MERCHANT_CODE } from '../types';
import { getStatusMessage } from '../helpers';

export async function POST(req: NextRequest) {
  try {
    // Get callback data from Duitku
    let callbackData;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      callbackData = await req.json();
    } else {
      const formData = await req.formData();
      callbackData = Object.fromEntries(formData.entries());

      if (callbackData.amount) {
        callbackData.amount = callbackData.amount.toString();
      }
    }

    console.log('called callback request');
    console.log('Received callback data:', callbackData);

    // Extract important fields
    const {
      merchantCode,
      merchantOrderId,
      amount,
      signature,
      resultCode,
      reference,
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

    const depositIdMatch = merchantOrderId.match(/^DEP-(\d+)-/);
    const orderTopUp = merchantOrderId.match(/^ORD-(\d+)-/);
    const depositId = depositIdMatch ? parseInt(depositIdMatch[1]) : null;

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
        updatedAt: new Date(),
      },
    });

    // Update deposit status
    if (depositId) {
      await prisma.deposits.update({
        where: { id: depositId },
        data: { status: paymentStatus },
      });
      if (paymentStatus === 'SUCCESS') {
        const deposit = await prisma.deposits.findUnique({
          where: { id: depositId },
        });

        if (deposit) {
          await prisma.users.update({
            where: { id: deposit.userId },
            data: {
              balance: {
                increment: deposit.amount,
              },
            },
          });
        }
      }
    }

    if (orderTopUp) {
      const userId =
        transaction.userId || `guest_${transaction.merchantOrderId}`;

      await prisma.users.findUnique({
        where: { id: userId },
      });

      await prisma.invoices.create({
        data: {
          invoiceNumber: `INV-${merchantOrderId}`,
          transactionId: transaction.id,
          userId,
          subtotal: transaction.originalAmount,
          discountAmount: transaction.discountAmount,
          totalAmount: transaction.finalAmount,
          status: 'PAID',
          dueDate: new Date(),
          paymentDate: new Date(),
          notes: `Payment for service ID: ${transaction.layananId}`,
          termsAndConditions: 'Standard terms and conditions apply.',
        },
      });
    }

    // Return success response to Duitku
    return NextResponse.json({ success: true });
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
