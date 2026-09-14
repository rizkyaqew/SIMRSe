# Laporan Prototype UI SIMRS-e Fase 1

## Status Fitur
Selesai untuk tahap prototype UI awal.

## Tanggal Pengerjaan
12 September 2026

## Ringkasan Perubahan
Prototype UI Fase 1 dibuat sebagai antarmuka pembelajaran dan simulasi praktikum Administrasi Rumah Sakit. Implementasi menggunakan Next.js App Router, Tailwind CSS v4, komponen bergaya ShadCN, serta mock data lokal.

UI tidak menggunakan backend, database, pembayaran nyata, data pasien nyata, integrasi rumah sakit produksi, SATUSEHAT, atau BPJS produksi.

Penyesuaian terbaru menyelaraskan navbar dan modul prototype dengan dokumen `AI/Fase 1/UI.md`, `TODO.md`, `ABOUT.md`, `WORKFLOW.md`, dan `AGENTS.md`. Menu utama sekarang mengikuti daftar menu berdasarkan role yang ditetapkan dalam dokumentasi.

Pembaruan lanjutan memperkuat halaman modul agar tidak berhenti sebagai tabel demo. Skenario, sesi praktikum, simulasi mahasiswa, penilaian, audit, laporan, master data, materi, dan pembagian peran sekarang menggunakan data mock yang saling terkait dengan alur rawat jalan dasar.

## Alur Fitur
- Pengguna masuk ke dashboard dengan role mock default Dosen.
- Header menampilkan identitas SIMRS-e, konteks semester/sesi aktif, role pengguna, status SIMULASI, dan DATA SINTETIS.
- Navbar horizontal menyediakan menu sesuai role. Role Dosen menampilkan Dashboard, Materi, Skenario, Sesi Praktikum, Daftar Peserta, Monitor Aktivitas, Catatan Observasi, Penilaian, Laporan, dan Arsip.
- Dashboard menampilkan metrik, praktikum aktif, progress mahasiswa, notifikasi dosen, dan aksi cepat.
- Setiap halaman modul menampilkan ruang kerja prototype dengan data mock sesuai konteks modul.
- Halaman Skenario menampilkan tujuh field wajib dari `UI.md`, konteks kasus, dan alur proses visual pendaftaran sampai laporan.
- Halaman Sesi Praktikum dan Sesi Aktif menampilkan pembagian peran, tugas, serah-terima, status percobaan, dan ringkasan sesi.
- Halaman Simulasi menampilkan ruang kerja mahasiswa dengan penanda praktikum berjalan, data pendaftaran sintetis, antrean, rawat jalan, billing dummy, dan progress.
- Halaman Penilaian dan Umpan Balik menampilkan bukti proses, status, dan kondisi feedback tanpa mengunci skala nilai yang belum ditetapkan dokumen.

## Aturan Bisnis dan Hak Akses
- Menu ditampilkan berdasarkan role mock Administrator, Dosen, dan Mahasiswa.
- Menu utama tidak menampilkan item di luar daftar menu role yang ditetapkan di dokumentasi UI.
- Data pada prototype ditandai sebagai SIMULASI dan DATA SINTETIS.
- Seluruh informasi pasien, nomor rekam medis, peserta, tagihan, dan aktivitas adalah data tiruan.
- Pembayaran hanya berupa billing dummy untuk latihan.

## Perubahan Data atau API
Tidak ada API dan tidak ada database yang dibuat.

Data mock lokal mencakup:
- role pengguna;
- konteks tahun ajaran, semester, kelas, mata kuliah, dan sesi;
- skenario;
- peserta dan pembagian peran;
- pasien sintetis;
- antrean;
- billing simulasi;
- log aktivitas.
- tugas role dan serah-terima;
- materi pembelajaran;
- master data rumah sakit simulasi;
- bukti penilaian;
- ringkasan laporan dan arsip.

## Tampilan yang Dibuat
- Layout utama dengan navbar atas.
- Header dan breadcrumb.
- Dashboard role-based.
- Halaman modul prototype berbasis route dinamis.
- Komponen UI: badge, card, avatar, progress, separator, alert, table, select, dan icon wrapper Hugeicons.
- Ruang kerja khusus untuk Skenario, Sesi Praktikum, Simulasi, Penilaian, Audit, Laporan, Materi, serta Master Data.

## Pengujian
Pengujian yang dijalankan:
- `npm --prefix "frontend/simrs-e" run typecheck`: berhasil.
- `npm --prefix "frontend/simrs-e" run lint`: berhasil setelah perbaikan theme toggle dan sinkronisasi menu.
- `npm --prefix "frontend/simrs-e" run dev -- --port 3001`: Next.js berhasil masuk status ready, lalu berhenti karena sudah ada dev server untuk project yang sama di port 3000.
- Pemeriksaan HTTP pada menu role Dosen berhasil dengan status 200 untuk Dashboard, Materi, Skenario, Sesi Praktikum, Daftar Peserta, Monitor Aktivitas, Catatan Observasi, Penilaian, Laporan, dan Arsip.

Hasil aktual:
- Project dapat dijalankan dengan `npm run dev`.
- Header menampilkan SIMULASI, DATA SINTETIS, semester/sesi aktif, dan identitas role mock.
- Layout utama sudah menggunakan navbar atas, bukan sidebar.

## Kendala
- Prototype masih menggunakan role mock default Dosen.
- Belum ada autentikasi, guard URL, backend, database, atau penyimpanan state permanen.
- Formulir transaksi masih simulatif di sisi UI dan belum memiliki validasi bisnis/persistensi.
- Skala, bobot, dan rumus penilaian belum dikunci karena tidak ditetapkan dalam dokumen sumber.

## Pekerjaan Lanjutan
- Menambahkan halaman login mock dan pemilihan role.
- Menambahkan form nyata untuk pendaftaran pasien simulasi.
- Menambahkan workflow skenario dan pembagian peran lebih detail.
- Menambahkan guard akses route per role.
- Menambahkan validasi form, loading, empty, error, terkunci, dan sesi berakhir.
