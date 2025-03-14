'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface PaymentDetailProps {
  merchantOrderId: string;
}

interface PaymentData {
  paymentUrl?: string;
  vaNumber?: string;
  qrString?: string;
  reference?: string;
  amount?: string;
  paymentMethod?: string;
  statusCode?: string;
  statusMessage?: string;
}

export default function PaymentDetail({ merchantOrderId }: PaymentDetailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    async function fetchPaymentDetail() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/payment/transaction-detail?merchantOrderId=${merchantOrderId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPaymentData(data);
      } catch (err) {
        setError('Gagal mendapatkan detail pembayaran');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (merchantOrderId) {
      fetchPaymentDetail();
    }
  }, [merchantOrderId]);

  if (loading) return <div>Memuat detail pembayaran...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!paymentData) return <div>Tidak ada data pembayaran</div>;

  return (
    <div className="border p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Detail Pembayaran</h2>

      <div className="space-y-2">
        <div>
          <span className="font-medium">Order ID:</span> {merchantOrderId}
        </div>

        <div>
          <span className="font-medium">Reference:</span>{' '}
          {paymentData.reference}
        </div>

        <div>
          <span className="font-medium">Jumlah:</span>{' '}
          {parseFloat(paymentData.amount || '0').toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          })}
        </div>

        <div>
          <span className="font-medium">Status:</span>{' '}
          {paymentData.statusMessage}
        </div>

        {paymentData.paymentMethod && (
          <div>
            <span className="font-medium">Metode Pembayaran:</span>{' '}
            {paymentData.paymentMethod}
          </div>
        )}

        {/* Tampilkan nomor VA jika ada */}
        {paymentData.vaNumber && (
          <div className="bg-gray-100 p-3 rounded-md mt-2">
            <span className="font-medium block mb-1">
              Nomor Virtual Account:
            </span>
            <span className="text-lg font-mono">{paymentData.vaNumber}</span>
          </div>
        )}

        {/* Tampilkan QRIS string jika ada */}
        {paymentData.qrString && (
          <div className="bg-gray-100 p-3 rounded-md mt-2">
            <span className="font-medium block mb-1">QRIS Code:</span>
            <div className="flex justify-center my-2">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  paymentData.qrString
                )}`}
                alt="QRIS Code"
                width={200}
                height={200}
              />
            </div>
            <span className="text-sm block text-center">
              Scan QR code di atas dengan aplikasi pembayaran Anda
            </span>
          </div>
        )}

        {/* Tampilkan link pembayaran jika ada */}
        {paymentData.paymentUrl && (
          <div className="mt-4">
            <a
              href={paymentData.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-md inline-block"
            >
              Lanjutkan ke Halaman Pembayaran
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
