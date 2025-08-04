import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { DUITKU_API_KEY, DUITKU_MERCHANT_CODE } from '@/constants';
import { findUserById, getProfile } from '@/app/(auth)/auth/components/server';
import { Duitku } from '../duitku/duitku';
import { GenerateRandomId } from '@/utils/generateRandomId';

interface PaymentMethod {
  name: string;
  code: string;
}

interface DuitkuResponse {
  statusCode: string;
  statusMessage: string;
  paymentUrl?: string;
  vaNumber?: string;
  reference?: string;
  qrString?: string;
}

interface CreateDepositRequest {
  amount: number;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateDepositRequest = await req.json();
    const { amount, code } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', statusCode: 400 },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Payment method code is required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Check user session
    const session = await getProfile();
    if (!session?.session.id) {
      return NextResponse.json(
        { error: 'Unauthorized', statusCode: 401 },
        { status: 401 }
      );
    }

    // Get user data
    const user = await findUserById(session.session.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', statusCode: 404 },
        { status: 404 }
      );
    }

    // Get payment method
    const method = await getPaymentMethod(code);
    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found', statusCode: 404 },
        { status: 404 }
      );
    }

    // Generate order ID and signature
    const noPembayaran = GenerateRandomId('DEP');
    const { signature, timestamp } = generateDuitkuSignature(noPembayaran, amount);

    // Initialize Duitku
    const duitku = new Duitku();

    // Hit Duitku API first
    console.log('Creating payment in Duitku...');
    const paymentData = await createDuitkuPayment(duitku, {
      amount,
      code,
      merchantOrderId: noPembayaran,
      productDetails: `Deposit for ${user.username}`,
      signature,
      timestamp,
      username: user.username,
    });

    // Check Duitku response
    if (paymentData.statusCode !== '00') {
      console.error('Duitku payment creation failed:', paymentData);
      return NextResponse.json(
        {
          error: 'Payment creation failed',
          message: paymentData.statusMessage,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const paymentInfo = extractPaymentInfo(paymentData, method.code);

    const deposit = await createDepositRecord({
      username: user.username,
      metode: method.name,
      jumlah: amount,
      noPembayaran: paymentInfo.displayNumber,
      depositId: noPembayaran,
      status: 'PENDING', 
    });

    console.log('Deposit created successfully:', deposit.id);

    return NextResponse.json({
      success: true,
      statusCode: 201,
      data: {
        deposit: {
          id: deposit.id,
          depositId: deposit.depositId,
          amount: deposit.jumlah,
          method: deposit.metode,
          status: deposit.status,
          noPembayaran: deposit.noPembayaran,
          createdAt: deposit.createdAt,
        },
        payment: {
          paymentUrl: paymentData.paymentUrl,
          vaNumber: paymentData.vaNumber,
          qrString: paymentData.qrString,
          reference: paymentData.reference,
        },
      },
    });

  } catch (error) {
    console.error('Deposit creation error:', error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Payment processing failed',
          message: error.message,
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

// Helper function to get payment method
async function getPaymentMethod(code: string): Promise<PaymentMethod | null> {
  try {
    const method = await prisma.method.findFirst({
      where: { code },
      select: { name: true, code: true },
    });
    
    return method;
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return null;
  }
}

// Helper function to generate Duitku signature
function generateDuitkuSignature(merchantOrderId: string, amount: number) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paymentAmount = amount.toString();
  
  const signature = crypto
    .createHash('md5')
    .update(DUITKU_MERCHANT_CODE + merchantOrderId + paymentAmount + DUITKU_API_KEY)
    .digest('hex');

  return { signature, timestamp };
}

// Helper function to create payment in Duitku
async function createDuitkuPayment(
  duitku: Duitku,
  params: {
    amount: number;
    code: string;
    merchantOrderId: string;
    productDetails: string;
    signature: string;
    timestamp: number;
    username: string;
  }
): Promise<DuitkuResponse> {
  try {
    const paymentData = await duitku.Create({
      amount: params.amount,
      code: params.code,
      merchantOrderId: params.merchantOrderId,
      productDetails: params.productDetails,
      callbackUrl : `${process.env.NEXTAUTH_URL}/api/deposit/callback`,
      sign: params.signature,
      time: params.timestamp,
      username: params.username,
      returnUrl: `${process.env.NEXTAUTH_URL}/profile`,
    });

    return paymentData;
  } catch (error) {
    console.error('Duitku API error:', error);
    throw new Error(`Failed to create payment in Duitku: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to extract payment info based on method type
function extractPaymentInfo(paymentData: DuitkuResponse, methodCode: string) {
  const urlPaymentMethods = ['DA', 'OV', 'SA', 'QR'];
  const vaPaymentMethods = ['I1', 'BR', 'B1', 'BT', 'SP', 'FT', 'M2', 'VA'];
  
  let displayNumber = '';
  
  if (urlPaymentMethods.includes(methodCode)) {
    displayNumber = paymentData.paymentUrl || '';
  } else if (vaPaymentMethods.includes(methodCode)) {
    displayNumber = paymentData.vaNumber || '';
  } else {
    // Fallback: try vaNumber first, then paymentUrl
    displayNumber = paymentData.vaNumber || paymentData.vaNumber || paymentData.qrString || '';
  }

  return {
    displayNumber,
    paymentUrl: paymentData.paymentUrl,
    vaNumber: paymentData.vaNumber,
    qrString: paymentData.qrString,
    reference: paymentData.reference,
  };
}

// Helper function to create deposit record in database
async function createDepositRecord(depositData: {
  username: string;
  metode: string;
  jumlah: number;
  noPembayaran: string;
  depositId: string;
  status: string;
}) {
  try {
    const deposit = await prisma.deposits.create({
      data: {
        username: depositData.username,
        metode: depositData.metode,
        status: depositData.status,
        jumlah: depositData.jumlah,
        noPembayaran: depositData.noPembayaran,
        depositId: depositData.depositId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return deposit;
  } catch (error) {
    console.error('Database insert error:', error);
    throw new Error('Failed to create deposit record in database');
  }
}