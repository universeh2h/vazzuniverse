// duitku-callback.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Digiflazz } from '@/lib/digiflazz';

export async function POST(req: NextRequest) {
  try {
    const username = process.env.DIGI_USERNAME as string;
    const apiKey = process.env.DIGI_API_KEY as string;
    const body = await req.json();
    console.log('Duitku callback received:', body);

    // Verify the callback (should implement proper signature verification)
    const { merchantOrderId, reference, paymentStatus } = body;

    // Check if transaction exists
    const transaction = await prisma.transaction.findFirst({
      where: { merchantOrderId },
      include: { layanan: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { status: 'error', message: 'Transaction not found' },
        { status: 404 }
      );
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus,
        updatedAt: new Date(),
      },
    });

    // If payment is successful, process the top-up via Digiflazz
    if (paymentStatus === 'SUCCESS' || paymentStatus === '00') {
      try {
        // Get the product code for Digiflazz from your database
        const digiflazzProductCode = transaction.layanan.providerId || '';

        if (!digiflazzProductCode) {
          throw new Error('Digiflazz product code not found');
        }
        const digiflazz = new Digiflazz(username, apiKey);

        // Process top-up through Digiflazz
        const topUpResult = await digiflazz.TopUp({
          customerId: transaction.noWa,
          productCode: digiflazzProductCode,
          ref_id: transaction.id.toString(),
        });

        console.log('Top-up result:', topUpResult);

        // Update transaction with Digiflazz response
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            topUpStatus: topUpResult.data.status,
            topUpReference: topUpResult.data.sn,
            topUpMessage: topUpResult.data.message,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          status: 'success',
          message: 'Payment and top-up processed successfully',
        });
      } catch (topUpError: any) {
        console.error('Top-up error:', topUpError);

        // Update transaction with failed top-up status
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            topUpStatus: 'FAILED',
            topUpMessage: topUpError.message || 'Top-up failed',
            updatedAt: new Date(),
          },
        });

        return NextResponse.json(
          { status: 'error', message: 'Payment successful but top-up failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Callback processed',
    });
  } catch (error: any) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
