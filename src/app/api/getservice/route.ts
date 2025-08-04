import { NextResponse } from 'next/server';
import { Digiflazz } from '@/lib/digiflazz';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get credentials
    const username = process.env.DIGI_USERNAME;
    const apiKey = process.env.DIGI_API_KEY;

    if (!username || !apiKey) {
      console.error('Missing Digiflazz credentials');
      return NextResponse.json(
        { error: 'Missing API credentials' },
        { status: 500 }
      );
    }

    const digiflazz = new Digiflazz(username, apiKey);

    // Get price list from Digiflazz with better error handling
    let rawResponse;
    try {
      rawResponse = await digiflazz.checkPrice();
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to fetch price list: ' + (e instanceof Error ? e.message : e) },
        { status: 500 }
      );
    }

    // Extract the data array
    let dataArray;

    // Try different response formats
    if (typeof rawResponse === 'string') {
      try {
        rawResponse = JSON.parse(rawResponse);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
      }
    }

    // Check if response is direct array or has a data property
    if (Array.isArray(rawResponse)) {
      dataArray = rawResponse;
    } else if (rawResponse && typeof rawResponse === 'object') {
      // Try to find the data array - common API patterns
      if (Array.isArray(rawResponse.data)) {
        dataArray = rawResponse.data;
      } else if (
        rawResponse.response &&
        Array.isArray(rawResponse.response.data)
      ) {
        dataArray = rawResponse.response.data;
      } else {
        return NextResponse.json(
          { error: 'Invalid response format - data array not found' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Get all categories from database
    const categories = await prisma.categories.findMany();

    if (categories.length === 0) {
      return NextResponse.json({
        message: 'No categories to process',
        stats: { processed: 0, created: 0, updated: 0 },
      });
    }

    // Track statistics
    let stats = { processed: 0, created: 0, updated: 0 };
    let categoryMatches = {};

    // Use a transaction for database operations
    const result = await prisma.$transaction(async (tx) => {
      // Process each category and match with data items
      for (const category of categories) {
        if (!category.brand) {
          continue;
        }

        let matchCount = 0;

        // For each data item, check if it matches the current category
        for (const item of dataArray) {
          // Skip invalid items
          if (!item || typeof item !== 'object') {
            continue;
          }

          if (item.brand.toUpperCase() === category.brand.toUpperCase()) {
            matchCount++;
            stats.processed++;

            let defaultProfits = {
              profit: 2,
              profitReseller: 3,
              profitPlatinum:1 ,
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

            try {
              // Check if service already exists
              const existingService = await tx.layanan.findFirst({
                where: { providerId: item.buyer_sku_code },
              });

              if (!existingService) {
                // Create new service
                // Calculate base price with profit margins
                const regularPrice = Math.round(
                  item.price + (item.price * defaultProfits.profit) / 100
                );
                const resellerPrice = Math.round(
                  item.price +
                  (item.price * defaultProfits.profitReseller) / 100
                );
                const goldPrice = Math.round(
                  item.price + (item.price * defaultProfits.profitGold) / 100
                );

                // For platinum, apply the profit margin and then subtract 1%
                const platinumBasePrice = Math.round(
                  item.price +
                  (item.price * defaultProfits.profitPlatinum) / 100
                );

                await tx.layanan.create({
                  data: {
                    layanan: item.product_name,
                    kategoriId: category.id,
                    providerId: item.buyer_sku_code,
                    harga: regularPrice,
                    hargaReseller: resellerPrice,
                    hargaPlatinum: platinumBasePrice,
                    hargaGold: goldPrice,
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
                const regularPrice = Math.round(
                  item.price + (item.price * existingService.profit) / 100
                );
                const resellerPrice = Math.round(
                  item.price +
                  (item.price * existingService.profitReseller) / 100
                );
                const goldPrice = Math.round(
                  item.price + (item.price * existingService.profitGold) / 100
                );

                const platinumBasePrice = Math.round(
                  item.price + (item.price * existingService.profitPlatinum) / 100
                );

                await tx.layanan.update({
                  where: { id: existingService.id },
                  data: {
                    harga: regularPrice,
                    hargaReseller: resellerPrice,
                    hargaPlatinum: platinumBasePrice,
                    hargaGold: goldPrice,
                    status: item.seller_product_status,
                  },
                });
                stats.updated++;
              }
            } catch (dbError) {
              console.error(
                `Failed to process service ${item.buyer_sku_code}:`,
                dbError
              );
  
              throw dbError;
            }
          }
        }

        categoryMatches[category.brand] = matchCount;
      }
      return { stats, categoryMatches };
    }, {
      timeout: 50000,
      isolationLevel: "ReadCommitted"
    });

    return NextResponse.json({
      message: 'Data processed successfully',
      stats: result.stats,
      categoryMatches: result.categoryMatches,
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    return NextResponse.json(
      {
        error: String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}