# 04-DATA-SINTETIS.md

Laporan ini menjelaskan pengelolaan seluruh data fiktif yang digunakan dalam SIMRS-e. Data sintetis tidak hanya digunakan untuk pasien, tetapi untuk semua objek, transaksi, proses, dan laporan di dalam sistem.

Cakupannya meliputi:

identitas institusi atau rumah sakit simulasi;
struktur organisasi rumah sakit;
unit pelayanan, poli, ruangan, tempat tidur, dan jadwal;
program studi, tahun ajaran, semester, mata kuliah, kelas, dan kelompok;
data pengguna, administrator, dosen, mahasiswa, dokter, perawat, petugas farmasi, petugas laboratorium, kasir, petugas logistik, kepala unit, dan manajemen;
peran, hak akses, jadwal kerja, serta kredensial fiktif SDM;
identitas pasien, nomor rekam medis, data demografi, kontak, dan penjamin;
riwayat kunjungan, pendaftaran, antrean, rekam medis, tindakan, resep, dan hasil pemeriksaan;
data obat, alat kesehatan, bahan habis pakai, layanan, tarif, supplier, dan penjamin;
data kamar, tempat tidur, ketersediaan layanan, dan kapasitas unit;
data billing, tagihan, pembayaran simulasi, piutang, klaim, dan transaksi keuangan;
data anggaran, pendapatan, biaya, serta laporan keuangan simulasi;
data skenario, sesi praktikum, pembagian peran, tugas, kejadian, dan hasil percobaan;
data nilai, rubrik, umpan balik, kehadiran, dan hasil pembelajaran;
dashboard, indikator mutu, laporan manajemen, laporan billing, laporan keuangan, dan laporan praktikum;
audit trail, riwayat perubahan, log aktivitas, dan status proses.

Laporan ini juga harus menjelaskan:

sumber dan cara pembuatan data sintetis;
hubungan antar-data agar tetap konsisten;
aturan penamaan dan pemberian nomor identitas fiktif;
cara membuat, menyalin, mengubah, dan menghapus data simulasi;
mekanisme seed data untuk menyiapkan skenario;
mekanisme reset dan pengulangan sesi;
pembatasan agar data satu kelas atau kelompok tidak tercampur dengan kelas lain;
penanda SIMULASI dan DATA SINTETIS pada halaman, dokumen, ekspor, billing, laporan keuangan, dan dashboard;
aturan agar data sintetis tidak menyerupai atau mengambil data dari rumah sakit, pegawai, mahasiswa, pasien, maupun transaksi nyata.

Laporan wajib menegaskan bahwa seluruh data SIMRS-e bersifat fiktif, termasuk data rumah sakit, SDM, pasien, pelayanan, keuangan, billing, pelaporan, dan audit. Tidak boleh ada data produksi atau data pribadi nyata yang dimasukkan ke dalam sistem, meskipun hanya untuk contoh atau pengujian.