import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE;
const API_KEY = process.env.DUITKU_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      merchantCode,
      amount,
      merchantOrderId,

      resultCode,
      reference,
      signature,
    } = body;

    // Validasi signature
    const expectedSignature = generateCallbackSignature(
      merchantCode,
      amount,
      merchantOrderId,
      reference
    );

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Validasi merchant code
    if (merchantCode !== MERCHANT_CODE) {
      console.error('Invalid merchant code');
      return NextResponse.json(
        { message: 'Invalid merchant code' },
        { status: 400 }
      );
    }

    // Cek status pembayaran
    if (resultCode === '00') {
      return NextResponse.json({ message: 'Payment successful' });
    } else {
      return NextResponse.json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fungsi untuk generate signature callback
function generateCallbackSignature(
  merchantCode: string,
  amount: string,
  merchantOrderId: string,
  reference: string
): string {
  if (!API_KEY) {
    throw new Error('Missing Duitku API key');
  }

  const plainSignature =
    merchantCode + amount + merchantOrderId + reference + API_KEY;
  return crypto.createHash('md5').update(plainSignature).digest('hex');
}
