import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleOrderStatusChange } from '@/lib/whatsapp-message';
 
export async function POST(req: NextRequest) {
  let logId: string = '';
  let referenceId: string = 'UNKNOWN';

  try {

    const callbackData = await req.json();
    const {
      ref_id,
      buyer_sku_code,
      customer_no,
      status,
      message,
      sn,
    } = callbackData.data;

    referenceId = ref_id;

    if (!referenceId || !buyer_sku_code || !customer_no) {
      return NextResponse.json({
        data: {
          status: "2",
          message: "Terdapat parameter yang kosong",
          rc: "07"
        }
      });
    }

    const normalizedStatus = status ? status.trim().toLowerCase() : '';
    const purchaseStatus = normalizedStatus === 'sukses' ? 'SUCCESS' : 'FAILED';
    return await prisma.$transaction(async (tx) => {

      const pembelian = await tx.pembelian.findUnique({
        where: { orderId: referenceId }
      });
      if (!pembelian) {
        throw new Error('Pembelian tidak ditemukan');
      }

      // Find associated pembayaran
      const pembayaran = await tx.pembayaran.findFirst({
        where: { orderId: pembelian?.orderId }
      });

       let saldo = pembelian.harga as number
       let   fee = 0
       if (pembayaran?.metode === "QRIS ( All Payment )" || pembayaran?.metode === "NQ") {
             fee = Math.round(saldo * (0.7 / 100))
             saldo = saldo - fee
            }
      let logMessage = message || "";
      let refundProcessed = false;

      if (purchaseStatus === 'SUCCESS' && sn) {
        logMessage = `Transaksi berhasil. SN/Kode Voucher: ${sn}`;      
      } 
      else if (purchaseStatus === 'FAILED' && pembelian.username) {
        const user = await tx.users.findFirst({
          where: { 
            username: pembelian.username as string
          }
        });       
      
        if (user && pembayaran) {
           
            if(pembayaran.metode === "SALDO"){
              await tx.$queryRaw`
              INSERT INTO balance_histories (
                username,
                balance_change,
                balance_before,
                balance_after,
                change_type,
                description_detail,
                updated_at,
                created_at
              ) VALUES (
                ${user.username}, 
                ${saldo}, 
                ${user.balance}, 
                ${user.balance + saldo}, 
                ${"REFUND"},       
                ${`REFUND ${referenceId} - ${pembelian.layanan} via ${pembayaran.metode}`}, 
                NOW(), 
                NOW()
              )
            `;
            }

         
          await tx.users.update({
            where: { id: user.id },
            data: { 
              balance: { increment: saldo } 
            }
          });
          logMessage = `Transakasi gagal, saldo otomatis kembali menjadi Saldo Akun `;
          refundProcessed = true;
        } else if (!user) {
          logMessage = `Transaksi gagal. Refund gagal: User ${pembelian.username} tidak ditemukan.`;
        } else if (!pembayaran) {
          logMessage = `${message || "Transaksi gagal"}. Refund gagal: Pembayaran untuk order ${pembelian.orderId} tidak ditemukan.`;
        }
      }
      
      await tx.pembelian.update({
        where: { id: pembelian.id },
        data: {
          status: purchaseStatus,
          sn: sn || null,
          log: logMessage,
          updatedAt: new Date(),
        }
      });
      await handleOrderStatusChange({
        orderData : {
          amount : pembelian.harga,
          link : `${process.env.NEXTAUTH_URL}/invoice?invoice=${pembelian.orderId}`,
          method : pembayaran?.metode,
          productName : pembelian.layanan,
          status : purchaseStatus,
          customerName : pembelian.username as string,
          orderId : pembelian.orderId,
          whatsapp : pembayaran?.noPembeli,
          sn,
        }
      })
      return NextResponse.json({
        data: {
          status: "0",
          message: "Callback processed successfully",
          rc: "00"
        }
      });
    }, {
      maxWait: 15000,  
      timeout: 30000,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

  } catch (error) {
  
    return NextResponse.json({
      data: {
        status: "2",
        message: error instanceof Error ? error.message : "System error",
        rc: "99"
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}