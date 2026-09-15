# Perbaikan akses input SIMRS Inti

Tanggal: 15 September 2026 (workspace; pengujian 16 September WIB). Status: selesai untuk perbaikan ini.

## Penyebab dan reproduksi

Kedua tab masih masuk sebagai Dosen setelah pengujian sebelumnya. Dosen memang hanya mengamati transaksi sesuai WORKFLOW/UI. Pada `/simrs/pendaftaran`, input identitas terverifikasi disabled. Pengguna hanya mendapat pesan observasi tanpa jalur langsung menuju akun penginput. Provider juga hanya mengambil akun pada pemuatan awal, sehingga pergantian akun pada tab lain tidak memperbarui tampilan tab yang sudah terbuka.

AGENTS, dokumen Fase 1 dan laporan iterasi sebelumnya diperiksa ulang. Perubahan working tree sebelumnya dipertahankan. Keputusan: memperbaiki navigasi akun dan sinkronisasi tampilan, tanpa menambah izin Dosen atau melewati status praktikum.

## Perubahan dan alur

- Dashboard menyediakan aksi mengisi pendaftaran, rekam medis, kasir dan master.
- Form baca saja menjelaskan peran yang diperlukan dan menyediakan **Gunakan akun penginput**. Akun dipilih berdasarkan penugasan sesi aktual dan hanya akun demo aktif.
- Halaman masuk memuat akun yang disarankan dan tujuan form. Mahasiswa tetap melalui briefing; Mulai/Lanjutkan praktikum mengembalikannya ke form tujuan. Administrator menuju master yang diizinkan.
- Tujuan kembali dibatasi pada route inti yang dikenal dan dapat dibaca peran terkait. URL eksternal, rute tidak dikenal, query arbitrer dan modul tanpa izin tidak diterima sebagai tujuan.
- Form yang dapat diisi menampilkan **Input aktif**. Status belum dimulai, submit, dijeda atau berakhir tetap mengunci transaksi dan menyediakan akses briefing/pemilihan sesi existing.
- Login/logout diumumkan antar-tab melalui BroadcastChannel tanpa data akun/transaksi. Tab penerima membaca kembali akun dari server; pemeriksaan fokus/visibility menjadi fallback.
- Respons fetch lama tidak menimpa respons mutasi yang lebih baru. Pemeriksaan fokus dengan akun sama tidak mengganti state formulir untuk menghindari penimpaan isian yang belum disimpan.
- Page guard server dimuat ulang ketika akun berubah. Komponen form dimuat ulang jika role/akun berganti agar state editor akun lama tidak terbawa.

## Data, akses dan kompatibilitas

Tidak ada endpoint, database, schema, dependency atau engine baru. Login/logout tetap `/api/auth`; pembacaan/mutasi tetap `/api/workspace`. Cookie dan authorization server dipertahankan. Tautan tidak otomatis login atau mulai percobaan. Tidak ada reset, perubahan penugasan/status sesi atau penghapusan data pada perbaikan ini.

Sinkronisasi mencakup akun pada browser yang sama, bukan kolaborasi transaksi real time lintas perangkat. Dokumen final dan akun yang sudah submit tetap terkunci. Dosen tetap observasi; hanya akun sesuai penugasan dapat memproses transaksi.

## Pengujian

| Perintah / metode | Hasil |
| --- | --- |
| `npm run typecheck` | Lulus. |
| `npm run lint` | Lulus setelah nama variabel lokal disesuaikan aturan Next.js. |
| `npm test` | 41/41 lulus; tiga tambahan untuk akun penginput, tujuan aman dan prasyarat briefing/kompatibilitas. |
| `npm run test:integration` | 3/3 rangkaian HTTP lulus. |
| `npm run build` | Lulus. |
| Browser sebelum perbaikan | Dosen pada pendaftaran: input identitas disabled. |
| Browser pemulihan | Gunakan akun penginput → Demo 01 terpilih → login → briefing → Lanjutkan praktikum → `/simrs/pendaftaran`; input/simpan enabled. |
| Browser dua tab | Login pada tab kedua mengubah header/navigasi tab pertama menjadi Mahasiswa Demo 01 tanpa reload manual. |
| Browser input dan simpan | Semua field diisi manual, termasuk tanggal lahir/kontak, verifikasi dicentang; tersimpan sebagai RM-SIM-0003/KJ-002/A-002. KJ-001 tetap Selesai. |
| Browser akhir 1024×768 | Form kosong siap diisi: disabled=false, readOnly=false. Navbar clientWidth/scrollWidth 961/961; document 1009, tanpa overflow horizontal. Tidak ada error/warning baru setelah reload atau framework overlay. |

Bukti visual: `form-input-simrs-diperbaiki.png` pada direktori visualisasi Codex, di luar repository. Pratinjau akhir tetap pada `/simrs/pendaftaran` sebagai Mahasiswa Demo 01/Petugas Pendaftaran.

Menggunakan Browser plugin dan data sintetis. Form dikosongkan setelah uji melalui aksi existing; transaksi tersimpan tetap tersedia. Form ditinggalkan pada akun penginput, bukan Dosen. Tidak diuji pada browser eksternal atau akun produksi. Tidak ada perluasan hak akses atau perubahan alur pelayanan.
