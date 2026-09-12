# SIMRS-e - Aturan UI Fase 1

## Tujuan UI
Antarmuka SIMRS-e harus membantu mahasiswa memahami posisi mereka dalam proses administrasi rumah sakit, membantu dosen mengelola skenario, dan membuat aktivitas dapat diamati serta dinilai. Tampilan harus terasa seperti aplikasi administrasi rumah sakit nyata, tetapi selalu memberikan penanda bahwa seluruh data berada dalam lingkungan simulasi.

## Bahasa dan Istilah
- Menggunakan bahasa Indonesia sebagai bahasa utama
- Gunakan istilah rumah sakit yang konsisten di seluruh halaman
- Hindari singkatan yang belum diperkenalkan pada materi
- Tampilan keterangan singkat untuk istilah teknis seperti episode kunjungan, penjamin, kode diagnosis, dan status klaim
- Gunakan format tanggal `DD-MMMM-YYYY` dan waktu 24 Jam
- Nominal uang menggunakan format Rupiah yang konsisten

## Struktur Halaman
- Navbar & Header : menu sesuai peran, nama sistem, kelas atau sesi aktif, penanda simulasi, notifikasi dan akun pengguna.
- Breadcrumb : menunjukan lokasi halaman.
- Judul halaman : nama modul dan konteksnya.
- Area Aksi : tombol utama, tombol sekunder, status.
- Konten Utama : table, form, detail page, dashboard.
- Panel Bantuan : ditampilkan untuk info penjelasan fitur aplikasi.

Pada layar mahasiswa, konteks sesi harus tetap terlihat ketika mahasiswa berpindah antarhalaman. Jangan membuat mahasiswa kembali ke halaman awal hanya untuk memeriksa tugas atau batas waktu.

## Menu Berdasarkan Peran

### Administrator
Dashboard, Pengguna, Master data, Konfigurasi, Audit, Pengaturan Sistem.

### Dosen
Dashboard, materi, skenario, sesi praktikum, daftar peserta, monitor aktivitas, catatan observasi, penilaian, laporan dan arsip.

### Mahasiswa
Dashboard, Kelas, materi, sesi aktif, tugas, simulasi, transaksi, laporan dan umpan balik.

Menu yang tidak diizinkan oleh peran tidak boleh ditampilkan. Akses melalui URL harus langsung ditolak.


## Konten Fitur Minimum Fase 1
- Login dan pemilihan tahun ajaran, kelas atau sesi
- Dashboard administrator
- Dashboard dosen
- Dashboard mahasiswa
- Daftar kelas dan detail kelas
- Daftar skenario dan pembuat skenario
- Detail sesi dengan tujuan, peran, tugas dan batas waktu
- Daftar SDM untuk simulasi
- Pendaftaran pasien dan pembuatan kunjungan
- Anteran
- Detail kunjungan dan rekam medis simulasi
- Billing dan kasir simulasi
- Monitor aktivitas sesi
- Penilaian
- Laporan hasil praktikum

## Aturan

### Aturan Formulir
- Label berada di atas input dan tidak hilang ketika input terisi
- Field wajib diberi penanda yang konsisten
- Validasi dilakukan saat pengguna meninggalkan field dan saat formulir dikirim
- Pesan kesalahan menjelaskan apa yang perlu diperbaiki dan berada dekat dengan field terkait
- Formulir panjang dibagi menjadi beberapa bagian berdasarkan proses, bukan hanya berdasarkan jenis input
- Data yang sudah tersimpan menampilkan waktu penyimpanan terakhir
- Perubahan yang belum disimpan harus diberikan peringatan ketika pengguna meninggalkan halaman
- Data yang berasal dari skenario atau master data ditampilkan sebagai pilihan terkontrol, bukan input bebas, apabila nilai bebas dapat merusak alur
- Field yang terkunci harus tetap terlihat dengan alasan penguncian

### Aturan Table dan Pencarian
- Gunakan pencarian untuk data pasien, nomor rekam medis, skenario, kelas, dan sesi
- Tampilkan filter yang paling sering digunakan tanpa menyembunyikannya di menu tambahan
- Sediakan pagination dan jumlah data per halaman
- Header table tetap terbaca ketika pengguna menggulir data panjang
- Aksi baris ditempatkan konsisten di sisi kanan
- Kolom utama tidak boleh hilang hanya karna layar diperkecil, kolom tambahan dapat masuk ke halaman detail
- Tampilkan keadaan kosong dengan penjelasan dan tindakan berikutnya 


## Penanda Simulasi
- Tampilkan label SIMULASI pada header dan halaman yang memproses pasien atau transaksi
- Tampilkan Data SINTETIS pada data pasien, tenaga kesehatan dan transaksi fiktif
- Jangan menggunakan identitas yang dapat disalahartikan sebagai data pasien nnyata
- Pada dokumen yang dapat diunduh, cantumkan tanda `DOKUMEN SIMULASI`
- Tampilkan nama skenario, nomor sesi, nomor percobaan, dan peran mahasiswa detail transaksi

## Status dan Warma
Gunakan status teks bersama ikon atau warna. Warna tidak boleh menjadi satu-satunya pembeda.

