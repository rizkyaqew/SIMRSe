# KERANGKA MODUL SISTEM INFORMASI MANAJEMEN RUMAH SAKIT (SIMRS)

## Fondasi Perancangan SIMRS dan Pengembangan SIMRS Edukasi

---

## 1. Tujuan Dokumen

Dokumen ini menetapkan kerangka domain, modul, submodul, dan fungsi utama yang perlu tersedia pada **Sistem Informasi Manajemen Rumah Sakit (SIMRS)** yang ideal. Kerangka ini disusun sebagai fondasi sebelum SIMRS dikembangkan menjadi **SIMRS Edukasi (SIMRS-E)** untuk Program Studi Administrasi Rumah Sakit.

Dokumen ini tidak menetapkan struktur tabel basis data, teknologi pemrograman, atau desain antarmuka final. Fokus dokumen adalah memastikan bahwa seluruh fungsi rumah sakit yang relevan telah terpetakan secara utuh, saling terhubung, dan mempunyai batas tanggung jawab yang jelas.

Pada pengembangan SIMRS-E, domain SIMRS pada dokumen ini tetap dipertahankan sebagai **dunia rumah sakit digital**. Fitur pendidikan seperti Session, Skenario, Simulation Run, Event, Checkpoint, Evidence, dan Replay ditambahkan di atasnya tanpa menggandakan domain rumah sakit.

---

# 2. Prinsip Dasar SIMRS

SIMRS ideal harus mengikuti prinsip berikut:

- [ ] Berorientasi pada pasien dan perjalanan pelayanan.
- [ ] Satu pasien mempunyai satu identitas canonical dalam satu lingkungan rumah sakit.
- [ ] Setiap fakta bisnis mempunyai satu authoritative owner.
- [ ] Tidak ada pengisian ulang data yang sudah tersedia dari sumber resmi.
- [ ] Clinical truth, operational truth, dan financial truth dipisahkan namun saling terhubung.
- [ ] Seluruh aktivitas penting dapat diaudit.
- [ ] Riwayat perubahan tidak dihapus hanya karena data diperbarui.
- [ ] Dokumen final tidak ditimpa tanpa amendemen atau versi baru.
- [ ] Hak akses mengikuti peran, unit, kewenangan, dan konteks pelayanan.
- [ ] Sistem menggunakan facade untuk menyederhanakan pekerjaan tanpa menghilangkan formalitas.
- [ ] Modul lain tidak boleh mengubah source of truth milik domain lain secara langsung.
- [ ] Pelayanan aktual menjadi dasar konsekuensi finansial.
- [ ] Laporan berasal dari transaksi resmi, bukan input ulang angka.
- [ ] Integrasi eksternal tidak boleh menjadi satu-satunya sumber kebenaran internal.
- [ ] Sistem dapat berkembang secara modular tanpa mendesain ulang seluruh fondasi.

---

# 3. Peta Modul Utama SIMRS

```text
SIMRS
│
├── A. Platform & Data Induk
├── B. Administrasi Pasien
├── C. Pelayanan Utama
├── D. Rekam Medis & Dokumentasi Klinis
├── E. Keperawatan & Perintah Pelayanan
├── F. Pelayanan Penunjang
├── G. Pelayanan Klinis Lanjutan
├── H. Siklus Pendapatan, Pembayaran & Klaim
├── I. Rantai Pasok, Pengadaan & Aset
├── J. Operasional Penunjang Rumah Sakit
├── K. Sumber Daya Manusia & Kredensial
├── L. Layanan Pasien Digital & Home Care
├── M. Mutu, Keselamatan, PPI, K3 & Risiko
├── N. Kematian, Jenazah & Forensik
├── O. Laporan & Analitik
├── P. Integrasi & Interoperabilitas
├── Q. Keamanan, Audit & Tata Kelola
└── R. Administrasi & Konfigurasi Sistem
```

---

# 4. PLATFORM & DATA INDUK

Platform dan data induk menjadi fondasi seluruh modul. Data yang digunakan bersama tidak boleh dibuat ulang oleh setiap unit.

## 4.1 Struktur Organisasi Rumah Sakit

- [ ] Rumah sakit.
- [ ] Cabang/site bila ada.
- [ ] Gedung.
- [ ] Lantai.
- [ ] Instalasi.
- [ ] Unit.
- [ ] Poliklinik.
- [ ] Ruang pelayanan.
- [ ] Kamar.
- [ ] Tempat tidur.
- [ ] Gudang.
- [ ] Farmasi.
- [ ] Laboratorium.
- [ ] Radiologi.
- [ ] Kamar operasi.
- [ ] ICU/HCU/NICU/PICU.
- [ ] Kamar jenazah.
- [ ] Area administrasi.
- [ ] Area publik.
- [ ] Lokasi eksternal/Home Care.

## 4.2 Data Induk Tenaga

- [ ] Pegawai.
- [ ] Dokter.
- [ ] Dokter gigi.
- [ ] Perawat.
- [ ] Bidan.
- [ ] Apoteker.
- [ ] Tenaga teknis kefarmasian.
- [ ] Tenaga laboratorium.
- [ ] Radiografer.
- [ ] Nutrisionis.
- [ ] Fisioterapis.
- [ ] Tenaga kesehatan lain.
- [ ] Petugas administrasi.
- [ ] Petugas logistik.
- [ ] Petugas keuangan.
- [ ] Petugas klaim.
- [ ] Manajemen.

## 4.3 Data Induk Pelayanan

- [ ] Jenis pelayanan.
- [ ] Tindakan.
- [ ] Pemeriksaan.
- [ ] Jenis konsultasi.
- [ ] Paket pelayanan.
- [ ] Kelas perawatan.
- [ ] Tarif.
- [ ] Komponen tarif.
- [ ] Penjamin.
- [ ] Jenis pembayaran.
- [ ] Jenis dokumen.
- [ ] Jenis consent.
- [ ] Prioritas layanan.
- [ ] Status operasional.

## 4.4 Terminologi & Klasifikasi

- [ ] Diagnosis.
- [ ] Prosedur.
- [ ] Obat.
- [ ] Pemeriksaan laboratorium.
- [ ] Pemeriksaan radiologi.
- [ ] Alergi.
- [ ] Kondisi klinis.
- [ ] Kode klasifikasi.
- [ ] Satuan.
- [ ] Referensi standar lain.

## 4.5 Pengguna & Hak Akses

- [ ] Akun.
- [ ] Profil.
- [ ] Role.
- [ ] Capability.
- [ ] Organizational scope.
- [ ] Resource scope.
- [ ] Hak baca.
- [ ] Hak input.
- [ ] Hak verifikasi.
- [ ] Hak approval.
- [ ] Hak void/cancel.
- [ ] Hak ekspor.
- [ ] Akses darurat.

## 4.6 Notifikasi

- [ ] Notifikasi internal.
- [ ] Notifikasi worklist.
- [ ] Notifikasi kritis.
- [ ] Pengingat.
- [ ] Notifikasi pasien.
- [ ] Kanal komunikasi eksternal bila digunakan.

---

# 5. ADMINISTRASI PASIEN

Administrasi pasien menjadi pintu masuk seluruh pelayanan.

## 5.1 Manajemen Identitas Pasien / Master Patient Index

