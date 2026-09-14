# Implementasi antarmuka SIMRS-e Fase 1

**Tanggal:** 14 September 2026 (WIB) / 13 September 2026 (America/Los_Angeles).  
**Status:** antarmuka dan alur demo frontend selesai; integrasi backend dan pemenuhan seluruh modul Fase 1 belum termasuk.

## Landasan dan kondisi repository

Implementasi mengikuti AGENTS.md, ABOUT.md, UI.md, WORKFLOW.md, TODO.md, serta laporan terkait di `AI/Fase 1/Reports`. Enam gambar pengguna digunakan untuk proporsi, hierarki, bidang putih, aksen biru/cyan, tipografi, dan umpan balik visual. Menu, hak akses, dan konsep praktikum berasal dari dokumen produk. Tidak dibuat sidebar, mode persisten/sandbox, Teaching Baseline, SSO, atau fitur produksi berdasarkan gambar.

Lokasi aplikasi aktual adalah `frontend/`, dengan Next.js App Router dan halaman starter. Lokasi `frontend/simrs-e` yang disebut laporan prototipe lama tidak ditemukan pada checkout ini. Implementasi menggunakan struktur aktual; framework dan foundation shadcn tidak diganti. Perubahan pengguna yang telah ada pada dokumen lain tetap dipertahankan.

## Hasil dan dampak penggunaan

AppShell menyediakan header identitas, bantuan, aktivitas terbaru, avatar/peran, dropdown akun, navbar berkelompok, breadcrumb, dan panduan singkat. Navbar menggunakan flex wrap pada layar sempit; tidak memakai horizontal scrolling, carousel, rail, atau sidebar. Konteks sesi mahasiswa menunjukkan status sesi, penugasan, nomor percobaan, dan sisa batas waktu.

Dashboard dibedakan menurut peran. Dosen melihat sesi, progres peserta, aktivitas, dan tindak lanjut. Administrator mendapat akses pengelolaan dasar dan audit. Mahasiswa diarahkan dari briefing menuju tugas serta proses administrasi rumah sakit. Workspace simulasi menyediakan pendaftaran, antrean, pelayanan/rekam medis sederhana, dan billing dummy dalam tab konten.

Token produk berada dalam lingkup `.simrs-ui`, mempertahankan token global awal dan preset shadcn Base UI. Heading navy, background terang, kartu putih, border tipis, bayangan ringan, serta badge status membentuk hierarki informasi. Ilustrasi rumah sakit digunakan pada area pengantar; halaman transaksi berfokus pada data/formulir. Tema gelap dari foundation tetap tersedia.

## Pemetaan navigasi

| Peran | Kelompok navbar | Halaman |
| --- | --- | --- |
| Administrator | Administrasi | Pengguna, konfigurasi akademik |
| Administrator | Rumah sakit | Master data |
| Administrator | Sistem | Audit aktivitas, pengaturan sistem |
| Dosen | Pembelajaran | Materi, daftar peserta |
| Dosen | Praktikum | Skenario, sesi praktikum, monitor aktivitas |
| Dosen | Evaluasi | Observasi, penilaian |
| Dosen | Laporan & arsip | Laporan, arsip |
| Mahasiswa | Pembelajaran | Kelas, materi |
| Mahasiswa | Praktikum | Sesi aktif, tugas, simulasi, transaksi |
| Mahasiswa | Hasil belajar | Laporan, umpan balik |

Beranda dan bantuan tersedia lintas peran. Satu allowlist digunakan untuk menu dan penolakan URL yang tidak diizinkan. Pembatasan perubahan data juga diperiksa pada fungsi transisi, sehingga tidak hanya bergantung pada tombol nonaktif.

## Alur, aturan, dan hak akses

