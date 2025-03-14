import crypto from 'crypto';

export async function POST(req: Request) {
  const username = process.env.DIGI_USERNAME as string;
  const DIGI_API_KEY = process.env.DIGI_API_KEY as string;

  try {
    const { categoryCode, layananId, whatsapp } = await req.json();

    // Generate signature (md5 hash of username + api_key + ref_id)
    const refId = `TRX-${Date.now()}`;
    const signature = crypto
      .createHash('md5')
      .update(username + DIGI_API_KEY + refId)
      .digest('hex');

    // Prepare request data
    const data = {
      username,
      buyer_sku_code: layananId,
      customer_no: whatsapp,
      ref_id: refId,
      sign: signature,
    };

    // Send request to Digiflazz API
    const response = await fetch('https://api.digiflazz.com/v1/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result);

    // Return the result
    return Response.json(result);
  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