<table>
    <tr>
        <th>Status</th>
        <th>Makna</th>
    </tr>
    <tr>
        <th>Draft</th>
        <th>Belum siap digunakan peserta</th>
    </tr>
    <tr>
        <th>Aktif</th>
        <th>Dapat dikerjakan atau sedang berjalan</th>
    </tr>
    <tr>
        <th>Menunggu</th>
        <th>Memerlukan tindakan dari peran lain</th>
    </tr>
    <tr>
        <th>Selesai</th>
        <th>Tugas atau proses sudah memenuhi kondisi selesai</th>
    </tr>
    <tr>
        <th>Terlambat</th>
        <th>Melewati batas waktu</th>
    </tr>
    <tr>
        <th>Dikembalikan</th>
        <th>Perlu diperbaiki sebelum dinilai ulang</th>
    </tr>
    <tr>
        <th>Terkunci</th>
        <th>Tidak dapat diubah pada kondisi saat ini</th>
    </tr>
    <tr>
        <th>Gagal</th>
        <th>Proses tidak dapat dilanjutkan dan perlu ditinjau</th>
    </tr>
</table>

## Halaman Skenario
Pada halaman pembuatan skenario, field berikut harus menjadi bagian wajib :
1. Tahun ajaran
2. Semester
3. Mata kuliah
4. Kelas
5. Kelompok atau mahasiswa
6. Nama skenario
7. Tujuan pembelajaran

## Dashboard

### Dashboard Mahasiswa
Dashboard mahasiswa menampilkan:
- kelas yang diikuti;
- sesi yang akan datang dan yang sedang berjalan;
- peran pada sesi aktif;
- tugas yang belum selesai;
- waktu tersisa;
- status percobaan;
- nilai dan umpan balik yang sudah dibuka;
- tautan langsung ke pekerjaan yang perlu dilanjutkan.

Dashboard tidak perlu menampilkan metrik manajemen yang tidak berhubungan dengan tugas mahasiswa.

### Dashboard Dosen
Dashboard dosen menampilkan :
- jumlah peserta dan kelompok;
- sesi yang terjadwal, aktif, terlambat, dan selesai;
- progres tiap peserta;
- tugas yang belum dinilai;
- kejadian yang sedang aktif;
- ringkasan kesalahan umum;
- akses ke audit trail dan laporan.

Dosen dapat memantau sesi tanpa mengambil alih pekerjaan mahasiswa. Tindakan mengambil alih, mengubah data peserta, atau mereset sesi harus memiliki konfirmasi dan alasan.

## Skenario dan Sesi
Halaman detail sesi harus selalu menampilkan :
- tujuan pembelajaran;
- konteks kasus;
- peran pengguna;
- daftar tugas;
- aturan sesi;
- batas waktu;
- indikator progres;
- tombol mulai, simpan, serahkan, jeda, atau keluar sesuai status;
- informasi bahwa data akan tercatat dalam audit trail.

Saat sesi berjalan, sistem boleh menampilkan petunjuk yang memang ditetapkan dosen. Sistem tidak boleh menyembunyikan aturan penting di balik perilaku antarmuka yang membingungkan.

## Notifikasi dan Pesan Sistem
- Pesan sukses menyebutkan tindakan yang berhasil dilakukan.
- Pesan error menyebutkan penyebab yang dapat dipahami dan tindakan berikutnya.
- Peringatan waktu menggunakan bahasa yang jelas dan tidak mengganggu pekerjaan utama.
- Notifikasi kejadian masuk ke peran yang memang terdampak.
- Jangan menampilkan stack trace, kode internal, atau informasi teknis server kepada pengguna.

## Aksesibilitas dan Penggunaan di Laboratorium
- Seluruh fungsi utama dapat digunakan dengan keyboard.
- Fokus keyboard terlihat jelas.
- Kontras teks dan latar dapat dibaca pada proyektor maupun monitor laboratorium.
- Ukuran teks dasar nyaman dibaca tanpa zoom tambahan.
- Tombol utama memiliki label tindakan yang jelas, misalnya Simpan pendaftaran, bukan Submit.
- Sistem menargetkan layar desktop atau laptop, tetapi halaman penting tetap dapat digunakan pada lebar minimal 1024 piksel.
- Jangan mengandalkan drag-and-drop sebagai satu-satunya cara menyelesaikan tugas.

## Aksi berisiko
Tindakan berikut harus meminta konfirmasi:
- reset percobaan;
- membatalkan kunjungan;
- menghapus pasien simulasi;
- mempublikasikan skenario;
- menutup sesi;
- mengembalikan tugas kepada mahasiswa;
- membuka atau mengunci kembali penilaian.

Dialog konfirmasi harus menjelaskan dampak tindakan, objek yang terkena dampak, dan apakah tindakan masih dapat dibatalkan.

## Keadaan Halaman yang Wajib dirancang

Setiap halaman harus memiliki rancangan untuk:
- loading;
- data kosong;
- data tidak ditemukan;
- validasi gagal;
- tidak memiliki hak akses;
- data terkunci;
- sesi berakhir;
- jaringan atau server gagal;
- data berhasil disimpan;
- perubahan belum disimpan.

## Batasan Tampilan
- Jangan menampilkan fitur produksi yang belum didukung oleh Fase 1.
- Jangan menampilkan tombol integrasi SATUSEHAT atau BPJS produksi.
- Jangan menyebut data simulasi sebagai rekam medis pasien nyata.
- Jangan membuat rekomendasi klinis otomatis yang dapat dianggap sebagai keputusan tenaga kesehatan.