1. Dosen menyusun skenario dengan konteks akademik, tujuan, tugas, aturan, kriteria keberhasilan, dan durasi. Validasi tersedia sebelum penyimpanan/publikasi. Skenario terpublikasi menjadi baca saja dan dapat dipilih saat penjadwalan.
2. Sesi operasional contoh mempunyai enam mahasiswa dengan aktor Pendaftaran, Rekam Medis, Dokter, Farmasi, Laboratorium, dan Kasir. Penugasan hanya dapat diubah sebelum percobaan dimulai. Mahasiswa memilih akun demo, membaca briefing, lalu menjalankan tugas yang diizinkan.
3. Pendaftaran memvalidasi identitas sintetis, nama, tanggal lahir, jenis kelamin, alamat, penjamin, dan poli. Penyimpanan menghasilkan nomor RM/kunjungan/antrean simulasi, waktu simpan, serta audit. Identitas sama dalam percobaan ditolak sebagai duplikat.
4. Dokter mengubah antrean menjadi dilayani, melengkapi catatan simulasi, lalu menyelesaikan pelayanan. Rekam Medis dapat melengkapi catatan sebelum pelayanan final. Catatan final terkunci. Tidak ada rekomendasi medis otomatis.
5. Kasir hanya dapat mengonfirmasi pembayaran dummy setelah pelayanan selesai. Tarif berasal dari mock terpusat. Tidak ada transaksi uang, payment gateway, klaim/BPJS, atau SATUSEHAT produksi.
6. Submit mahasiswa mengunci perubahan akun tersebut dan menghasilkan penilaian sesuai nomor percobaan. Dosen dapat memberi penilaian deskriptif/umpan balik dan mempublikasikan atau mengembalikannya. Tidak ditambahkan skala numerik yang belum disepakati.
7. Jeda, lanjut, reset, dan tutup sesi memerlukan konfirmasi serta alasan. Jeda mengunci transaksi; batas waktu tetap mengikuti waktu akhir yang sudah ditetapkan, sebagaimana dijelaskan di dialog. Sesi ditutup atau waktu habis membuat transaksi baca saja. Penutupan tidak dapat dibatalkan di demo.
8. Reset mengarsipkan percobaan lama dan memulai nomor baru. Master, penilaian per percobaan, dan audit tidak ikut dihapus. Submit percobaan baru tidak menimpa penilaian lama.
9. Laporan menghitung kunjungan, pelayanan selesai, serta total pembayaran dummy dari transaksi aktif/riwayat. Unduhan teks diberi penanda DOKUMEN SIMULASI. Audit menunjukkan pengguna, peran, waktu, objek, sesi, percobaan, dan nilai sebelum/sesudah.

Kemampuan yang dilatih adalah ketelitian administrasi, pemahaman urutan pelayanan, serah-terima antarperan, penelusuran aktivitas, dan refleksi melalui umpan balik.

## Data, API, dan keputusan teknis

- `lib/simrs/types.ts`, `data.ts`, `navigation.ts`, `validation.ts`, dan `store.ts` memisahkan tipe, seed sintetis, menu, validasi, dan transisi state dari komponen.
- Provider menggunakan reducer bersama agar perpindahan halaman/akun dalam satu tab mempertahankan percobaan. Refresh mengembalikan seed; hanya identitas akun demo disimpan dalam sessionStorage agar penjagaan URL sesuai akun terpilih. Data transaksi tidak disimpan di browser storage.
- Master, skenario, percobaan, riwayat percobaan, penilaian, dan audit mempunyai koleksi terpisah. Tidak ada perubahan database, API fiktif, backend baru, atau integrasi eksternal.
- Routing `/` dan `app/[module]` menggunakan App Router. Halaman loading, error dengan coba lagi, akses ditolak, tidak ditemukan, dan data kosong tersedia.
- Komponen resmi shadcn ditambahkan mengikuti preset Base UI. Hugeicons dan font terpasang dipertahankan. Button/Link memakai API `render` dan `nativeButton` sesuai Base UI, tanpa `asChild`.
- ESLint disesuaikan dari major 10 ke 9.39.5 agar cocok dengan peer dependency plugin React pada konfigurasi Next di checkout ini. Perubahan terbatas pada tool development; lint kemudian berhasil.
- Konsep dashboard dibuat dan diperiksa dengan ImageGen sebelum implementasi. Prompt menekankan header/navbar atas berkelompok, dashboard dosen, kartu putih, navy/cyan, serta ilustrasi rumah sakit. Aset ilustrasi terpisah diturunkan dari konsep dan disimpan sebagai `frontend/public/images/hospital-education.png`. Aset tidak memuat identitas rumah sakit nyata atau requirement bisnis.

## Pengujian

