# SIMRS-e — Fase 1

Dokumen ini berisi pekerjaan yang perlu diselesaikan untuk menyiapkan SIMRS-e sebagai platform pembelajaran dan simulasi praktikum untuk Prodi Administrasi Rumah Sakit.

# Batasan Produk
- Menyusun daftar pengguna: Dosen, Mahasiswa, Superadimn.
- Pisahkan data SIMRS Inti dengan SIMRS-e untuk proses simulasi dari data operasional rumah sakit.
- Menetapkan istilah yang digunakan di seluruh sistem: simulasi, skenario, sesi, penilaian.
- Menetapkan batasan Fase 1 dan daftar fitur yang ditunda ke fase berikutnya.

# Landasan Proses Rumah Sakit
- Dokumentasikan sturktur rumah sakit simulasi : unit, poli, ruangan, tempat tidur, jadwal, petugas.
- Dokumentasikan alur pendaftaran, anteran, rawat jalan, rawat inap, IGD, rekam medis, farmasi, penunjang, kasir dan pelaporan.
- Tentukan master data minimun : pasien, tenaga kesehatan, layanan, tarif, obat, penjamin, diagnosis, tindakan dan supplier.
- Tentukan data sintetis yang digunakan untuk proses simulasi.
- Tinjau kesesuaian istilah rekam medis, klaim, mutu dan indikator rumah sakit dengan materi kuliah.

# Modul Inti Fase 1
- Autentikasi, manajemen pengguna, peran, hak akses.
- Manajemen program studi, mata kuliah, kelas, kelompok dan periode praktikum.
- Master data rumah sakit simulasi.
- Data pasien sintetis dan nomor rekam medis simulasi.
- Pendaftaran pasien dan pembuatan kunjungan.
- Antrean dan status pelayanan.
- Alur rawat jalan dasar.
- Rekam medis simulasi dengan formulir yang sesuai dengan tujuan praktikum.
- Billing dan kasir dasar.
- Dashboard transaksi dan indikator dasar. 

# Lapisan Simulasi
- Dosen dapat memilih tahun ajaran sebelum melanjutkan proses untuk pembuatan skenario.
- Dosen dapat membuat skenario dari data awal yang ditentukan.
- Dosen dapat menetapkan tujuan, tugas, batas waktu dan kriteria keberhasilan.
- Dosen dapat memberikan peran kepada mahasiswa secara individu atau kelompok.
- Sistem dapat menjalankan kejadian tambahan, misalnya antrian meningkat, stok habis atau klain ditolak.
- Sistem mencatata setiap aktivitas mahasiswa beserta waktu dan perannya.
- Sesi dapat dihentikan, dilanjutkan, diulang, dan dikembalikan ke kondisi awal.
- Mahasiswa dapat melihat status tugas dan hasil tindakannya.
- Sistem akan menyimpan setiap aktivitas simulasi untuk dosen melakukan penilaian.

# Aturan UI
- UI harus menampilkan penanda yang jelas bahwa data adalah data simulasi.
- Bedakan tampilan tugas aktif, data terkunci, selesai, terlambat dan perlu diperbaiki.
- Sediakan validasi di tingkat field dan ringkasan kesalahan di tingkat formulir.
- Sistem harus menampilkan keadaan saat loading, kosong, gagal, read-only dan terkunci.
- Pastikan tabel, filter, pencarian dan pagination tetap dapat digunakan pada layar simulasi.
- Menyediakan konfirmasi tindakan yang dapat mengubah atau menghapus data simulasi.

# Definisi selesai Fase 1
Fase 1 dapat dianggap siap untuk pengembangan apabalia :
1. Ruang lingkup dan aktor sudah disetujui;
2. alur rawat jalan dasar dapat dijalankan dari pendaftaran sampai laporan;
3. dosen dapat membuat dan membagikan satu skenario;
4. mahasiswa dapat menyelesaikan tugas sesuai perannya;
5. semua aktivitas tercatat dan dapat dinilai;
6. sesi dapat diulang tanpa merusak master data; dan
7. tidak ada data pasien nyata yang digunakan.