- [ ] Pasien baru.
- [ ] Pasien lama.
- [ ] Nomor Rekam Medis.
- [ ] NIK.
- [ ] Nomor JKN.
- [ ] Passport.
- [ ] Identitas eksternal.
- [ ] Nama lengkap.
- [ ] Nama alias.
- [ ] Tempat/tanggal lahir.
- [ ] Jenis kelamin.
- [ ] Alamat.
- [ ] Telepon.
- [ ] Email.
- [ ] Kontak keluarga.
- [ ] Penanggung jawab.
- [ ] Wali.
- [ ] Riwayat perubahan identitas.
- [ ] Deteksi pasien ganda.
- [ ] Merge pasien.
- [ ] Pasien sementara/provisional.

## 5.2 Janji Temu

- [ ] Jadwal poli.
- [ ] Jadwal dokter.
- [ ] Slot.
- [ ] Kuota.
- [ ] Booking.
- [ ] Konfirmasi.
- [ ] Penjadwalan ulang.
- [ ] Pembatalan.
- [ ] Daftar tunggu.
- [ ] No-show.
- [ ] Riwayat appointment.

## 5.3 Pendaftaran

- [ ] Rawat Jalan.
- [ ] IGD.
- [ ] Rawat Inap.
- [ ] Pemeriksaan penunjang langsung.
- [ ] Pelayanan khusus.
- [ ] Walk-in.
- [ ] Appointment.
- [ ] Rujukan.
- [ ] Penjamin.
- [ ] Dokter tujuan.
- [ ] Unit tujuan.
- [ ] Masalah administrasi.

## 5.4 Antrean

- [ ] Antrean pendaftaran.
- [ ] Poli.
- [ ] Farmasi.
- [ ] Laboratorium.
- [ ] Radiologi.
- [ ] Kasir.
- [ ] Nomor antrean.
- [ ] Panggilan.
- [ ] Prioritas.
- [ ] Waiting.
- [ ] Called.
- [ ] Serving.
- [ ] Completed.
- [ ] Skipped.
- [ ] No-show.
- [ ] Waktu tunggu.
- [ ] Waktu layanan.

## 5.5 Rujukan

- [ ] Rujukan masuk.
- [ ] Rujukan keluar.
- [ ] Rujuk balik.
- [ ] Konsultasi internal.
- [ ] Transfer antar-fasilitas.
- [ ] Nomor rujukan.
- [ ] Validitas.
- [ ] Tujuan.
- [ ] Dokumen pendukung.
- [ ] Status.

## 5.6 Penjamin & Kelayakan

- [ ] Pasien pribadi.
- [ ] JKN/BPJS.
- [ ] Asuransi.
- [ ] Perusahaan.
- [ ] Institusi.
- [ ] Coverage.
- [ ] Eligibility.
- [ ] Pre-authorization.
- [ ] Limit.
- [ ] Kelas.
- [ ] Co-payment.
- [ ] Exclusion.
- [ ] Status pending/ineligible.

---

# 6. EPISODE PELAYANAN & ENCOUNTER

SIMRS perlu membedakan pasien, episode pelayanan, dan encounter.

## 6.1 Episode Pelayanan

- [ ] Satu rangkaian pelayanan terkait.
- [ ] Dapat memiliki beberapa encounter.
- [ ] Dapat berelasi ke episode sebelumnya.
- [ ] Follow-up.
- [ ] Readmission.
- [ ] Continuation.

## 6.2 Encounter

Jenis encounter dapat mencakup:

- [ ] Rawat Jalan.
- [ ] IGD.
- [ ] Rawat Inap.
- [ ] Konsultasi.
- [ ] Prosedur.
- [ ] Diagnostik.
- [ ] Hemodialisis.
- [ ] Rehabilitasi.
- [ ] Home Care.
- [ ] Pelayanan khusus lain.

## 6.3 Riwayat Encounter

- [ ] Waktu mulai.
- [ ] Waktu selesai.
- [ ] Unit.
- [ ] Lokasi.
- [ ] Penanggung jawab.
- [ ] Tim pelayanan.
- [ ] Status.
- [ ] Parent encounter bila ada.
- [ ] Episode sumber.

---

# 7. INSTALASI GAWAT DARURAT

## 7.1 Kedatangan

- [ ] Datang sendiri.
- [ ] Keluarga.
- [ ] Ambulans.
- [ ] Rujukan.
- [ ] Transfer.
- [ ] Pasien tidak dikenal.

## 7.2 Pendaftaran Darurat

- [ ] Existing patient.
- [ ] Provisional patient.
- [ ] Identifikasi cepat.
- [ ] Penjamin dapat dilengkapi paralel.
- [ ] Pendaftaran tidak menghambat pelayanan emergensi.

## 7.3 Triase

- [ ] Waktu tiba.
- [ ] Waktu triase.
- [ ] Keluhan utama.
- [ ] Tanda vital.
- [ ] Kategori kegawatan.
- [ ] Petugas.
- [ ] Triase ulang.
- [ ] Riwayat.

## 7.4 Papan IGD

- [ ] Pasien aktif.
- [ ] Kategori triase.
- [ ] Lokasi.
- [ ] Lama menunggu.
- [ ] Tahap pelayanan.
- [ ] Menunggu hasil.
- [ ] Menunggu admission.
- [ ] Observasi.

## 7.5 Pelayanan IGD

- [ ] Pengkajian.
- [ ] Pemeriksaan dokter.
- [ ] Diagnosis.
- [ ] Tindakan.
- [ ] Perintah pelayanan.
- [ ] Obat.
- [ ] Keperawatan.
- [ ] Observasi.
- [ ] Handover.

## 7.6 Disposisi

- [ ] Pulang.
- [ ] Rawat inap.
- [ ] ICU.
- [ ] Operasi.
- [ ] Rujuk.
- [ ] Meninggal.
- [ ] Pulang atas permintaan sendiri bila berlaku.

---

# 8. RAWAT JALAN

## 8.1 Pusat Kerja Rawat Jalan

- [ ] Jadwal poli.
- [ ] Dokter.
- [ ] Pasien terdaftar.
- [ ] Menunggu.
- [ ] Sedang dilayani.
- [ ] Selesai.
- [ ] No-show.
- [ ] Waktu tunggu.

## 8.2 Check-in

- [ ] Kehadiran.
- [ ] Appointment.
- [ ] Walk-in.
- [ ] Waktu datang.

## 8.3 Pengkajian Awal

- [ ] Keluhan.
- [ ] Tanda vital.
- [ ] Berat badan.
- [ ] Tinggi badan.
- [ ] Nyeri.
- [ ] Risiko tertentu.
- [ ] Alergi.

## 8.4 Pemeriksaan Dokter

- [ ] Catatan.
- [ ] Diagnosis.
- [ ] Tindakan.
- [ ] Resep.
- [ ] Perintah pelayanan.
- [ ] Konsultasi.
- [ ] Tindak lanjut.

## 8.5 Tindak Lanjut

- [ ] Kontrol.
- [ ] Appointment berikutnya.
- [ ] Rujukan.
- [ ] Admission request.
- [ ] Tindakan terjadwal.
- [ ] Selesai tanpa kontrol.

---

