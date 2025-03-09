import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE;
const API_KEY = process.env.DUITKU_API_KEY;
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://passport.duitku.com/webapi'
    : 'https://sandbox.duitku.com/webapi';
const CALLBACK_URL =
  process.env.DUITKU_CALLBACK_URL ||
  'https://5ff4-180-252-124-111.ngrok-free.app/api/payment/callback';
const RETURN_URL =
  process.env.DUITKU_RETURN_URL ||
  'https://5ff4-180-252-124-111.ngrok-free.app/payment/check-status';
const EXPIRY_PERIOD = 60 * 24;

export async function POST(req: NextRequest) {
  try {
    // Dapatkan body dari request
    const body = await req.json();
    console.log(body);

    const {
      paymentAmount,
      productDetails,
      email,
      paymentMethod,
      additionalParam,
    } = body;

    // Validasi input
    if (!paymentAmount || !productDetails || !email || !paymentMethod) {
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
    const signature = crypto
      .createHash('md5')
      .update(MERCHANT_CODE + merchantOrderId + paymentAmount + API_KEY)
      .digest('hex');

    // Buat payload untuk Duitku API
    const payload = {
      merchantCode: MERCHANT_CODE,
      paymentAmount,
      merchantOrderId,
      productDetails,
      email,
      paymentMethod,
      additionalParam,
      merchantUserInfo: email,
      customerVaName: email.split('@')[0],
      callbackUrl: CALLBACK_URL,
      returnUrl: RETURN_URL,
      expiryPeriod: EXPIRY_PERIOD,
      signature,
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

      // Respons ke client
      if (data.statusCode === '00') {
        return NextResponse.json({
          paymentUrl: data.paymentUrl,
          reference: data.reference,
          statusCode: data.statusCode,
          statusMessage: data.statusMessage,
          merchantOrderId: merchantOrderId,
        });
      } else {
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

      return NextResponse.json(
        {
          statusCode: apiError.response?.status || '500',
          statusMessage:
            apiError.response?.data?.message || 'Payment gateway error',
        },
        { status: apiError.response?.status || 500 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
