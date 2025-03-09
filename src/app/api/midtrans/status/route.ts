import { NextResponse } from 'next/server';

export const SERVER_KEY = process.env.SERVER_KEY;
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const order_id = searchParams.get('order_id');

  if (!order_id) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    const auth = `Basic ${Buffer.from(SERVER_KEY + ':').toString('base64')}`;

    const response = await fetch(
      `https://api.sandbox.midtrans.com/v2/${order_id}/status`,
      {
        method: 'GET',
        headers: { Authorization: auth },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Midtrans Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