# 9. PENERIMAAN, PEMINDAHAN, DAN PEMULANGAN PASIEN (ADT)

## 9.1 Permintaan Rawat Inap

- [ ] Asal permintaan.
- [ ] Pasien.
- [ ] Dokter.
- [ ] Diagnosis/alasan.
- [ ] Kelas.
- [ ] Unit.
- [ ] Prioritas.
- [ ] Penjamin.
- [ ] Kebutuhan khusus.

## 9.2 Admission

- [ ] Verifikasi administrasi.
- [ ] Ketersediaan tempat tidur.
- [ ] Reservasi.
- [ ] Waktu admission.
- [ ] Encounter Rawat Inap.

## 9.3 Manajemen Tempat Tidur

- [ ] Tersedia.
- [ ] Dipesan.
- [ ] Terisi.
- [ ] Menunggu pembersihan.
- [ ] Sedang dibersihkan.
- [ ] Pemeliharaan.
- [ ] Diblokir.
- [ ] Tidak tersedia.

## 9.4 Transfer

- [ ] Permintaan transfer.
- [ ] Target unit.
- [ ] Bed.
- [ ] Handover.
- [ ] Waktu.
- [ ] Riwayat lokasi.

## 9.5 Discharge

- [ ] Keputusan dokter.
- [ ] Discharge planning.
- [ ] Actual departure.
- [ ] Encounter completion.
- [ ] Status bed pascapulang.

---

# 10. RAWAT INAP

## 10.1 Pusat Kerja Rawat Inap

- [ ] Pasien aktif.
- [ ] Bed.
- [ ] DPJP.
- [ ] Tim.
- [ ] Order aktif.
- [ ] Obat.
- [ ] Perawatan.
- [ ] Discharge readiness.
- [ ] Masalah administrasi.

## 10.2 DPJP & Tim Pelayanan

- [ ] DPJP.
- [ ] Dokter anggota.
- [ ] Perawat.
- [ ] Konsultan.
- [ ] Tenaga lain.
- [ ] Riwayat perubahan tim.

## 10.3 Pelayanan Harian

- [ ] Catatan dokter.
- [ ] Catatan perawat.
- [ ] Tanda vital.
- [ ] Obat.
- [ ] Laboratorium.
- [ ] Radiologi.
- [ ] Diet.
- [ ] Konsultasi.
- [ ] Tindakan.
- [ ] Transfer.

## 10.4 Discharge Planning

- [ ] Estimasi pulang.
- [ ] Resume.
- [ ] Obat.
- [ ] Edukasi.
- [ ] Kontrol.
- [ ] Home Care.
- [ ] Transportasi.
- [ ] Administrasi.

---

# 11. REKAM MEDIS

Rekam Medis merupakan kumpulan catatan pelayanan, bukan satu formulir tunggal.

## 11.1 Data Longitudinal

- [ ] Alergi.
- [ ] Problem list.
- [ ] Riwayat penyakit tertentu.
- [ ] Riwayat kunjungan.

## 11.2 Dokumentasi Encounter

- [ ] Pengkajian.
- [ ] Catatan dokter.
- [ ] Catatan perawat.
- [ ] Diagnosis.
- [ ] Tindakan.
- [ ] Perintah.
- [ ] Hasil.
- [ ] Obat.
- [ ] Edukasi.

## 11.3 Dokumen Formal

- [ ] Resume.
- [ ] Persetujuan umum.
- [ ] Informed consent.
- [ ] Persetujuan operasi.
- [ ] Persetujuan anestesi.
- [ ] Persetujuan transfusi.
- [ ] Rujukan.
- [ ] Surat kontrol.
- [ ] Dokumen lain.

## 11.4 Kelengkapan

- [ ] Checklist.
- [ ] Dokumen belum lengkap.
- [ ] Tanda tangan belum lengkap.
- [ ] Diagnosis belum lengkap.
- [ ] Resume belum final.
- [ ] Worklist deficiency.

## 11.5 Pengodean

- [ ] Diagnosis utama.
- [ ] Diagnosis sekunder.
- [ ] Prosedur.
- [ ] Kode.
- [ ] Coder.
- [ ] Verifikasi.
- [ ] Permintaan klarifikasi.
- [ ] Histori.

## 11.6 Amendemen

- [ ] Koreksi.
- [ ] Addendum.
- [ ] Versi.
- [ ] Alasan.
- [ ] Penulis.
- [ ] Audit.

## 11.7 Retensi & Arsip

- [ ] Aktif.
- [ ] Arsip.
- [ ] Periode retensi.
- [ ] Legal hold.
- [ ] Pemusnahan sesuai aturan.

## 11.8 Pelepasan Informasi

- [ ] Permintaan.
- [ ] Verifikasi pemohon.
- [ ] Persetujuan.
- [ ] Informasi yang dilepas.
- [ ] Audit.

---

# 12. KEPERAWATAN

## 12.1 Assignment & Shift

- [ ] Shift.
- [ ] Assignment pasien.
- [ ] Tim.
- [ ] Handover.

## 12.2 Pengkajian

- [ ] Pengkajian awal.
- [ ] Nyeri.
- [ ] Risiko jatuh.
- [ ] Risiko luka tekan.
- [ ] Intake-output.
- [ ] Kondisi umum.

## 12.3 Tanda Vital

- [ ] Tekanan darah.
- [ ] Nadi.
- [ ] Pernapasan.
- [ ] Suhu.
- [ ] Saturasi oksigen.
- [ ] Histori/time series.

## 12.4 Asuhan

- [ ] Diagnosis keperawatan.
- [ ] Rencana.
- [ ] Intervensi.
- [ ] Implementasi.
- [ ] Evaluasi.

## 12.5 Pemberian Obat

- [ ] Jadwal.
- [ ] Diberikan.
- [ ] Ditunda.
- [ ] Ditolak.
- [ ] Tidak diberikan.
- [ ] Alasan.

## 12.6 Handover

- [ ] Masalah aktif.
- [ ] Obat.
- [ ] Order pending.
- [ ] Risiko.
- [ ] Tindakan berikutnya.
- [ ] Catatan penting.

---

# 13. PERINTAH PELAYANAN

## 13.1 Jenis Perintah

- [ ] Laboratorium.
- [ ] Radiologi.
- [ ] Obat.
- [ ] Tindakan.
- [ ] Konsultasi.
- [ ] Diet.
- [ ] Rehabilitasi.
- [ ] Produk darah.
- [ ] Pelayanan khusus.

## 13.2 Lifecycle

- [ ] Dibuat.
- [ ] Diajukan.
- [ ] Diterima.
- [ ] Dijadwalkan.
- [ ] Sedang dilaksanakan.
- [ ] Selesai.
- [ ] Ditahan.
- [ ] Ditolak.
- [ ] Dibatalkan.
- [ ] Dihentikan.

## 13.3 Provenance

- [ ] Pemberi perintah.
- [ ] Pencatat.
- [ ] Pelaksana.
- [ ] Verifikator.
- [ ] Approver bila perlu.

## 13.4 Karakter Perintah

- [ ] Sekali.
- [ ] Berulang.
- [ ] Terjadwal.
- [ ] Prioritas.
- [ ] Duplicate warning.
- [ ] Resource warning.

---

# 14. FARMASI

