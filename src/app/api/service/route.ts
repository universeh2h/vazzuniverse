import { NextResponse } from 'next/server';
import { Digiflazz } from '@/lib/digiflazz';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const username = process.env.DIGI_USERNAME as string;
    const apiKey = process.env.DIGI_API_KEY as string;
    const digiflazz = new Digiflazz(username, apiKey);

    // Get price list from Digiflazz
    const response = await digiflazz.checkPrice();

    // Extract data array correctly
    let data = [];
    if (response && typeof response === 'object') {
      data = response.data || response;
    }

    if (!Array.isArray(data)) {
      console.error('Data is not an array');
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Get all categories from database
    const categories = await prisma.categories.findMany();

    // Track statistics
    let stats = { processed: 0, created: 0, updated: 0 };

    // Process each category and match with data items
    for (const category of categories) {
      // For each data item, check if it matches the current category
      for (const item of data) {
        // Skip invalid items
        if (!item || typeof item !== 'object' || !item.brand || !item.category)
          continue;

        // Match by brand as in your Laravel code (case insensitive)
        if (item.brand.toUpperCase() === (category.brand || '').toUpperCase()) {
          stats.processed++;

          let defaultProfits = {
            profit: 3,
            profitReseller: 3,
            profitPlatinum: 1,
            profitGold: 2,
          };

          if (item.category === 'Voucher' || item.category === 'PLN') {
            defaultProfits = {
              profit: 4,
              profitReseller: 4,
              profitPlatinum: 2,
              profitGold: 3,
            };
          }

          // Check if service already exists
          const existingService = await prisma.layanan.findFirst({
            where: { providerId: item.buyer_sku_code },
          });

          if (!existingService) {
            // Create new service
            await prisma.layanan.create({
              data: {
                layanan: item.product_name,
                kategoriId: category.id.toString(),
                providerId: item.buyer_sku_code,
                harga: item.price,
                hargaReseller: item.price,
                hargaPlatinum: item.price,
                hargaGold: item.price,
                profit: defaultProfits.profit,
                profitReseller: defaultProfits.profitReseller,
                profitPlatinum: defaultProfits.profitPlatinum,
                profitGold: defaultProfits.profitGold,
                catatan: item.desc || '',
                status: item.seller_product_status,
                provider: 'digiflazz',
                productLogo: null,
                subCategoryId: 1,
                isFlashSale: false,
              },
            });
            stats.created++;
          } else {
            await prisma.layanan.update({
              where: { id: existingService.id },
              data: {
                harga: item.price + (item.price * existingService.profit) / 100,
                hargaReseller:
                  item.price +
                  (item.price * existingService.profitReseller) / 100,
                hargaPlatinum:
                  item.price +
                  (item.price * existingService.profitPlatinum) / 100,
                hargaGold:
                  item.price + (item.price * existingService.profitGold) / 100,
                status: item.seller_product_status,
              },
            });
            stats.updated++;
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Data processed successfully',
      stats,
    });
  } catch (error) {
    console.error('Error processing services:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
