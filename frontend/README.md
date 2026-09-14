# SIMRS-e Fase 1 — Frontend demo

Antarmuka pembelajaran administrasi rumah sakit dengan data sintetis. Menggunakan Next.js App Router, React, TypeScript, Tailwind, shadcn preset Base UI yang sudah terpasang, dan Hugeicons.

## Menjalankan aplikasi

Jalankan dari folder `frontend`:

```powershell
npm install
npm run dev
```

Buka `http://localhost:3000`. Beranda awal menggunakan akun Dosen. Menu akun di kanan atas → **Pilih akun demo** menyediakan Administrator, Dosen, dan enam akun Mahasiswa dengan penugasan berbeda. Tidak diperlukan kata sandi karena belum ada layanan autentikasi.

## Mencoba alur lengkap

1. Sebagai Dosen, buka **Praktikum → Sesi praktikum → Ulangi percobaan**, isi alasan, lalu konfirmasi. Ini membersihkan status contoh mahasiswa yang sudah submit dan memulai percobaan bersama yang baru.
2. Pilih Mahasiswa Demo 01, baca briefing, lalu **Mulai praktikum**. Pada pendaftaran, gunakan **Gunakan pasien dari skenario** dan simpan. Identitas berformat `SINT-0001` serta nama mengandung kata `Sintetis`.
3. Melalui menu akun tanpa memuat ulang halaman, pilih Mahasiswa Demo 03 sebagai Dokter. Pada tab pelayanan, proses kunjungan, simpan catatan simulasi, lalu selesaikan pelayanan.
4. Pilih Mahasiswa Demo 06 sebagai Kasir untuk mengonfirmasi pembayaran dummy setelah pelayanan selesai.
5. Mahasiswa dapat menyerahkan hasil tugasnya. Pilih Dosen untuk meninjau penilaian, memberi umpan balik, melihat laporan, dan memeriksa audit melalui monitor.
6. Dosen dapat menjeda/melanjutkan atau mengulangi percobaan dengan alasan. Penutupan sesi mengunci transaksi. Reset mempertahankan master, audit, riwayat percobaan, dan penilaian selama aplikasi terbuka.

## Verifikasi

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

`scripts/demo.test.mjs` menguji transisi data dan pembatasan peran/status tanpa backend atau tambahan test framework. TypeScript dikompilasi ke modul dalam memori selama pengujian.

## Struktur dan batasan

- `lib/simrs/`: tipe, data sintetis terpusat, menu/hak akses, validasi, dan transisi state.
- `components/simrs/`: AppShell navbar, halaman dan komponen aplikasi.
- `components/ui/`: komponen shadcn/Base UI.
- `app/[module]/`: halaman modul pada App Router.
- `public/images/hospital-education.png`: ilustrasi dekoratif hasil ImageGen.

Data transaksi berada dalam memori browser. Refresh mengembalikan data awal; hanya identitas akun demo disimpan dalam `sessionStorage`. Pembatasan frontend bukan autentikasi/otorisasi server. Satu sesi bersama dapat diproses; sesi tambahan hanya dijadwalkan/ditampilkan. Konfigurasi, pengguna, dan sebagian master berupa tampilan baca. Farmasi/laboratorium menampilkan tugas dan informasi observasi, tanpa modul operasional tahap berikutnya.

Laporan lengkap: [`../Reports/redesign-ui-fase-1.md`](../Reports/redesign-ui-fase-1.md). Dokumen produk berada di `../AI/Fase 1/`.
