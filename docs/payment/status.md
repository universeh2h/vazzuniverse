## 🏦 Status Pembayaran di Midtrans

| **Status**      | **Keterangan**                                        |
| --------------- | ----------------------------------------------------- |
| 🟡 `pending`    | Pembayaran belum dilakukan atau sedang menunggu.      |
| ✅ `settlement` | **Pembayaran sukses** dan dana sudah diterima.        |
| 🟢 `capture`    | Pembayaran kartu kredit sukses tapi butuh verifikasi. |
| ❌ `deny`       | Transaksi ditolak (misalnya kartu kredit gagal).      |
| ⏳ `expire`     | Waktu pembayaran habis, transaksi gagal.              |
| ❌ `cancel`     | Transaksi dibatalkan oleh pengguna atau sistem.       |

> 💡 **Catatan:**
>
> - **settlement** → Produk bisa langsung dikirim ke user.
> - **pending** → Tunggu user melakukan pembayaran.
> - **expire** / **cancel** → Transaksi gagal, perlu order ulang.