## 14.1 Resep & Verifikasi

- [ ] Resep baru.
- [ ] Review.
- [ ] Alergi.
- [ ] Klarifikasi.
- [ ] Substitusi.
- [ ] Status.

## 14.2 Dispensing

- [ ] Penyiapan.
- [ ] Batch.
- [ ] Kedaluwarsa.
- [ ] Jumlah.
- [ ] Penyerahan.
- [ ] Petugas.
- [ ] Waktu.

## 14.3 Retur

- [ ] Permintaan.
- [ ] Verifikasi.
- [ ] Penerimaan.
- [ ] Restock bila valid.

## 14.4 Formularium

- [ ] Obat aktif.
- [ ] Pembatasan.
- [ ] Status.
- [ ] Riwayat.

## 14.5 Analitik Farmasi

- [ ] Jumlah resep.
- [ ] Waktu tunggu.
- [ ] Waktu dispensing.
- [ ] Pemakaian.
- [ ] Retur.
- [ ] Stok kritis.
- [ ] Kedaluwarsa.

---

# 15. LABORATORIUM

## 15.1 Worklist

- [ ] Permintaan.
- [ ] Prioritas.
- [ ] Menunggu spesimen.
- [ ] Sedang diproses.
- [ ] Menunggu verifikasi.

## 15.2 Spesimen

- [ ] Jenis.
- [ ] Barcode.
- [ ] Pengambilan.
- [ ] Penerimaan.
- [ ] Penolakan.
- [ ] Pengambilan ulang.

## 15.3 Pemeriksaan

- [ ] Worklist.
- [ ] Pelaksanaan.
- [ ] Analyzer.
- [ ] Status.
- [ ] Waktu.

## 15.4 Hasil

- [ ] Parameter.
- [ ] Nilai.
- [ ] Satuan.
- [ ] Nilai rujukan.
- [ ] Flag.
- [ ] Draft.
- [ ] Verifikasi.
- [ ] Final.
- [ ] Amendemen.

## 15.5 Hasil Kritis

- [ ] Notifikasi.
- [ ] Penerima.
- [ ] Waktu.
- [ ] Acknowledgement.

---

# 16. RADIOLOGI & USG

## 16.1 Perintah

- [ ] Jenis pemeriksaan.
- [ ] Bagian tubuh.
- [ ] Alasan klinis.
- [ ] Prioritas.

## 16.2 Penjadwalan

- [ ] Slot.
- [ ] Modalitas.
- [ ] Resource.
- [ ] Konflik.
- [ ] Prioritas emergensi.

## 16.3 Pelaksanaan

- [ ] Petugas.
- [ ] Peralatan.
- [ ] Mulai.
- [ ] Selesai.
- [ ] Status.

## 16.4 Citra

- [ ] PACS.
- [ ] Thumbnail.
- [ ] Status citra.
- [ ] Viewer.

## 16.5 Laporan

- [ ] Draft.
- [ ] Verifikasi.
- [ ] Final.
- [ ] Amendemen.

---

# 17. OPERASI & KAMAR OPERASI

## 17.1 Permintaan Operasi

- [ ] Diagnosis.
- [ ] Prosedur.
- [ ] Prioritas.
- [ ] Operator.
- [ ] Kebutuhan.

## 17.2 Penjadwalan

- [ ] Kamar.
- [ ] Operator.
- [ ] Anestesi.
- [ ] Tim.
- [ ] Peralatan.
- [ ] Waktu.

## 17.3 Persiapan

- [ ] Consent.
- [ ] Checklist keselamatan.
- [ ] Pemeriksaan pendukung.
- [ ] Material.
- [ ] Implant.
- [ ] Bed pascaoperasi.

## 17.4 Pelaksanaan

- [ ] Waktu mulai.
- [ ] Waktu selesai.
- [ ] Operator.
- [ ] Tim.
- [ ] Tindakan.
- [ ] Material.
- [ ] Implant.
- [ ] Obat.
- [ ] Catatan.

## 17.5 Recovery

- [ ] Recovery room.
- [ ] Kondisi.
- [ ] Instruksi.
- [ ] Transfer ke ICU/rawat inap.

---

# 18. ANESTESI

- [ ] Penilaian pra-anestesi.
- [ ] Rencana.
- [ ] Jenis anestesi.
- [ ] Monitoring.
- [ ] Obat.
- [ ] Cairan.
- [ ] Dokumentasi.
- [ ] Recovery.

---

# 19. ICU / HCU / NICU / PICU

- [ ] Admission.
- [ ] Bed.
- [ ] Level perawatan.
- [ ] Monitoring.
- [ ] Ventilator sebagai resource.
- [ ] Infus.
- [ ] Cairan.
- [ ] Obat berisiko tinggi.
- [ ] Transfer.
- [ ] Lama rawat.
- [ ] Utilisasi.

---

# 20. HEMODIALISIS

- [ ] Jadwal.
- [ ] Pasien.
- [ ] Mesin.
- [ ] Pre-HD.
- [ ] Perintah.
- [ ] Pelaksanaan.
- [ ] Monitoring.
- [ ] Obat.
- [ ] Consumable.
- [ ] Post-HD.
- [ ] Billing.

---

# 21. BANK DARAH & TRANSFUSI

- [ ] Permintaan produk darah.
- [ ] Golongan darah.
- [ ] Uji kompatibilitas.
- [ ] Reservasi.
- [ ] Issue.
- [ ] Distribusi.
- [ ] Pemberian.
- [ ] Monitoring.
- [ ] Reaksi transfusi.
- [ ] Traceability.

---

# 22. GIZI & DAPUR

## 22.1 Gizi

- [ ] Pengkajian.
- [ ] Diet order.
- [ ] Jenis diet.
- [ ] Alergi makanan.
- [ ] Pembatasan.

## 22.2 Produksi

- [ ] Menu.
- [ ] Perencanaan.
- [ ] Bahan.
- [ ] Produksi.
- [ ] Jumlah porsi.

## 22.3 Distribusi

- [ ] Pasien.
- [ ] Ruangan.
- [ ] Jadwal.
- [ ] Status.
- [ ] Meal delivered.

---

# 23. REHABILITASI

- [ ] Rujukan.
- [ ] Pengkajian.
- [ ] Rencana.
- [ ] Jadwal.
- [ ] Sesi.
- [ ] Petugas.
- [ ] Evaluasi.
- [ ] Billing.

---

# 24. PORTAL PASIEN / LAYANAN PASIEN

Portal Pasien adalah facade terhadap domain SIMRS, bukan sumber data pasien kedua.

## 24.1 Profil

- [ ] Identitas.
- [ ] Kontak.
- [ ] Keluarga/wali.
- [ ] Penjamin tertentu.

## 24.2 Janji Temu

- [ ] Cari poli.
- [ ] Cari dokter.
- [ ] Jadwal.
- [ ] Booking.
- [ ] Reschedule.
- [ ] Cancel.

## 24.3 Pra-Pendaftaran

- [ ] Identitas awal.
- [ ] Rujukan.
- [ ] Penjamin.
- [ ] Dokumen.
- [ ] Status verifikasi.

## 24.4 Antrean

- [ ] Nomor.
- [ ] Status.
- [ ] Estimasi.

## 24.5 Tagihan & Pembayaran