# Alur saat Pembuatan Skenario untuk Simulasi
1. Tambahkan tahun ajaran sebagai bagian dari konteks skenario.
2. Tambahkan semester sebagai bagian dari konteks skenario.
3. Hubungkan skenario dengan mata kuliah, kelas, dan kelompok.
4. Buat katalog peran rumah sakit yang dapat dipilih dosen.
5. Dukung satu sesi dengan banyak mahasiswa dan banyak peran.
6. Peran mahasiswa setiap sesi dapat berubah.
7. Tentukan tugas, menu, dan informasi yang tersedia untuk setiap peran.
8. Buat mekanisme serah-terima tugas antarperan.
9. Gunakan data sintetis untuk seluruh objek dan transaksi.
10. Ubah cakupan fitur pasien sintetis menjadi pengelolaan data sintetis.
11. Uji skenario yang melibatkan minimal lima peran berbeda.

# Progres Antarmuka Frontend — 14 September 2026 (WIB)

Penyelesaian berikut berlaku untuk frontend demo, bukan penyelesaian backend atau seluruh Fase 1.

- [x] AppShell navbar atas dengan kelompok dropdown sesuai Administrator, Dosen, dan Mahasiswa; tanpa sidebar atau scroll horizontal navbar.
- [x] Bahasa visual healthcare dengan bidang putih, heading navy, aksen biru/cyan, status, breadcrumb, dan bantuan kontekstual; mempertahankan Next.js serta foundation shadcn.
- [x] Dashboard peran, skenario, sesi/penugasan, briefing, simulasi rawat jalan dasar, master, monitor, penilaian deskriptif, umpan balik, dan laporan demo.
- [x] Memisahkan tipe/data mock, master, skenario, transaksi percobaan, riwayat penilaian, serta audit frontend.
- [x] Validasi pendaftaran, status terkunci, sesi dijeda/berakhir, konfirmasi dengan alasan, dan reset yang mempertahankan master/riwayat penilaian.
- [x] Typecheck, lint, 14 pengujian transisi data, build produksi, dan pemeriksaan browser navbar tiga peran pada 1920, 1600, 1440, 1366, 1280, serta 1024 px; tambahan pemeriksaan 390 px.
- [ ] Penyimpanan permanen, autentikasi pengguna sebenarnya dan kolaborasi multi-perangkat. Pemeriksaan akun/aksi server untuk demo telah ditambahkan pada iterasi SIMRS Inti di bawah.
- [ ] CRUD seluruh master/akademik dan pengelolaan kelas lengkap. Isolasi transaksi/penugasan beberapa sesi demo telah ditambahkan pada iterasi SIMRS Inti di bawah.

Rincian fitur, pengujian, keputusan, dan keterbatasan: `Reports/redesign-ui-fase-1.md` di akar repository.

# Progres SIMRS Inti dan Integrasi — 14 September 2026

Cakupan: aplikasi demo dengan server Next.js yang sama dan data sementara, bukan SIMRS produksi atau penyelesaian seluruh Fase 1.

