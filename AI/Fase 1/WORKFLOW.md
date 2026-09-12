# SIMRS-e - Workflow Fase 1

## Prinsip Alur

Alur dari SIMRS-e dimulai dari tujuan pembelajaran bukan untuk transaksi yang digunakan pada rumah sakit seperti pada umumnya. Dosen menentukan kemampuan yang ingin dilatih, kemudia sistem menyediakan studi kasus, peran, data, tugas dan aturan penialainnya.

# Aktor dan Tanggung Jawab
<table>
    <tr>
        <th>
            Aktor
        </th>
        <th>
            Start
        </th>
        <th>
            Output
        </th>
    </tr>
    <tr>
        <th>
            Admintrator
        </th>
        <th>
            Struktur program dan rumah sakit
        </th>
        <th>
            Pengguna, hak akses, unit, master data, dan konfigurasi
        </th>
    </tr>
    <tr>
        <th>
            Dosen
        <th>
        <th>
            Capaian pembelajaran dan materi
        <th>
        <th>
            Skenario. tugas, peran, jadwal dan penilaian
        <th>
    </tr>
    <tr>
        <th>
            Mahasiswa
        </th>
        <th>
            Sesi yang ditugaskan
        </th>
        <th>
            Transaksi, keputusan, laporan dan hasil simulasi.
        </th>
    </tr>
</table>

## Alur
### Alur Persiapan oleh Adminitrastor
1. Membuat mata kuliah, periode (tahun ajaran, semester) dan kelas.
2. Menambahkan dosen dan mahasiswa.
3. Menentukan peran serta hak akses setiap pengguna.
4. Membuat rumah sakit simulasi beserta unit, poli, ruangan, jadwal, layanan, tarif dan petugas.
5. Memasukkan master dan sintetis.
6. Membuka ruang kerja kelas untuk dosen.

### Alur Pembuatan Skenario oleh Dosen
1. Memilih periode dan kelas.
2. Menentukan tujuan pembelajaran.
3. Menuliskan konteks kasus dan kondisi awal.
4. Memilih dan membuat simulasi serta membagikan peran mahasiswa.
5. Menyusun tugas untuk setiap peran.
6. Menentukan batas waktu dan aturan penyelesainnya.
7. Menambahkan kejadian yang dapat muncul selama sesi simulasi berjalan.
8. Menentukan data yang diharapkan di akhir proses.
9. Memantau selama sesi semulasi berjalan.

### Alur Mahasiswa Mengikuti Praktikum
1. Mahasiswa melihat sesi yang ditugaskan.
2. Mahasiswa membaca tujuan, konteks, peran, tugas, batas waktu dan aturan sesi.
3. Mahasiswa memulai percobaan.
4. Sistem membuat salinan data kasus untuk percobaan tersebut.
5. Mahasiswa menjalankan proses sesuai perannya.
6. Sistem memvalidasi data, status, hak akses dan urutan proses.
7. Sistem mencatat aktivitas, waktu, perubahan data dan kejadian yang terjadi.
8. Mahasiswa menyelesaikan tugas dan mengirimkan hasil.
9. Sistem mengunci transaksi unmtuk mencegak perubahan tanpa jejak.
10. Dosen meninjau proses dan hasil, lalu memberikan nilai serta umpan balik.

### Alur Rawat Jalan Dasar

    A["Pasien"] --> B["Pendaftaran"]
    B --> C["Antrean"]
    C --> D["Unit pelayanan"]
    D --> E["Rekam medis dan tindakan"]
    E --> F["Billing dan laporan"]


## Status

### Status Skenario
`Draft` → `Uji Coba` → `Dipublikasikan` → `Diarsipkan`

### Status Skenario`
`Terjadwal` → `Dibuka` → `Sedang Berjalan` → `Submit` → `Menunggu Penilaian` → `Dinilai` → `Ditutup`

### Status Percobaan Mahassiswa
`Belum dimulai` → `Berjalan` → `Tersimpan` → `Submit` → `Dikembalikan` → `Selesai`

## Reset dan Pengulangan
Reset hanya mengembalikan data transaksi pada poercibaan ke kondisi awal skenario. Master data, nilai, ataupun audit sesi sebelumnya tidak boleh ikut terhapus. Setiap pengulangan harus memiliki nomor percobaan dan waktu mulai yang berbeda.

## Batas Integrasi
Pada Fase 1, seluruh integrasi eksternal menggunakan data tiruan atau simulator internal. Tidak ada pengiriman ke SATUSEHAT, BPJS, sistem pembayaran, atau sistem rumah sakit produksi.

## Alur Mahasiswa
Pada saat sesi dimulai:
- Mahasiswa masuk ke kelas atau sesi praktikum.
- Mahasiswa melihat tahun ajaran, semester, mata kuliah, dan kelompoknya.
- Sistem menampilkan peran yang diberikan.
- Mahasiswa membaca tujuan, konteks kasus, tugas, dan batasan perannya.
- Mahasiswa memulai percobaan.
- Mahasiswa menjalankan proses sesuai peran.
- Mahasiswa menerima atau menyerahkan informasi kepada peran lain.
- Sistem mengubah status proses sesuai tindakan yang dilakukan.
- Sistem mencatat seluruh aktivitas.
- Mahasiswa menyelesaikan tugas dan menyerahkan hasil.
- Dosen menilai proses kerja setiap peran dan hasil akhir kelompok.


## Contoh Pembagian Peran
Dalam satu skenario rawat jalan, mahasiswa dapat dibagi menjadi:
- mahasiswa A sebagai pasien;
- mahasiswa B sebagai petugas pendaftaran;
- mahasiswa C sebagai petugas rekam medis;
- mahasiswa D sebagai dokter;
- mahasiswa E sebagai petugas farmasi;
- mahasiswa F sebagai petugas laboratorium;
- mahasiswa G sebagai kasir;
- mahasiswa H sebagai kepala unit atau pengamat.