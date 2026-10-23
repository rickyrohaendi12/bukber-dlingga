<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# D'Lingga Coffee

Reservasi tersimpan di Supabase dan dapat diakses lintas perangkat.

## Menyiapkan Supabase

1. Buat project di [Supabase](https://supabase.com/).
2. Buka SQL Editor di dashboard, lalu jalankan isi file
   [supabase/migrations/20261019000000_create_reservations.sql](./supabase/migrations/20261019000000_create_reservations.sql).
3. Salin [.env.example](./.env.example) menjadi `.env.local`, lalu isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari **Project Settings → API**.
4. Jangan pernah menaruh `service_role` key di frontend atau di environment variable berawalan `VITE_`.

Migration membuat tabel reservasi, validasi dan perhitungan harga di database,
pencegahan booking meja ganda secara atomik, RPC untuk booking/pencarian tiket/
perubahan status, serta kebijakan akses Supabase. Daftar dan perubahan status
reservasi hanya tersedia untuk akun Supabase yang memiliki role admin di
`app_metadata`.

Di wizard booking, pelanggan dapat membagi tamu ke beberapa pilihan menu dalam
satu reservasi, misalnya 1 Paket Hemat, 2 Paket Premium Sultan, dan 1 A la
Carte. Jumlah alokasi harus sama dengan jumlah tamu. A la Carte tidak memiliki harga
dasar paket dan item minuman/camilan tambahan bersifat opsional. Setiap paket
boleh dipilih mulai dari satu orang; jumlah minimum reservasi keseluruhan tetap
dua tamu. Harga paket dan add-on dihitung ulang di database.

Reservasi hanya dapat dibuat mulai satu hari sebelum tanggal kedatangan.
Formulir dan validasi database menggunakan waktu lokal Jakarta untuk aturan ini.

Jika project sudah menjalankan migration versi sebelumnya, jalankan kembali
seluruh isi file migration terbaru yang sama di SQL Editor. Migration ini
menyimpan pilihan per paket, memperbarui fungsi `create_reservation`, dan
menghapus minimum tamu per jenis paket; jalankan sebelum memakai aturan baru.

Setelah migration dijalankan:

1. Buat akun email/password admin melalui **Authentication → Users** di
   dashboard Supabase. Jangan sediakan pendaftaran admin dari aplikasi.
2. Beri role admin pada akun tersebut melalui SQL Editor (ganti alamat email):

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'admin@example.com';
   ```

3. Nonaktifkan pendaftaran publik di **Authentication → Settings**. Setelah
   mengubah role, keluar lalu masuk kembali agar token memuat role terbaru.

## Menjalankan aplikasi

```sh
pnpm install
pnpm dev
```

Untuk deploy, atur `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sebagai
environment variables pada hosting (termasuk preview dan production), lalu
build ulang aplikasi.

## Panel Admin

Buka `/admin-dlingga-9746` untuk melihat daftar reservasi, rincian paket dan
add-on, serta menyetujui booking berstatus pending. Panel dapat memuat ulang
data langsung dari Supabase. Masuk dengan akun Supabase ber-role admin.

Role `anon` tidak dapat membaca daftar reservasi atau mengubah status. Role
tersebut hanya dapat membuat booking, melihat meja terisi berdasarkan tanggal,
dan mencari tiket dengan pasangan Booking ID serta nomor WhatsApp. Kebijakan
RLS dan fungsi database tetap memverifikasi role admin di server; menyembunyikan
rute panel di frontend bukan satu-satunya lapisan perlindungan.

Pencarian tiket pada antarmuka meminta kedua nilai tersebut. Booking dan harga
divalidasi di database; nomor Booking ID dibuat oleh Supabase, dan pemesanan
meja yang sama pada tanggal yang sama ditolak secara atomik selama statusnya
pending atau confirmed. Data lama yang hanya tersimpan di `localStorage` tidak
dimigrasikan otomatis; bila perlu, ekspor dan impor data lama sebelum
menghapusnya.

Saat formulir booking diajukan, aplikasi membuka WhatsApp ke nomor CS yang dikonfigurasi dengan detail reservasi terisi sebagai pesan. Pemesan tetap perlu menekan tombol Kirim di WhatsApp. Saat admin menyetujui booking, WhatsApp terbuka ke nomor pemesan dengan pesan persetujuan; admin perlu menekan Kirim agar pelanggan menerimanya. Pengiriman otomatis tanpa tindakan pengguna memerlukan integrasi WhatsApp Business API di backend.
