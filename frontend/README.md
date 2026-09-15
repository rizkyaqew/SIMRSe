# SIMRS-e Fase 1 — SIMRS Inti dan simulasi

Demo pembelajaran administrasi rumah sakit dengan data sintetis. Mempertahankan Next.js App Router, React, TypeScript, Tailwind, shadcn Base UI dan Hugeicons. Satu engine SIMRS Inti digunakan area operasional dan praktikum.

## Menjalankan

Dari folder `frontend`:

```powershell
npm install
npm run dev
```

Buka `http://localhost:3000/login`. Pilih akun contoh Administrator, Dosen atau Mahasiswa. Tidak diperlukan kata sandi; ini pemilih akun demo, bukan autentikasi produksi. Hak akses URL/aksi diperiksa server berdasarkan akun aktif dan penugasan sesi.

Data disimpan sementara pada memori server, terpisah untuk setiap lingkungan browser. Refresh tidak menghapus transaksi. Data berakhir setelah 8 jam atau restart server. Berganti akun pada browser yang sama mempertahankan lingkungan untuk mencoba serah-terima antarperan. Browser/perangkat lain memiliki lingkungan terpisah.

## Mencoba alur lengkap

1. Sebagai Dosen, buka **Praktikum → Sesi praktikum**. Pilih sesi pertama dan **Ulangi percobaan** dengan alasan untuk membersihkan status submit contoh. Master, audit dan penilaian lama tetap disimpan.
2. Menu profil → **Pilih akun demo** → Mahasiswa Demo 01. Baca briefing lalu **Mulai praktikum**. Gunakan data pasien contoh, centang verifikasi identitas/penjamin, lalu simpan pendaftaran.
3. Ganti ke Mahasiswa Demo 03 (Dokter) pada browser yang sama. Lanjutkan praktikum, panggil pasien, buka rawat jalan/rekam medis, verifikasi kunjungan dan mulai pelayanan. Isi catatan sintetis, simpan, finalisasi, kemudian selesaikan pelayanan. Riwayat menyimpan versi draft/final; koreksi harus beralasan.
4. Ganti ke Mahasiswa Demo 06 (Kasir). Periksa rincian tarif dan catat pembayaran dummy Rp65.000 untuk administrasi + pelayanan dasar. Tindakan tambahan yang dipilih dokter menambah tagihan sesuai master. Deposit, ditolak, refund dan pembatalan mengikuti aturan status/saldo.
5. Serahkan hasil. Akun yang submit terkunci. Ganti ke Dosen untuk monitoring, observasi, penilaian deskriptif dan publikasi feedback. Laporan belajar terpisah dari laporan operasional.
6. Pilih **SIMRS Inti** di header untuk mengakses pasien, appointment, antrean, rekam medis dan keuangan sesuai capability. Data dan engine sama dengan praktikum aktif. Administrator mengelola master; Dosen mengamati tanpa mengambil alih transaksi.
7. Sesi kedua mempunyai penugasan dan data tersendiri. Dosen dapat membukanya atau membuat sesi dari skenario terpublikasi. Pergantian sesi/reset tidak menghapus transaksi, audit dan penilaian sesi lainnya.

## Pengujian

```powershell
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
```

`npm test` menjalankan 41 test domain/regresi. `test:integration` menjalankan tiga rangkaian HTTP dan membutuhkan server pada port 3000. Untuk server pada port berbeda:

```powershell
$env:SIMRS_TEST_URL = 'http://localhost:3001'
npm run test:integration
Remove-Item Env:SIMRS_TEST_URL
```

Test memakai data sintetis dan lingkungan terpisah, tanpa membaca cookie browser pengguna. Untuk mencoba hasil build, jalankan `npm run start -- --port 3001` sesudah `npm run build`.

## Struktur dan batasan

- `lib/platform`: akun, Role, capability, izin modul, Principal dan fakta audit bersama.
- `lib/core`: master/pasien/kunjungan/rekam medis/charge/payment, validasi dan engine transaksi tunggal tanpa konteks pendidikan.
- `lib/simrs`: akademik/skenario/sesi/attempt/penilaian, snapshot, adapter dan facade kompatibilitas.
- `lib/server` serta `app/api`: sesi cookie dan state server demo, pemeriksaan aksi/revisi/scope serta penyaringan response.
- `components/core`: UI transaksi yang dipakai kembali melalui `components/simrs/core-area.tsx`.
- `components/simrs`: AppShell navbar dan UI pembelajaran existing. `components/platform` memakai ulang primitive existing; `components/ui` tetap shadcn.
- Route `/[module]` lama tetap tersedia. `/simrs` dan `/simrs/[section]` merupakan tambahan, bukan migrasi route massal.