- [x] Memisahkan Platform/shared, SIMRS Inti dan SIMRS-e dengan satu engine transaksi serta adapter/projection kompatibilitas.
- [x] Pasien kanonis/No. RM, pencarian/detail, pendaftaran baru/lama/datang langsung, appointment sederhana dan kunjungan.
- [x] Antrean menunggu/dipanggil/dilayani/selesai, pembatalan/no-show beralasan, verifikasi rawat jalan dan serah-terima antarperan.
- [x] Rekam medis terstruktur, draft/final, koreksi beralasan, riwayat versi dan read-only sesuai status/capability.
- [x] Charge layanan aktual, snapshot tarif, tagihan, pembayaran/deposit/ditolak/refund/pembatalan dummy dan laporan operasional dasar.
- [x] Akun demo server, cookie HttpOnly, akun nonaktif/kedaluwarsa, pemeriksaan URL/aksi, penyaringan data peran dan penolakan revisi/scope usang.
- [x] Data sesi terisolasi, penugasan per sesi, snapshot terpublikasi dan reset yang mempertahankan master/audit/observasi/penilaian.
- [x] Route/AppShell existing dipertahankan; area SIMRS Inti memakai navbar berkelompok tanpa sidebar/scroll horizontal dan memakai ulang UI transaksi di praktikum.
- [x] Typecheck, lint, 32 uji domain/regresi, 2 rangkaian HTTP pada development/build server, build dan browser alur utama serta lima ukuran pendaftaran desktop.
- [ ] Database/persistensi permanen, password/SSO/manajemen akun penuh dan kolaborasi praktikum lintas browser/perangkat.
- [ ] CRUD semua katalog, penyunting snapshot kompleks, upload lampiran, template cetak lengkap, kapasitas appointment dan monitor real time.
- [ ] Fitur akademik/kuis penuh dan modul operasional fase berikutnya mengikuti pekerjaan terpisah serta spesifikasi yang disepakati.

Laporan terperinci, hasil pengujian, batas verifikasi dan pekerjaan lanjutan: `Reports/simrs-inti-integrasi.md` di akar repository.

# Progres Form SIMRS Inti dan Penelusuran — 15 September 2026

Cakupan: melengkapi input dan keterlacakan pada alur demo existing. Bukan penyelesaian seluruh transaksi operasional rumah sakit.

- [x] Form tambah/ubah seluruh kategori katalog master dasar, identitas rumah sakit, status dan alasan; poli/penjamin/diagnosis/layanan/tindakan tersambung ke pilihan transaksi pada snapshot baru.
- [x] Koreksi identitas pasien beralasan dengan RM tetap, audit dan penguncian identitas terkait dokumen final; contoh pasien baru memakai kode yang belum terdaftar.
- [x] Tautan pasien → appointment/pendaftaran dan appointment → pendaftaran membawa pilihan terkait, tanpa mengubah verifikasi, nomor antrean atau transisi status existing.
- [x] Sinkronisasi input tanggal/waktu native dan tombol submit appointment; formulir menunggu penyimpanan server sebelum menampilkan sukses.
- [x] Penelusuran per kunjungan, aktivitas sesuai izin, tautan antarform, unduhan hasil berpenanda DOKUMEN SIMULASI dan panduan pengujian berganti akun sesuai penugasan aktif.
- [x] Rincian hasil input dapat dibaca di aplikasi; 38 test domain/regresi, 3 rangkaian HTTP, typecheck/lint/build dan browser lintas peran lulus. Navbar/dialog diperiksa pada lebar 1280 dan 1024 piksel.
- [ ] Penyimpanan berkas unduhan melalui browser bawaan belum terverifikasi. Isi dokumen dan preview di aplikasi sudah diuji.
- [ ] Relasi/operasi master lanjutan: kapasitas dan penjadwalan SDM, alokasi bed, stok/pengadaan. Kategori tersebut saat ini diisi sebagai referensi nama/rincian/status.
- [ ] Persistensi permanen, autentikasi produksi, upload lampiran dan kolaborasi lintas perangkat tetap belum dikerjakan.

Hasil pengujian serta cakupan verifikasi: `Reports/simrs-inti-form-dan-penelusuran.md`.

# Perbaikan Akses Input — 15 September 2026

- [x] Form mode baca menyediakan jalur ke akun penginput sesuai penugasan, melalui login dan briefing kembali ke form tujuan.
- [x] Pergantian akun antar-tab menyegarkan identitas/navigasi/guard tanpa menambah hak akses Dosen atau membuka transaksi terkunci.
- [x] Browser membuktikan input dan penyimpanan pendaftaran aktif serta akun dua tab tersinkron. Typecheck/lint/build, 41 test domain/regresi dan 3 rangkaian HTTP lulus.

Rincian penyebab dan pengujian: `Reports/perbaikan-akses-input-simrs-inti.md`.
