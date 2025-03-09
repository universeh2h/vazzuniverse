import { ORDER_ID, URL_MIDTRANS_CHARGE } from '../cons';

export const SERVER_KEY = process.env.SERVER_KEY;

export type RequestBody = {
  productName: string;
  noWa: string;
  amount: number;
  paymentMethod: string;
  bankCode?: string;
};

export async function POST(req: Request) {
  try {
    const { productName, amount, paymentMethod, bankCode, noWa }: RequestBody =
      await req.json();
    console.log(req.json);

    const transactionDetails = {
      transaction_details: {
        order_id: ORDER_ID,
        gross_amount: amount,
      },
      item_details: [
        {
          id: 'item1',
          price: amount,
          quantity: 1,
          name: productName,
        },
      ],
      customer_details: {
        phone: noWa,
      },
    };

    // Konfigurasi berdasarkan metode pembayaran
    let paymentDetails = {};

    if (paymentMethod === 'bank_transfer') {
      paymentDetails = {
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: bankCode,
        },
      };
    } else if (paymentMethod === 'gopay') {
      paymentDetails = {
        payment_type: 'gopay',
      };
    } else if (paymentMethod === 'qris') {
      paymentDetails = {
        payment_type: 'qris',
      };
    } else if (paymentMethod === 'credit_card') {
      paymentDetails = {
        payment_type: 'credit_card',
      };
    }

    // Gabungkan detail pembayaran dan transaksi
    const requestBody = {
      ...transactionDetails,
      ...paymentDetails,
    };

    // Authentication untuk Midtrans
    const authString = Buffer.from(`${SERVER_KEY}:`).toString('base64');

    // Panggil API Midtrans
    const response = await fetch(URL_MIDTRANS_CHARGE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Dapatkan response dari Midtrans
    const data = await response.json();
    console.log(data);

    return Response.json({
      success: true,
      order_id: ORDER_ID,
      payment_method: paymentMethod,
      payment_details: data,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to process payment',
      },
      { status: 500 }
    );
  }
}