- [ ] Tagihan.
- [ ] Riwayat.
- [ ] Non-tunai.
- [ ] Bukti pembayaran.

## 24.6 Layanan Lain

- [ ] Jadwal kontrol.
- [ ] Home Care.
- [ ] Formulir.
- [ ] Consent tertentu.
- [ ] Notifikasi.
- [ ] Pengaduan.

---

# 25. HOME CARE / PERAWATAN DI RUMAH

## 25.1 Permintaan

- [ ] Portal Pasien.
- [ ] Dokter.
- [ ] Discharge planning.
- [ ] Unit internal.

## 25.2 Verifikasi

- [ ] Jenis layanan.
- [ ] Penjamin.
- [ ] Kelayakan.
- [ ] Alamat.
- [ ] Tenaga.
- [ ] Resource.

## 25.3 Penjadwalan

- [ ] Tanggal/jam.
- [ ] Tenaga.
- [ ] Kendaraan.
- [ ] Peralatan.
- [ ] Obat/perbekalan.

## 25.4 Kunjungan

- [ ] Home Care Encounter.
- [ ] Dokumentasi.
- [ ] Tindakan.
- [ ] Obat.
- [ ] Material.
- [ ] Waktu.

## 25.5 Tindak Lanjut

- [ ] Kunjungan berikutnya.
- [ ] Kontrol.
- [ ] Rujuk kembali.
- [ ] Selesai.

---

# 26. SIKLUS PENDAPATAN & BILLING

## 26.1 Charge Capture

- [ ] Dokter.
- [ ] Tindakan.
- [ ] Laboratorium.
- [ ] Radiologi.
- [ ] Farmasi.
- [ ] Kamar.
- [ ] Operasi.
- [ ] Material.
- [ ] Home Care.

## 26.2 Tarif

- [ ] Tarif pelayanan.
- [ ] Kelas.
- [ ] Penjamin.
- [ ] Masa berlaku.
- [ ] Riwayat.
- [ ] Snapshot tarif.

## 26.3 Paket & Bundling

- [ ] Paket.
- [ ] Komponen.
- [ ] Inclusion/exclusion.
- [ ] Fakta pelayanan aktual tetap tersimpan.

## 26.4 Akun Tagihan Pasien

- [ ] Charge.
- [ ] Patient share.
- [ ] Guarantor share.
- [ ] Adjustment.
- [ ] Diskon.

## 26.5 Tagihan

- [ ] Draft.
- [ ] Review.
- [ ] Final.
- [ ] Invoice.
- [ ] Void.
- [ ] Adjustment.

## 26.6 Estimasi

- [ ] Estimasi biaya.
- [ ] Aktual.
- [ ] Perbandingan.

## 26.7 Rekonsiliasi

- [ ] Pelayanan tanpa charge.
- [ ] Charge tanpa tarif.
- [ ] Duplicate charge.
- [ ] Payment belum dialokasikan.
- [ ] Penjamin belum jelas.

---

# 27. KASIR & PEMBAYARAN

## 27.1 Metode

- [ ] Tunai.
- [ ] Debit.
- [ ] Kredit.
- [ ] QRIS.
- [ ] Transfer.
- [ ] Deposit.
- [ ] Pembayaran campuran.
- [ ] Settlement penjamin.

## 27.2 Tunai

- [ ] Nilai tagihan.
- [ ] Uang diterima.
- [ ] Kembalian.

## 27.3 Non-Tunai

- [ ] Request.
- [ ] Pending.
- [ ] Berhasil.
- [ ] Gagal.
- [ ] Timeout.
- [ ] Rekonsiliasi.

## 27.4 Deposit

- [ ] Penerimaan.
- [ ] Saldo.
- [ ] Pemakaian.
- [ ] Refund.

## 27.5 Refund

- [ ] Permintaan.
- [ ] Verifikasi.
- [ ] Approval.
- [ ] Pembayaran refund.

## 27.6 Shift Kasir

- [ ] Opening.
- [ ] Penerimaan.
- [ ] Refund.
- [ ] Expected closing.
- [ ] Actual closing.
- [ ] Selisih.

---

# 28. PENJAMIN & KLAIM

## 28.1 Cakupan

- [ ] JKN/BPJS.
- [ ] Asuransi swasta.
- [ ] Perusahaan.
- [ ] Institusi.
- [ ] Self pay.
- [ ] Limit.
- [ ] Kelas.
- [ ] Co-payment.
- [ ] Exclusion.

## 28.2 Kesiapan Klaim

- [ ] Identitas.
- [ ] Eligibility.
- [ ] Encounter.
- [ ] Diagnosis.
- [ ] Coding.
- [ ] Resume.
- [ ] Dokumen.
- [ ] Billing.
- [ ] Authorization.

## 28.3 Kasus Klaim

- [ ] Claim case.
- [ ] Status.
- [ ] Penjamin.
- [ ] Nilai.

## 28.4 Pengajuan Klaim

- [ ] Submission awal.
- [ ] Resubmission.
- [ ] Versioning.
- [ ] Snapshot dokumen.

## 28.5 Respons

- [ ] Accepted.
- [ ] Pending.
- [ ] Returned.
- [ ] Rejected.
- [ ] Approved.
- [ ] Partially approved.

## 28.6 Nilai

- [ ] Billed amount.
- [ ] Claimed amount.
- [ ] Approved amount.
- [ ] Paid amount.

## 28.7 Rekonsiliasi

- [ ] Kekurangan pembayaran.
- [ ] Belum dibayar.
- [ ] Duplicate settlement.
- [ ] Aging.
- [ ] Piutang penjamin.

---

# 29. RANTAI PASOK & PERSEDIAAN

## 29.1 Master

- [ ] Item.
- [ ] Kategori.
- [ ] Satuan.
- [ ] Batch.
- [ ] Lot.
- [ ] Kedaluwarsa.
- [ ] Serial.

## 29.2 Lokasi Stok

- [ ] Gudang utama.
- [ ] Farmasi.
- [ ] IGD.
- [ ] ICU.
- [ ] Kamar operasi.
- [ ] Laboratorium.
- [ ] Ruang rawat.
- [ ] Unit lainnya.

## 29.3 Transaksi

- [ ] Penerimaan.
- [ ] Distribusi.
- [ ] Transfer.
- [ ] Pemakaian.
- [ ] Retur.
- [ ] Reservasi.
- [ ] Adjustment.
- [ ] Pemusnahan.

## 29.4 Pengendalian Stok

- [ ] Minimum.
- [ ] Reorder point.
- [ ] FEFO.
- [ ] Kedaluwarsa.
- [ ] Recall.
- [ ] Stock opname.

---

# 30. PENGADAAN

- [ ] Permintaan pembelian.
- [ ] Persetujuan.
- [ ] Pemasok.
- [ ] Penawaran.
- [ ] Pemilihan.
- [ ] Pesanan pembelian.
- [ ] Penerimaan.
- [ ] Partial receipt.
- [ ] Retur.
- [ ] Invoice pemasok.
- [ ] Rekonsiliasi.
- [ ] Evaluasi pemasok.
- [ ] Pengadaan darurat.

---

# 31. ASET & ALAT KESEHATAN

