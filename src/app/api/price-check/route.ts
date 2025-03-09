import { NextResponse } from 'next/server';
import { Digiflazz } from '@/lib/digiflazz';

export async function GET() {
  try {
    const username = process.env.DIGI_USERNAME as string;
    const apiKey = process.env.DIGI_API_KEY as string;
    const digiflazz = new Digiflazz(username, apiKey);

    try {
      // Get the full price list
      const result = await digiflazz.checkPrice();

      // Filter only Mobile Legends products
      if (result && result.data) {
        return NextResponse.json({
          status: result.status,
          data: result.data,
        });
      }

      return NextResponse.json(result);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (priceError) {
      try {
        const prepaidResult = await digiflazz.checkPricePrepaid();

        // Filter only Mobile Legends products from prepaid result
        if (prepaidResult && prepaidResult.data) {
          return NextResponse.json({
            status: prepaidResult.status,
            data: prepaidResult.data,
          });
        }

        return NextResponse.json(prepaidResult);
      } catch (prepaidError) {
        console.log(
          'Prepaid check failed, trying deposit check...',
          prepaidError
        );
        // If both price checks fail, at least check deposit to verify credentials
        const depositResult = await digiflazz.checkDeposit();
        return NextResponse.json({
          message: 'Price checks failed but deposit check succeeded',
          deposit: depositResult,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('API route error:', error.message);
      return NextResponse.json(
        { error: 'All API checks failed', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'All API checks failed' },
      { status: 500 }
    );
  }
}
