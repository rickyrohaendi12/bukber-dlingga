<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1308e7dd-60c3-4dc0-9be5-d856fe00fe2b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Panel Admin

Buka `/admin-dlingga-9746` untuk melihat daftar reservasi, rincian paket dan add-on, serta menyetujui booking berstatus pending.

Data reservasi aplikasi saat ini disimpan di `localStorage` browser. Aplikasi mengosongkan data booking dan status meja lama satu kali setelah pembaruan reset ini; booking baru tidak terhapus saat halaman dimuat ulang. Pengajuan dan approval mencegah pemakaian meja yang sama pada tanggal yang sama selama booking belum dibatalkan. Form juga membatasi pilihan ke kapasitas meja terkecil yang cukup untuk jumlah tamu (misalnya, 4 tamu hanya dapat memilih meja 4 kursi). Data hanya berlaku pada browser/perangkat yang sama dan belum tersinkron atau terkunci atomik antar perangkat/tab; untuk mencegah bentrok secara andal saat digunakan banyak pelanggan, gunakan backend dengan database dan validasi transaksi di server. Rute panel admin juga belum dilindungi autentikasi; gunakan backend dan autentikasi sebelum memakainya untuk operasional publik.

Saat formulir booking diajukan, aplikasi membuka WhatsApp ke nomor CS yang dikonfigurasi dengan detail reservasi terisi sebagai pesan. Pemesan tetap perlu menekan tombol Kirim di WhatsApp. Saat admin menyetujui booking, WhatsApp terbuka ke nomor pemesan dengan pesan persetujuan; admin perlu menekan Kirim agar pelanggan menerimanya. Pengiriman otomatis tanpa tindakan pengguna memerlukan integrasi WhatsApp Business API di backend.