- [ ] Register aset.
- [ ] Nomor aset.
- [ ] Merek/model.
- [ ] Serial.
- [ ] Lokasi.
- [ ] Penanggung jawab.
- [ ] Riwayat perpindahan.
- [ ] Pemeliharaan.
- [ ] Kalibrasi.
- [ ] Breakdown.
- [ ] Reservasi.
- [ ] Status.
- [ ] Penghapusan.

---

# 32. AMBULANS, KENDARAAN & TRANSPORTASI

- [ ] Kendaraan.
- [ ] Jenis.
- [ ] Status.
- [ ] Pengemudi.
- [ ] Crew.
- [ ] Permintaan.
- [ ] Dispatch.
- [ ] Penjemputan.
- [ ] Transfer pasien.
- [ ] Home Care.
- [ ] Transportasi jenazah.
- [ ] Maintenance.

---

# 33. CSSD

- [ ] Instrumen.
- [ ] Set alat.
- [ ] Pengumpulan.
- [ ] Pencucian.
- [ ] Pengemasan.
- [ ] Batch sterilisasi.
- [ ] Penyimpanan.
- [ ] Distribusi.
- [ ] Traceability.
- [ ] Recall batch.

---

# 34. LAUNDRY & LINEN

- [ ] Linen.
- [ ] Stok.
- [ ] Distribusi.
- [ ] Pengumpulan linen kotor.
- [ ] Pencucian.
- [ ] Linen bersih.
- [ ] Kerusakan.
- [ ] Kehilangan.

---

# 35. HOUSEKEEPING, SANITASI & LIMBAH

## 35.1 Housekeeping

- [ ] Cleaning bed.
- [ ] Cleaning kamar.
- [ ] Cleaning area.
- [ ] Worklist.
- [ ] Waktu mulai.
- [ ] Waktu selesai.

## 35.2 Sanitasi

- [ ] Checklist.
- [ ] Area.
- [ ] Temuan.
- [ ] Tindak lanjut.

## 35.3 Limbah

- [ ] Kategori.
- [ ] Pengumpulan.
- [ ] Pemisahan.
- [ ] Penyimpanan.
- [ ] Pengangkutan.
- [ ] Pembuangan.

---

# 36. SUMBER DAYA MANUSIA & TENAGA KERJA

- [ ] Pegawai.
- [ ] Praktisi.
- [ ] Profesi.
- [ ] Jabatan.
- [ ] Unit.
- [ ] Penempatan.
- [ ] Shift.
- [ ] Roster.
- [ ] On-call.
- [ ] Kehadiran.
- [ ] Cuti.
- [ ] Workload.
- [ ] Pelatihan.
- [ ] Sertifikasi.

---

# 37. KREDENSIAL & KEWENANGAN KLINIS

- [ ] Kredensial.
- [ ] Masa berlaku.
- [ ] Dokumen.
- [ ] Rekredensial.
- [ ] Kewenangan klinis.
- [ ] Daftar tindakan.
- [ ] Status.
- [ ] Expiry alert.

---

# 38. LAYANAN INFORMASI & PENGADUAN

- [ ] Informasi.
- [ ] Inquiry.
- [ ] Pengaduan.
- [ ] Kanal.
- [ ] Kategori.
- [ ] Prioritas.
- [ ] SLA.
- [ ] Assignment.
- [ ] Eskalasi.
- [ ] Respons.
- [ ] Resolusi.
- [ ] Kepuasan.
- [ ] Portal Pasien.

---

# 39. MANAJEMEN MUTU & AKREDITASI

## 39.1 Indikator

- [ ] Kamus indikator.
- [ ] Rumus.
- [ ] Sumber data.
- [ ] Target.
- [ ] Aktual.
- [ ] Variance.
- [ ] Owner.

## 39.2 Akreditasi

- [ ] Standar.
- [ ] Elemen.
- [ ] Evidence.
- [ ] Unit owner.
- [ ] Temuan.
- [ ] Tindak lanjut.
- [ ] Corrective action.
- [ ] Monitoring.

---

# 40. KESELAMATAN PASIEN

- [ ] Insiden.
- [ ] Near miss.
- [ ] Adverse event.
- [ ] Sentinel event.
- [ ] Medication error.
- [ ] Pasien jatuh.
- [ ] Kesalahan identifikasi.
- [ ] Severity.
- [ ] Investigasi.
- [ ] Root cause.
- [ ] Corrective action.
- [ ] Preventive action.

---

# 41. PENCEGAHAN & PENGENDALIAN INFEKSI (PPI)

- [ ] Surveillance.
- [ ] Isolasi.
- [ ] HAI.
- [ ] Kultur.
- [ ] Perangkat invasif.
- [ ] Antibiotik.
- [ ] Kasus.
- [ ] Outbreak.
- [ ] Follow-up.
- [ ] Laporan.

---

# 42. K3 & MANAJEMEN RISIKO

## 42.1 K3

- [ ] Hazard.
- [ ] Insiden kerja.
- [ ] Paparan.
- [ ] PPE.
- [ ] Tindak lanjut.

## 42.2 Risiko

- [ ] Risk register.
- [ ] Kategori.
- [ ] Penyebab.
- [ ] Dampak.
- [ ] Likelihood.
- [ ] Impact.
- [ ] Risk level.
- [ ] Control.
- [ ] Mitigation.
- [ ] Residual risk.
- [ ] Owner.

---

# 43. KEMATIAN, JENAZAH & FORENSIK

## 43.1 Kematian

- [ ] Pernyataan kematian.
- [ ] Dokter.
- [ ] Waktu.
- [ ] Lokasi.
- [ ] Encounter.
- [ ] Dokumentasi.

## 43.2 Kamar Jenazah

- [ ] Permintaan pemindahan.
- [ ] Penerimaan.
- [ ] Identifikasi.
- [ ] Storage.
- [ ] Pemulasaraan.
- [ ] Penyerahan.
- [ ] Penerima.

## 43.3 Forensik

- [ ] Kasus.
- [ ] Instansi pemohon.
- [ ] Dokter pemeriksa.
- [ ] Pemeriksaan.
- [ ] Spesimen.
- [ ] Barang bukti.
- [ ] Dokumen.
- [ ] Chain of custody.
- [ ] Kerahasiaan.

---

# 44. LAPORAN & ANALITIK

## 44.1 Laporan Operasional

- [ ] Pasien.
- [ ] Pendaftaran.
- [ ] IGD.
- [ ] Rawat Jalan.
- [ ] Rawat Inap.
- [ ] Farmasi.
- [ ] Laboratorium.
- [ ] Radiologi.
- [ ] Revenue.
- [ ] Klaim.
- [ ] Persediaan.
- [ ] SDM.
- [ ] Mutu.

## 44.2 Statistik Rumah Sakit

- [ ] BOR.
- [ ] ALOS.
- [ ] TOI.
- [ ] BTO.
- [ ] Waktu tunggu.
- [ ] Turnaround time.
- [ ] Utilisasi.

## 44.3 Dashboard

- [ ] Unit.
- [ ] Operasional.
- [ ] Manajemen.
- [ ] Eksekutif.
- [ ] Drill-down.

## 44.4 Laporan Formal

- [ ] Snapshot.
- [ ] Versi.
- [ ] Arsip.
- [ ] Kerahasiaan.

