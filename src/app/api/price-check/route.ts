import { NextResponse } from 'next/server';
import { Digiflazz } from '@/lib/digiflazz';

export async function GET() {
  try {
    // Get credentials from environment variables
    const username = process.env.DIGI_USERNAME as string;
    const apiKey = process.env.DIGI_API_KEY as string;

    console.log('Using Digiflazz credentials:', {
      username,
      apiKey: apiKey.slice(0, 5) + '...',
    });

    // Create a new instance of Digiflazz class with authentication
    const digiflazz = new Digiflazz(username, apiKey);

    try {
      const result = await digiflazz.checkPrice();
      return NextResponse.json(result);
    } catch (priceError) {
      console.log(
        'First price check method failed, trying alternative...',
        priceError
      );
      try {
        // If that fails, try the prepaid method
        const prepaidResult = await digiflazz.checkPricePrepaid();
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
