# Form SIMRS Inti terintegrasi dan penelusuran hasil

Tanggal pengerjaan: 15 September 2026 (workspace; pengujian browser 16 September WIB).
Status: implementasi dan verifikasi alur utama selesai untuk demo. Unduhan melalui browser bawaan belum terverifikasi; rincian hasil dapat dibaca langsung di aplikasi.

## Audit dan rencana sebelum perubahan

Repository bersih pada awal iterasi. Dibaca ulang AGENTS root/frontend, ABOUT, WORKFLOW, UI, TODO, laporan integrasi sebelumnya dan laporan domain 03–08, 14, 16. Foundation tetap Next.js App Router, React, shadcn Base UI, navbar dan server demo existing.

Temuan: transaksi inti sudah terhubung melalui satu engine. Master sebagian besar hanya dapat dibaca; hanya penambahan unit dan tarif dapat diubah. Pasien belum memiliki form koreksi; pemilihan pasien/appointment harus diulang pada halaman berikutnya. Laporan belum menunjukkan hubungan antarform dalam satu kunjungan. Pengguna memilih pengujian seluruh alur dengan berganti akun demo sesuai peran.

Rencana: lengkapi form katalog melalui engine dan izin existing; tambah koreksi identitas dengan audit; bawa pilihan pasien/appointment/kunjungan pada tautan antarhalaman; tampilkan proyeksi alur dan unduhan berdasarkan transaksi tersimpan; uji seluruh peran tanpa membuat engine kedua atau mengubah urutan status.

## Perubahan fungsional

- Administrator mengisi identitas rumah sakit serta menambah/mengubah data di seluruh kategori master dasar: unit/instalasi, poli, SDM/jadwal, layanan/tarif, penjamin, obat/bahan, ruangan, bed, supplier, diagnosis, tindakan. Kode dibuat otomatis dan tetap saat diubah. Kategori data tersimpan tidak dipindahkan. Form menggunakan nama, rincian, status dan alasan; layanan/tindakan juga memakai tarif terstruktur.
- Poli, penjamin, diagnosis, layanan dan tindakan tersinkron sebagai pilihan operasional dalam master yang sama. Data Nonaktif tetap ada pada katalog tetapi tidak dipilih untuk transaksi baru. Administrasi pendaftaran dan setidaknya satu poli, penjamin, layanan konsultasi aktif dipertahankan. Unit struktur berbeda dari kategori Poli yang menjadi tujuan pendaftaran.
- Semua perubahan master tetap mengikuti snapshot: master → publikasi skenario baru → sesi baru → pilih/buka sesi → percobaan. Master baru tidak disuntikkan ke skenario terpublikasi/sesi lama, termasuk setelah reset.
- Form koreksi pasien memakai field yang sama dengan pendaftaran dan alasan wajib. Nomor RM/ID, relasi appointment/kunjungan dan penjamin pada kunjungan lama tetap utuh. Identitas terkait rekam medis final terkunci; perubahan yang sudah tersimpan memiliki waktu dan audit.
- Tombol data contoh mencari identitas yang belum digunakan. Pengguna tetap meninjau/mengubah isian dan menyimpan sendiri. Koreksi pasien tidak menyediakan tombol contoh agar identitas tidak tertukar.
- Tautan **Daftarkan kunjungan**, **Buat appointment**, serta **Buka antrean/pelayanan/kasir** membawa identitas objek yang dipilih. Pendaftaran dari appointment memilih pasien, appointment dan poli terkait. Identitas/penjamin/tujuan tetap harus diverifikasi.
- **Telusuri alur** tersedia pada bukti pendaftaran, antrean, detail pasien, pelayanan dan kasir. Dashboard/laporan menyediakan pemilih kunjungan dan urutan pendaftaran → antrean → verifikasi → rekam medis → selesai → billing/pembayaran. Status merupakan hasil perhitungan dari data tersimpan, bukan checklist yang dapat dimanipulasi.
- Riwayat aktivitas memakai audit existing untuk objek pasien, appointment, dan kunjungan pada sesi/percobaan aktif. Dosen melihat aktivitas sesuai akses existing, mahasiswa melihat audit akunnya sendiri. Catatan klinis/keuangan tetap disaring server. Tidak menebak nilai keuangan dari data yang disembunyikan.
- **Lihat rincian hasil input** menampilkan identitas sintetis, appointment, status, seluruh field rekam medis, rincian biaya/pembayaran yang diizinkan dan penanda DOKUMEN SIMULASI. Tombol unduh memakai isi yang sama. Dokter/RM dapat membaca dokumentasi; kasir membaca keuangan; dosen meninjau keduanya. Detail pendaftaran dari penelusuran menampilkan data tersimpan; membuat kunjungan baru tetap melalui aksi terpisah.
- Panduan uji pada dashboard/master/laporan menyebut penugasan aktual sesi, langkah tiap akun, briefing, pergantian akun, pemeriksaan hasil dan reset existing.