## 44.5 Dataset Analisis

- [ ] Filter.
- [ ] Aggregate.
- [ ] Patient-level sesuai kewenangan.
- [ ] Ekspor.
- [ ] Anonimisasi bila diperlukan.

---

# 45. INTEGRASI & INTEROPERABILITAS

## 45.1 Integrasi Nasional dan Penjamin

- [ ] SATUSEHAT.
- [ ] BPJS/JKN.
- [ ] Klaim.
- [ ] Rujukan.
- [ ] Penjamin eksternal.

## 45.2 Integrasi Klinis

- [ ] PACS.
- [ ] Analyzer Laboratorium.
- [ ] Perangkat medis.
- [ ] Sistem penunjang.

## 45.3 Integrasi Keuangan

- [ ] Bank.
- [ ] Payment gateway.
- [ ] ERP.
- [ ] Akuntansi.

## 45.4 Integrasi Komunikasi

- [ ] SMS.
- [ ] Email.
- [ ] WhatsApp.
- [ ] Push notification.

## 45.5 Reliability Integrasi

- [ ] Queue.
- [ ] Retry.
- [ ] Idempotency.
- [ ] Reconciliation.
- [ ] Audit.
- [ ] Status.
- [ ] Error handling.

---

# 46. KEAMANAN, AUDIT & TATA KELOLA

## 46.1 Keamanan

- [ ] Authentication.
- [ ] Authorization.
- [ ] Least privilege.
- [ ] Unit scope.
- [ ] Patient relationship.
- [ ] Akses darurat.
- [ ] Masking.
- [ ] Encryption.

## 46.2 Audit

- [ ] Audit akses.
- [ ] Audit perubahan.
- [ ] Audit pembayaran.
- [ ] Audit klaim.
- [ ] Audit integrasi.
- [ ] Audit ekspor.
- [ ] Audit administrator.

## 46.3 Tata Kelola

- [ ] Pemilik domain.
- [ ] Pemilik data.
- [ ] Pemilik laporan.
- [ ] Pemilik master.
- [ ] Approval.
- [ ] Change management.

---

# 47. KONFIGURASI & ADMINISTRASI SISTEM

- [ ] Identitas rumah sakit.
- [ ] Struktur organisasi.
- [ ] Unit.
- [ ] Penomoran.
- [ ] Tarif.
- [ ] Formularium.
- [ ] Role.
- [ ] Capability.
- [ ] Workflow.
- [ ] Formulir.
- [ ] Dokumen.
- [ ] Integrasi.
- [ ] Notifikasi.
- [ ] Feature availability.
- [ ] Parameter layanan.

---

# 48. WORK CENTER UTAMA

SIMRS ideal sebaiknya tidak hanya berupa menu. Pengguna bekerja melalui pusat kerja yang menggabungkan informasi dari beberapa domain sesuai kebutuhan.

Work Center utama yang direkomendasikan:

- [ ] Pusat Kerja Akses Pasien.
- [ ] Pusat Kerja IGD.
- [ ] Pusat Kerja Rawat Jalan.
- [ ] Pusat Kerja Admission.
- [ ] Papan Tempat Tidur.
- [ ] Pusat Kerja Rawat Inap.
- [ ] Pusat Kerja Rekam Medis.
- [ ] Pusat Kerja Keperawatan.
- [ ] Pusat Kerja Farmasi.
- [ ] Pusat Kerja Laboratorium.
- [ ] Pusat Kerja Radiologi.
- [ ] Pusat Kerja Kamar Operasi.
- [ ] Pusat Kerja Billing.
- [ ] Pusat Kerja Kasir.
- [ ] Pusat Kerja Klaim.
- [ ] Pusat Kerja Persediaan.
- [ ] Pusat Kerja Pengadaan.
- [ ] Pusat Kerja Aset.
- [ ] Pusat Kerja Transportasi.
- [ ] Pusat Kerja SDM.
- [ ] Pusat Kerja Mutu.
- [ ] Pusat Kerja Risiko.
- [ ] Dashboard Manajemen.

Work Center adalah **facade**, bukan pemilik data baru.

---

# 49. SUMBER KEBENARAN DATA

| Informasi | Authoritative Owner |
|---|---|
| Identitas pasien | Manajemen Identitas Pasien |
| Janji temu | Penjadwalan |
| Pendaftaran | Administrasi Pasien |
| Antrean | Manajemen Antrean |
| Episode & Encounter | Encounter Core |
| Lokasi pasien | ADT |
| Status tempat tidur | Manajemen Tempat Tidur |
| Diagnosis | Rekam Medis |
| Clinical note | Rekam Medis |
| Perintah pelayanan | Perintah Pelayanan |
| Hasil laboratorium | Laboratorium |
| Laporan radiologi | Radiologi |
| Dispensing obat | Farmasi |
| Pemberian obat | Keperawatan |
| Stok | Persediaan |
| Aset | Manajemen Aset |
| Charge | Siklus Pendapatan |
| Billing | Billing |
| Pembayaran | Kasir/Pembayaran |
| Klaim | Manajemen Klaim |
| Pengaduan | Layanan Informasi & Pengaduan |
| Incident | Keselamatan Pasien |
| Risiko | Manajemen Risiko |
| Pernyataan kematian | Otoritas klinis |
| Jenazah | Kamar Jenazah |
| Forensik | Forensik/Medikolegal |
| KPI | Definisi indikator + data operasional |
| Laporan | Reporting/read model |

---

# 50. PERAN TEKNOLOGI SEBAGAI FACADE

Teknologi pada SIMRS harus mempermudah pekerjaan kesehatan dan administrasi, bukan menambah pekerjaan baru.

Sistem sebaiknya:

- [ ] Menghindari input ulang.
- [ ] Mengisi data turunan otomatis.
- [ ] Menghubungkan modul.
- [ ] Membuat worklist.
- [ ] Memberikan validasi.
- [ ] Memberikan warning.
- [ ] Menampilkan ringkasan.
- [ ] Menghitung waktu dan indikator otomatis.
- [ ] Menghasilkan nomor otomatis.
- [ ] Menjaga timestamp.
- [ ] Membentuk charge dari pelayanan aktual.
- [ ] Membantu routing pekerjaan.
- [ ] Mengingatkan pekerjaan yang belum selesai.
- [ ] Menyediakan pencarian lintas domain.
- [ ] Menjaga audit.
- [ ] Menjaga provenance.
- [ ] Menyembunyikan kompleksitas teknis dari pengguna operasional.

Teknologi tidak menggantikan keputusan profesional.

---

# 51. PERJALANAN PASIEN END-TO-END

## 51.1 Rawat Jalan

```text
Pasien
↓
Janji Temu / Walk-In
↓
Pendaftaran
↓
Antrean
↓
Pengkajian
↓
Dokter
↓
Diagnosis
↓
Perintah Pelayanan
├── Laboratorium
├── Radiologi
├── Farmasi
└── Tindakan
↓
Billing
↓
Pembayaran / Klaim
↓
Kontrol / Selesai
```

## 51.2 IGD ke Rawat Inap