| Metode | Hasil |
| --- | --- |
| Server dev / browser localhost:3000 | Server Next yang sudah berjalan digunakan; halaman dan navigasi berhasil dibuka. Percobaan server kedua mendeteksi lock dev aktif, sehingga proses pengguna tidak dihentikan. |
| `npm run typecheck` | Lulus, tanpa kesalahan TypeScript. |
| `npm run lint` | Lulus, tanpa peringatan. |
| `npm test` | 14 pengujian transisi data lulus. |
| `npm run build` | Build produksi berhasil; beranda dan route modul terkompilasi. |
| Browser: tiga peran × 1920, 1600, 1440, 1366, 1280, 1024 px | Navbar memiliki scrollWidth sama dengan clientWidth; dokumen tidak melebar melampaui viewport. |
| Browser: tambahan 390 px, tiga peran | Navbar membungkus ke baris berikutnya, tanpa scroll horizontal halaman. |
| Browser: menu mouse/keyboard | Dropdown peran terbuka; ArrowDown mengaktifkan navigasi menu. |
| Browser: skenario | Save kosong menampilkan error field/ringkasan; skenario valid dipublikasikan melalui konfirmasi dan muncul di katalog. |
| Browser: pendaftaran | Form kosong ditolak; data skenario disimpan dengan nomor RM/antrean dan feedback sukses; duplikat ditolak; submit mengunci simpan. |
| Browser: akses | URL penilaian langsung dengan akun Mahasiswa menunjukkan Akses tidak diizinkan, termasuk setelah refresh. |
| Browser: master/audit | Pencarian kosong, pagination, penambahan unit Administrator, dan penelusuran audit unit berhasil. |
| Browser: sesi | Reset memerlukan alasan dan menaikkan nomor percobaan; tutup sesi mengunci kontrol Dosen serta tombol mulai mahasiswa. |
| Browser: console akhir | Tidak ada error/peringatan baru pada pemeriksaan setelah perbaikan semantik Base UI dan controlled input. Log pengembangan lama dipisahkan berdasarkan waktu. |

Tes otomatis mencakup allowlist peran; pendaftaran normal/kosong/tidak valid; audit; duplikat; aktor tidak berhak; urutan pendaftaran–pelayanan–billing; pembayaran prematur; catatan final; submit; sesi dijeda/ditutup/kedaluwarsa; reset dan pelestarian master/riwayat; penilaian lintas percobaan; alasan/hak reset; penolakan perubahan skenario terpublikasi dan perubahan tanpa akun.

Screenshot pemeriksaan disimpan pada direktori visualisasi task, termasuk dashboard akhir dan formulir mahasiswa 1024 px. Kondisi loading/error tersedia pada komponen dan batas route; kegagalan jaringan backend tidak diuji karena backend belum tersedia. Pengujian keyboard belum merupakan audit aksesibilitas menyeluruh. Alur dokter–kasir diverifikasi melalui tes transisi; interaksi browser rinci berfokus pada skenario, pendaftaran, akses, master/audit, dan pengendalian sesi.

## Batasan dan pekerjaan lanjutan

- Ini demo frontend: belum ada autentikasi server, penyimpanan permanen, sinkronisasi banyak pengguna, atau otorisasi produksi. Pemilih akun tidak meminta password palsu.
- Satu sesi kelompok dapat dijalankan secara interaktif. Sesi baru dapat dijadwalkan/ditampilkan; pengoperasian beberapa sesi independen memerlukan kontrak/state lanjutan.
- Seed memuat contoh progres dan dua mahasiswa yang sudah submit untuk dashboard. Reset Dosen terlebih dahulu memungkinkan pengujian alur penuh dengan semua aktor.
- Pengguna, konfigurasi akademik, pengaturan, dan sebagian master masih baca saja. Penambahan master pada demo terbatas pada unit. Tidak ada klaim CRUD lengkap semua data Fase 1.
- Farmasi dan Laboratorium memiliki briefing/tugas serta tampilan observasi, tanpa transaksi operasional lanjutan pada perubahan ini. Pengujian operasional lima peran belum ditandai selesai.
- Arsip menyediakan keadaan kosong/katalog skenario terarsip, tanpa tindakan pengarsipan baru. Pengembalian penilaian tidak membuka ulang transaksi; pengulangan memakai kontrol Dosen.
- Pemeriksaan visual berfokus pada tema terang sesuai referensi. Tema gelap tersedia, tetapi belum melalui audit kontras menyeluruh.
- Integrasi API, otorisasi, persistence, rubrik resmi, CRUD penuh, serta pengujian integrasi layanan menjadi pekerjaan berikutnya berdasarkan kontrak yang disepakati.

Modul terdampak: AppShell, dashboard lintas peran, pembelajaran, sesi/skenario, rawat jalan, master, audit, penilaian, umpan balik, dan laporan. TODO diperbarui khusus pencapaian frontend; status keseluruhan Fase 1 tidak diubah menjadi selesai.
