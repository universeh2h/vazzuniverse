import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '../../../../../auth';
import { findUserById } from '@/app/(auth)/_components/api';
import {
  DUITKU_BASE_URL,
  DUITKU_CALLBACK_URL,
  DUITKU_EXPIRY_PERIOD,
  DUITKU_MERCHANT_CODE,
  DUITKU_RETURN_URL,
  DUTIKU_API_KEY,
} from '../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, code } = body;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await findUserById(session.user.id as string);

    if (!user) {
      return NextResponse.json({ error: 'User not Found' }, { status: 404 });
    }

    // Find payment method
    const method = await prisma.methods.findFirst({
      where: {
        code,
      },
      select: {
        name: true,
      },
    });

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    const deposit = await prisma.deposits.create({
      data: {
        userId: user.id as string,
        method: method.name,
        status: 'PENDING',
        username: user?.username,
        amount,
      },
    });
    const timestamp = Math.floor(Date.now() / 1000);

    const merchantOrderId = `DEP-${deposit.id}-${Date.now()}`;

    const paymentAmount = amount.toString();

    const signature = crypto
      .createHash('md5')
      .update(
        DUITKU_MERCHANT_CODE + merchantOrderId + paymentAmount + DUTIKU_API_KEY
      )
      .digest('hex');

    await prisma.transaction.create({
      data: {
        merchantOrderId,
        userId: user.id,
        originalAmount: amount,
        discountAmount: 0,
        finalAmount: amount,
        paymentStatus: 'PENDING',
        paymentCode: code,
        paymentUrl: null,
        noWa: user.whatsapp,
        statusMessage: null,
      },
    });

    const duitkuPayload = {
      merchantCode: DUITKU_MERCHANT_CODE,
      merchantOrderId: merchantOrderId,
      paymentAmount: amount,
      paymentMethod: code,
      productDetails: `Deposit for ${'wafiuddin'}`,
      email: user.username + '@gmail.com',
      customerVaName: 'wafiuddin',
      callbackUrl: DUITKU_CALLBACK_URL,
      returnUrl: DUITKU_RETURN_URL,
      signature: signature,
      expiryPeriod: DUITKU_EXPIRY_PERIOD,
      additionalParam: '',
      merchantUserInfo: '',
      accountLink: '',
      timestamp: timestamp,
    };

    const duitkuResponse = await fetch(
      `${DUITKU_BASE_URL}/api/merchant/v2/inquiry`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duitkuPayload),
      }
    );

    const paymentData = await duitkuResponse.json();

    if (paymentData.statusCode !== '00') {
      await prisma.deposits.update({
        where: { id: deposit.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        {
          error: 'Failed to create payment',
          details: paymentData.statusMessage,
        },
        { status: 400 }
      );
    }

    // Update transaction with payment URL
    await prisma.transaction.update({
      where: { merchantOrderId },
      data: { paymentUrl: paymentData.paymentUrl },
    });

    // For direct redirect, return a Response object with status 302 (Found/Redirect)
    return NextResponse.json({
      paymentUrl: paymentData.paymentUrl,
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