```text
Pasien Datang
↓
Identifikasi
↓
Triase
↓
Encounter IGD
↓
Pemeriksaan
↓
Penunjang
↓
Keputusan Rawat
↓
Admission Request
↓
Bed Management
↓
Rawat Inap
↓
Pelayanan Harian
↓
Discharge
↓
Billing / Klaim
```

## 51.3 Operasi

```text
Permintaan Operasi
↓
Penjadwalan
↓
Persiapan
↓
Consent
↓
Kamar Operasi
↓
Anestesi
↓
Tindakan
↓
Recovery
↓
Rawat Inap / ICU
```

## 51.4 Home Care

```text
Permintaan
↓
Verifikasi
↓
Penjadwalan
↓
Tenaga / Kendaraan
↓
Kunjungan Rumah
↓
Home Care Encounter
↓
Dokumentasi
↓
Billing / Klaim
↓
Tindak Lanjut
```

---

# 52. PRIORITAS IMPLEMENTASI SIMRS

## Tahap 1 — Fondasi

- [ ] Organisasi.
- [ ] Master Data.
- [ ] Pengguna.
- [ ] Role & Capability.
- [ ] Audit.
- [ ] Manajemen Pasien.
- [ ] Encounter Core.

## Tahap 2 — Patient Flow

- [ ] Appointment.
- [ ] Pendaftaran.
- [ ] Antrean.
- [ ] IGD.
- [ ] Rawat Jalan.
- [ ] ADT.
- [ ] Bed Management.
- [ ] Rawat Inap.

## Tahap 3 — Rekam Medis & Klinis Dasar

- [ ] Rekam Medis.
- [ ] Keperawatan.
- [ ] Perintah Pelayanan.
- [ ] Farmasi.
- [ ] Laboratorium.
- [ ] Radiologi.

## Tahap 4 — Siklus Pendapatan

- [ ] Charge.
- [ ] Billing.
- [ ] Kasir.
- [ ] Pembayaran.
- [ ] Penjamin.
- [ ] Klaim.

## Tahap 5 — Supply Chain & Support

- [ ] Persediaan.
- [ ] Pengadaan.
- [ ] Aset.
- [ ] Kendaraan.
- [ ] CSSD.
- [ ] Laundry.
- [ ] Housekeeping.
- [ ] Sanitasi.
- [ ] Limbah.

## Tahap 6 — Layanan Klinis Lanjutan

- [ ] Operasi.
- [ ] Anestesi.
- [ ] ICU/HCU.
- [ ] Hemodialisis.
- [ ] Bank Darah.
- [ ] Gizi.
- [ ] Rehabilitasi.
- [ ] Home Care.

## Tahap 7 — Enterprise Management

- [ ] SDM.
- [ ] Kredensial.
- [ ] Pengaduan.
- [ ] Mutu.
- [ ] Akreditasi.
- [ ] Keselamatan Pasien.
- [ ] PPI.
- [ ] K3.
- [ ] Risiko.
- [ ] Mortuary.
- [ ] Forensik.

## Tahap 8 — Informasi & Integrasi

- [ ] Portal Pasien.
- [ ] Reporting.
- [ ] Dashboard.
- [ ] Analitik.
- [ ] Integrasi.
- [ ] Interoperabilitas.
- [ ] Disaster recovery.
- [ ] Monitoring.

---

# 53. EXTENSION UNTUK SIMRS EDUKASI

SIMRS Edukasi menambahkan lapisan khusus pendidikan tanpa menduplikasi domain SIMRS.

```text
SIMRS-E
│
├── MODUL ADMINISTRASI & OPERASIONAL RUMAH SAKIT
│   └── menggunakan seluruh domain SIMRS pada dokumen ini
│
├── MODUL PENGUJIAN / MESIN SIMULASI
│   ├── Session
│   ├── Skenario
│   ├── Versi Skenario
│   ├── Simulation Run
│   ├── Actor
│   ├── Persona
│   ├── Event
│   ├── Checkpoint
│   ├── Error Injection
│   ├── Waktu Simulasi
│   ├── Evidence
│   ├── Replay
│   └── Debrief
│
└── MODUL LAPORAN & ANALITIK
    ├── Laporan rumah sakit
    ├── Statistik
    ├── Dashboard
    ├── Dataset analisis
    ├── Data sintetik
    └── Arsip
```

Batas dengan TELADAN harus tetap jelas:

- TELADAN mengelola Kurikulum.
- TELADAN mengelola RPS.
- TELADAN mengelola CPL, CPMK, dan Sub-CPMK.
- TELADAN mengelola Assessment akademik.
- TELADAN mengelola rubrik akademik.
- TELADAN mengelola nilai.
- TELADAN mengelola OBE.
- SIMRS-E hanya menyediakan pengalaman rumah sakit dan evidence aktivitas simulasi.

---

# 54. PRINSIP KHUSUS SIMRS EDUKASI

Saat fondasi SIMRS ini diterapkan pada SIMRS-E:

- [ ] Data operasional diisolasi berdasarkan Session.
- [ ] Satu Session merepresentasikan satu dunia rumah sakit simulasi.
- [ ] Hospital Template digunakan untuk membuat Session.
- [ ] Pengguna memainkan Hospital Actor melalui Persona.
- [ ] Simulation Run dapat persistent atau sandbox.
- [ ] Sandbox tidak mengubah state canonical Session.
- [ ] Simulation Engine menggunakan domain SIMRS yang sama.
- [ ] Tidak ada `SimulationPatient`, `SimulationBilling`, atau domain duplikat.
- [ ] Scenario mengevaluasi business event dan state, bukan klik UI.
- [ ] Shadow Service digunakan untuk asuransi, pembayaran, SATUSEHAT, referral, PACS, atau analyzer bila diperlukan.
- [ ] Tidak ada koneksi produksi ke layanan eksternal untuk kebutuhan edukasi.
- [ ] Evidence tidak sama dengan nilai akademik.
- [ ] Replay berbasis event/state.
- [ ] Portal Pasien dan Home Care tetap memakai data pasien canonical.
- [ ] Seluruh laporan rumah sakit canonical tidak memasukkan transaksi sandbox.

---

# 55. HASIL AKHIR YANG DIHARAPKAN

Kerangka SIMRS ini harus menghasilkan sistem yang mampu menggambarkan rumah sakit sebagai satu kesatuan:

```text
IDENTITAS PASIEN
       ↓
PATIENT ACCESS
       ↓
PELAYANAN
       ↓
REKAM MEDIS
       ↓
PENUNJANG
       ↓
FARMASI
       ↓
BILLING
       ↓
PEMBAYARAN / KLAIM
       ↓
LOGISTIK & RESOURCE
       ↓
MUTU & RISIKO
       ↓
LAPORAN & ANALITIK
       ↓
KEPUTUSAN MANAJEMEN
```

SIMRS yang baik bukan sekadar kumpulan formulir, tetapi **representasi digital perjalanan pasien, operasional rumah sakit, tanggung jawab profesi, penggunaan sumber daya, konsekuensi finansial, tata kelola, dan informasi manajemen**.

Fondasi inilah yang kemudian digunakan sebagai dasar SIMRS Edukasi agar mahasiswa Administrasi Rumah Sakit dapat berlatih pada lingkungan yang menyerupai praktik rumah sakit nyata tanpa menjadikan SIMRS-E sebagai LMS atau sistem akademik kedua.
