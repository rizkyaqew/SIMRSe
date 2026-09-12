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