Tidak ada database, migration, integrasi produksi atau pembayaran nyata. Akademik, materi/kuis dan konfigurasi masih mengikuti cakupan demo existing. Master memiliki form tambah/ubah seluruh kategori dasar; SDM/jadwal, ruang/bed, obat/bahan dan supplier masih berupa katalog referensi, belum transaksi kapasitas/stok. Farmasi/laboratorium tetap observasi tanpa engine tahap lanjut. Lampiran rekam medis berupa keterangan teks, belum upload berkas. Appointment sederhana, tanpa kapasitas/jadwal kompleks. Penyimpanan permanen dan kolaborasi banyak perangkat belum tersedia.

## Mengisi form dan melihat hasil terintegrasi

Jika form tidak dapat diisi, periksa akun di header. Dosen hanya mengamati. Pilih **Gunakan akun penginput** pada form atau **Isi pendaftaran** di dashboard inti; halaman masuk memilihkan akun yang sesuai. Setelah masuk, baca/lanjutkan briefing untuk kembali ke form tersebut. Login/logout pada satu tab juga memperbarui akun di tab lain. Submit, dokumen final dan sesi berakhir tetap terkunci sesuai alur.

- **Master:** masuk Administrator → Master data → Tambah data master / Ubah data. Kategori Poli, Penjamin, Diagnosis, Layanan & tarif, Tindakan memperbarui pilihan operasional. Isi alasan setiap perubahan. Untuk mencoba master baru, Dosen mempublikasikan skenario baru → membuat sesi → memilih sesi itu → membuka sesi. Reset sesi lama tetap memakai snapshot lama.
- **Pasien:** sebagai petugas pendaftaran, mulai/lanjutkan melalui briefing → SIMRS Inti → Layanan pasien → Data pasien. Isi data atau gunakan contoh lalu sesuaikan. Koreksi identitas membutuhkan alasan, mempertahankan RM dan terkunci setelah ada rekam medis final.
- **Appointment:** dari baris pasien pilih Buat appointment → isi tanggal/jam/poli → Simpan appointment → Daftarkan kunjungan. Pasien dan appointment otomatis dipilih pada pendaftaran; centang verifikasi dan simpan.
- **Datang langsung:** dari pasien pilih Daftarkan kunjungan, atau isi Pasien baru di Pendaftaran. Nomor RM, kunjungan dan antrean tampil setelah penyimpanan sukses.
- **Pelayanan:** Panggil antrean. Ganti akun Demo 02 untuk verifikasi/draft administrasi jika diperlukan, lalu Demo 03 untuk Mulai pelayanan → isi keluhan, pemeriksaan, diagnosis, tindakan, catatan, hasil, tindak lanjut dan rujukan → Simpan → Finalisasi → Selesaikan pelayanan. Isi sesuai skenario, tanpa rekomendasi otomatis.
- **Kasir:** ganti Demo 06 pada browser yang sama, pilih kunjungan yang sama, periksa tagihan layanan/tindakan, lalu catat pembayaran dummy dengan alasan. Rp65.000 untuk layanan dasar; Rp90.000 jika tindakan contoh Rp25.000 ikut dicatat. Selalu gunakan nominal pada tagihan aktual.
- **Hasil:** pilih Telusuri alur di transaksi, atau Dashboard/Laporan operasional → Penelusuran alur pelayanan → pilih kunjungan → Lihat rincian hasil input. Status, aktivitas dan rincian mengikuti transaksi serta hak akses. Dosen melihat lintas peran; mahasiswa hanya melihat audit miliknya. Unduhan berkas tersedia dengan isi yang sama, tetapi penyimpanan unduhan melalui browser bawaan belum terverifikasi.

Panduan langkah dan penugasan aktif juga tersedia langsung di dashboard/master/laporan SIMRS Inti. Pengujian dan batasan iterasi: [`../Reports/simrs-inti-form-dan-penelusuran.md`](../Reports/simrs-inti-form-dan-penelusuran.md).

Laporan arsitektur, API, hasil pengujian dan batasan: [`../Reports/simrs-inti-integrasi.md`](../Reports/simrs-inti-integrasi.md). Dokumen produk berada di `../AI/Fase 1/`.