## Masalah form existing yang diperbaiki

Browser menemukan input tanggal/waktu native dapat mengubah nilai tampilan sebelum event change tersinkron ke state form. Input pasien/appointment kini juga menyinkronkan event input; pendaftaran tetap memakai validasi tanggal server yang sama. Tombol Simpan appointment sebelumnya memakai default `type="button"` dari primitive sehingga tidak mengirim form; sekarang secara eksplisit `type="submit"`.

Pesan kesalahan yang sudah diperbaiki dibersihkan saat mengetik agar tombol tidak bergeser ketika blur terjadi. Perubahan identitas/penjamin/tujuan membatalkan centang verifikasi lama. Form masih menunggu sukses server sebelum menutup atau memberikan bukti tersimpan.

## Data, API, akses dan kompatibilitas

Tidak ada database, migration, dependency, framework, perubahan template, endpoint baru, autentikasi produksi atau integrasi eksternal. Tambahan command melalui POST `/api/workspace`: `master.save`, `master.hospital`, `patient.update`. Struktur `Patient` menambah `updatedAt` opsional agar data lama tetap kompatibel.

`executeCore` tetap satu sumber transaksi; `applyCore` tetap menghubungkannya dengan SIMRS-e. Form master hanya untuk Administrator; koreksi pasien hanya petugas pendaftaran pada percobaan yang dapat diedit. Role/account tidak ditukar menjadi aktor lain. Dosen tetap observasi. Lock submit, sesi dijeda/berakhir, scope/revisi, snapshot, audit dan reset existing dipertahankan. Mutasi gagal tidak menyimpan sebagian perubahan.

## Cakupan dan batasan

Input SDM/jadwal, ruang/bed, obat/bahan, supplier masih berupa katalog referensi dasar; belum penjadwalan kapasitas, alokasi bed, transaksi stok atau pengadaan. Lampiran berupa keterangan hasil, belum upload berkas. Data tetap sintetis, pembayaran dummy, memori server sementara dan tidak berbagi lintas browser/perangkat. Tautan antarform tidak memberikan hak akses tambahan.

Tidak dilakukan commit atau deploy. Fitur yang terdampak: master existing, pasien/pendaftaran/appointment, antrean, dokumentasi klinis, kasir, dashboard/laporan operasional, wrapper simulasi. Modul akademik, penilaian dan status alur utama tetap menggunakan implementasi existing.

## Pengujian

Perintah dijalankan dari `frontend/`:

| Perintah / metode | Hasil |
| --- | --- |
| `npm run typecheck` | Lulus pada perubahan akhir. |
| `npm run lint` | Lulus. |
| `npm test` | 38/38 lulus (32 existing + 6 tambahan). |
| `npm run test:integration` | 3/3 rangkaian HTTP lulus pada localhost:3000. |
| `npm run build` | Lulus build Next.js, TypeScript dan page generation. |
| `git -c core.safecrlf=false diff --check` | Lulus. |
| HTTP GET `/login` | 200; server development existing tetap digunakan agar hasil demo browser tersedia. |

Test baru mencakup seluruh kategori master, ID stabil/audit, pilihan aktif/nonaktif, duplikasi/input kosong/akses ditolak, perlindungan pilihan wajib, koreksi pasien/RM/relasi/penjamin historis, kode contoh belum digunakan, status penelusuran/ekspor sesuai izin. HTTP tambahan membuat master poli/penjamin/diagnosis/layanan/tindakan dan rumah sakit → skenario baru → sesi baru yang dipilih/dibuka → pasien dan koreksi → appointment → pendaftaran/panggil → verifikasi/draft RM → dokumentasi dokter lengkap/final/selesai → tagihan Rp105.000 → pembayaran/submit → dosen → reset mempertahankan snapshot/histori. Uji alur lama, periode terkunci, scope usang, akses, observasi/feedback dan isolasi sesi tetap lulus.

Pengujian Browser plugin (tanpa fallback browser lain):

1. Administrator: form master kosong menampilkan ringkasan/field error; menambah Poli Sintetis Uji Form dan memeriksa pilihan aktif hasil simpan. Integrasi master baru ke skenario/sesi dibuktikan lebih lengkap melalui HTTP.
2. Dosen: mengulang percobaan pertama dengan alasan; master dan riwayat dipertahankan. Browser menggunakan SESI-001 percobaan 2, sehingga tetap memakai snapshot poli/tarif awal.
3. Pendaftaran: validasi pasien kosong, simpan SINT-0301 sebagai RM-SIM-0001, koreksi alamat dengan alasan, appointment 16-September-2026 09:15 WIB. Tautan appointment memilih pasien dan appointment yang sama. Verifikasi/simpan menghasilkan KJ-001/A-001; penelusuran menunjukkan relasi dan audit. Panggil mengubah status menjadi Dipanggil.
4. Rekam medis: akun Demo 02 melakukan verifikasi dan menyimpan draft; tombol finalisasi tetap nonaktif.
5. Dokter: akun Demo 03 memulai pelayanan, mengisi keluhan, pemeriksaan, diagnosis B, tindakan contoh Rp25.000, catatan, hasil, tindak lanjut, rujukan; simpan/finalisasi menghasilkan dokumen terkunci, lalu pelayanan Selesai.
6. Kasir: biaya aktual Rp15.000 + Rp50.000 + Rp25.000 = Rp90.000. Nominal Rp100.000 ditolak oleh validasi; Rp90.000 dengan alasan tersimpan dan Lunas. Submit mengunci input nominal kasir.
7. Uji tambahan tanggal setelah perbaikan: pasien kedua SINT-0302/RM-SIM-0002 tersimpan dengan input tanggal manual 12-Maret-1992. Tombol koreksi pasien pertama terkait rekam medis final nonaktif.
8. Dosen melihat dua pasien, satu kunjungan Selesai, tagihan/dibayar Rp90.000 dan sisa Rp0. Penelusuran menampilkan aktivitas lintas peran, detail pendaftaran tersimpan dan rincian seluruh input. Tidak muncul framework overlay pada alur akhir; tidak ada console error baru setelah reload/perbaikan. Ada error HMR sementara saat file baru belum selesai ditulis, sudah pulih sebelum pengujian alur akhir.

| Tampilan | Bukti ukuran aktual |
| --- | --- |
| Dashboard dosen 1280×900 | Navbar clientWidth/scrollWidth sama 1185; document 1265, tidak melewati viewport. |
| Dialog penelusuran 1024×768 | Navbar clientWidth/scrollWidth sama 961; document 1009. Dialog x≈54, y=24, lebar 900, tinggi 720. Isi panjang menggulir vertikal di dalam dialog. |

Bukti screenshot disimpan di direktori visualisasi Codex, di luar repository: `alur-kunjungan-1024.png`, `hasil-kunjungan-lunas-1024.png`, `dashboard-hasil-simrs-1280.png`.

Batas verifikasi: event unduhan browser bawaan timeout 10 detik, termasuk setelah URL berkas dilepas secara tertunda. File tidak ditemukan pada lokasi Downloads default. Isi dokumen dan pembatasan akses lulus test, dan isi yang sama tampil pada **Lihat rincian hasil input**. Penyimpanan unduhan ke disk belum diklaim lulus. Viewport mobile, browser eksternal, upload, kolaborasi lintas perangkat, dan pengujian seluruh kombinasi kategori melalui UI tidak dilakukan. Semua kategori diuji pada engine; integrasi pilihan operasional diuji melalui HTTP. Reset akhir hanya pada lingkungan HTTP terpisah, sehingga hasil browser dapat ditinjau pengguna.
