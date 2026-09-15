# SIMRS Inti dan integrasi SIMRS-e

Tanggal: 14 September 2026 (waktu workspace; pengujian melewati 15 September WIB). Status: iterasi implementasi SIMRS Inti dan integrasi demo selesai. Bukan penyelesaian seluruh produk Fase 1 atau deployment produksi.

## Audit sebelum perubahan

Source of truth yang dibaca: AGENTS root/frontend, ABOUT, WORKFLOW, UI, TODO, seluruh laporan modul 01–16, laporan redesign, dan kerangka domain README. Aplikasi aktual berada di `frontend/`: Next.js App Router 16, React 19, npm, TypeScript, Tailwind, shadcn Base UI preset base-rhea, Hugeicons. Tidak ditemukan database, migration, API, atau layanan autentikasi server. Working tree bersih pada awal pekerjaan.

| Lapisan | Implementasi yang ditemukan | Keputusan |
| --- | --- | --- |
| Platform/shared | Pemilih akun demo, Role, allowlist navigasi, komponen shadcn, AppShell, tabel/form/konfirmasi, audit | Pertahankan UI; tambahkan sesi akun dan validasi server dalam Next.js yang sama. |
| SIMRS Inti | PatientInput, Visit, MasterRow, validasi pasien, tarif; transaksi berada di store simulasi | Ekstrak domain dan mesin transaksi tunggal tanpa dependency akademik. |
| SIMRS-e | Scenario, Session, Participant, Attempt, Review, materi, observasi, submit/reset | Pertahankan model dan route, gunakan adapter ke inti. |
| Concern bercampur | Visit mengandung attempt; store melakukan pendaftaran/pelayanan/pembayaran; laporan menggabungkan transaksi dan pembelajaran | Projection compatibility di adapter, laporan operasional dipisahkan dari laporan belajar. |
| Kekurangan inti | Identitas pasien terpisah, pasien lama, appointment sederhana, status panggil/batal/tidak datang, rekam medis terstruktur/koreksi, rincian tagihan/deposit/refund, dashboard operasional | Tambahkan secara bertahap sesuai requirement modul 03–08. |

## Rencana dan dampak

1. `lib/platform`: peran, capability operasional, fakta audit dan akun demo. Shared UI tetap dipakai tanpa memindahkan semua file.
2. `lib/core`: model/seed/master, validasi, state machine, rekam medis dan perhitungan billing. Tidak mengimpor domain skenario, kelas, mahasiswa, atau penilaian.
3. `lib/simrs`: adapter menambahkan konteks sesi/percobaan pada fakta inti. Alias/projection lama dipertahankan untuk dashboard, monitoring, penilaian, dan laporan yang sudah ada.
4. Data sesi disimpan terpisah; pergantian sesi memuat penugasan, percobaan, histori, dan penilaian sesi terpilih. Snapshot skenario tidak mengikuti perubahan master secara diam-diam.
5. API Next.js menjadi sumber perubahan server. Akun demo menggunakan cookie opaque HttpOnly, kedaluwarsa, pemeriksaan akun aktif, penolakan aksi/URL sesuai role, serta pemeriksaan revisi/scope untuk mencegah permintaan lama menulis ke percobaan lain. Tidak menerima state/role/capability dari klien sebagai otorisasi.
6. Route lama dipertahankan. Route `/simrs` ditambah secara incremental untuk area operasional; `/simulasi` memakai komponen inti yang sama dalam wrapper pembelajaran. Dosen tetap mengamati, bukan mengambil alih transaksi mahasiswa; Administrator mengelola master.
7. Tidak ada database/migration. Penyimpanan demo berada dalam memori server dan hilang ketika proses server berakhir. Ini memenuhi pemeriksaan aksi server dalam lingkungan demo, bukan autentikasi produksi.

Risiko regresi utama: pergantian akun/sesi, submit, reset, penilaian per percobaan, audit, dan feedback sukses sebelum server menyimpan. Akan diuji melalui tes regresi, tes integrasi API, dan browser; callback penyimpanan diubah agar menunggu hasil server.

Modul lanjutan tanpa spesifikasi terperinci (IGD/rawat inap/farmasi/penunjang penuh, klaim/integrasi, keputusan klinis, scheduling kompleks) tetap di luar implementasi.

## A. Arsitektur hasil implementasi

| Pemilik | Tanggung jawab | Boundary |
| --- | --- | --- |
| Platform/shared | Akun demo, Role, capability, izin modul, Principal, AuditFact, format, AppShell dan primitive UI | Satu akun memperoleh capability dari penugasan aktif. Tidak ada login kedua untuk core. |
| SIMRS Inti | HospitalMaster, Patient, Appointment, Visit, antrean, rekam medis/versi, Charge, Payment, validasi dan indikator operasional | `executeCore` menerima state rumah sakit, command, Principal dan waktu; tidak menerima semester, scenario, student, attempt, rubrik atau nilai. |
| SIMRS-e | Akademik, Scenario, Session, Participant, Attempt, snapshot, observasi, Review, submit/reset dan laporan belajar | Adapter memeriksa konteks belajar lalu memakai engine inti. Visit lama menjadi projection kompatibilitas, bukan sumber transaksi kedua. |
| Server aplikasi | Sesi cookie, pemilik state demo, pemeriksaan URL/command/revisi/scope dan penyaringan response | Route handler Next.js yang sama; tanpa layanan backend terpisah atau API transaksi kedua. |

Primitive UI dipakai kembali melalui re-export platform. Tidak dilakukan perpindahan massal komponen atau routing. UI `components/core/workspace.tsx` digunakan area `/simrs/*` dan wrapper `/simulasi`. Aturan transaksi hanya berada di `lib/core/engine.ts`.

## B. Perubahan fungsional dan aturan bisnis

1. **Pasien/pendaftaran:** identitas kanonis dan nomor RM, pencarian nama/kode/RM, detail demografi/kontak, pasien baru/lama, datang langsung dan check-in appointment. Pendaftaran memerlukan verifikasi identitas/penjamin serta poli/layanan master. Identitas sama tidak membuat pasien kedua; kunjungan aktif ganda pada pasien/poli yang sama ditolak. Pasien lama dapat didaftarkan kembali setelah kunjungan sebelumnya terminal.
2. **Appointment:** pencatatan pasien, poli, tanggal/jam; validasi duplikasi dan tanggal, pembatalan/no-show beralasan, serta pemakaian appointment terjadwal saat pendaftaran. Tidak dibuat kalender kapasitas atau slot dokter kompleks.
3. **Antrean/rawat jalan:** Menunggu → Dipanggil → Dilayani → Selesai. Masuk pelayanan memerlukan verifikasi unit, penyelesaian memerlukan rekam medis final. Batal/no-show mengikuti status yang diperbolehkan dan mempertahankan jejak. Deposit harus diselesaikan sebelum pembatalan kunjungan.
4. **Rekam medis:** keluhan, pemeriksaan, diagnosis/tindakan master, catatan, keterangan hasil/lampiran sintetis, tindak lanjut dan rujukan. Draft, finalisasi, read-only, koreksi beralasan dan riwayat versi dengan penulis/waktu tersedia. Versi lama tidak ditimpa. Tindakan yang sudah menjadi dasar tagihan tidak dapat diubah diam-diam lewat koreksi. Tidak ada diagnosis otomatis. Lampiran berupa keterangan teks, belum upload berkas.
5. **Billing/kasir:** pendaftaran membentuk charge administrasi; pelayanan selesai menambahkan layanan/tindakan yang dicatat. Tarif disalin saat dibebankan. Tersedia rincian charge/penjamin, pembayaran dummy, deposit sebelum pelayanan selesai, ditolak, refund beralasan dan pembatalan tagihan. Nominal wajib Rupiah bulat positif; pelunasan tidak melampaui sisa tagihan, refund tidak melampaui saldo. Pembayaran ditolak tidak menambah saldo. Pembatalan tidak menghapus riwayat.
6. **Master:** katalog rumah sakit, struktur, SDM/jadwal, layanan, penjamin, diagnosis/tindakan terpusat. Penambahan unit mempertahankan cakupan existing sebagai baris struktur, tidak otomatis membuka workflow poli baru. Administrator dapat mengubah tarif dengan alasan. Katalog lain tetap baca sesuai scope existing.
7. **Laporan:** indikator berasal dari transaksi: pasien unik, seluruh kunjungan, menunggu/dipanggil, pelayanan selesai, charge aktif, pembayaran setelah refund dan sisa tagihan. Informasi keuangan memerlukan capability terkait. Unduhan teks laporan operasional diberi penanda DOKUMEN SIMULASI. Laporan pembelajaran berisi progres, submit, feedback terpublikasi, histori attempt dan penilaian.

Contoh yang dijalankan di browser: satu pasien menghasilkan `RM-SIM-0001`, `KJ-001`, `A-001`. Dokter memfinalisasi rekam medis dan menyelesaikan pelayanan. Tagihan terbentuk dari administrasi Rp15.000 + pelayanan Rp50.000. Kasir mencatat Rp65.000 dummy, status Lunas, kemudian submit mengunci transaksinya untuk penilaian.

## C. Database, hubungan data dan API

**Tidak ada database, perubahan schema, FK fisik, migration atau migrasi data permanen.** Repository sebelumnya belum mempunyai database. Hubungan logis bertipe: Appointment/Visit merujuk Patient; Visit merujuk Service dan menyimpan Charge/Payment; Scenario memiliki snapshot yang disalin ke Attempt. State lama hanya ada di memori browser, bukan data permanen yang dapat dimigrasikan.

State baru berada pada memori proses server. Refresh browser tidak menghapus transaksi. Cookie opaque HttpOnly/SameSite=Strict mengidentifikasi akun dan lingkungan browser, dengan masa berlaku 8 jam. Restart server mengembalikan data demo. Development reload mempertahankan data tanpa mempertahankan metode service usang.

| Endpoint | Fungsi |
| --- | --- |
| POST `/api/auth` | Memilih akun contoh aktif, membuat sesi server/cookie; menolak akun nonaktif. |
| DELETE `/api/auth` | Mencatat logout, membatalkan token, menghapus cookie akun. |
| GET `/api/workspace` | State yang disaring sesuai akun/penugasan, tanpa cache. Parameter `path` dapat memeriksa izin modul. |
| POST `/api/workspace` | Satu facade command: action, revision, sessionId, attemptNumber. Menolak role/state/capability palsu, scope lain, revisi usang, status terkunci dan input tidak valid. |

URL halaman diperiksa server: anonim diarahkan login dan pengguna tanpa izin mendapat forbidden. Mutasi memeriksa origin serta ukuran JSON. Error domain diteruskan sebagai status HTTP relevan; tidak dianggap penyimpanan sukses. Pengenalan error mendukung bundle route Next.js yang terpisah.

Ini autentikasi **akun contoh**, bukan pembuktian identitas dunia nyata. Browser/perangkat lain mempunyai lingkungan demo terpisah. Serah-terima dicoba dengan berganti akun pada browser yang sama; kolaborasi kelas lintas browser dan penyimpanan multi-instance belum tersedia.

## D. Integrasi SIMRS-e, akses dan audit

Alur: master rumah sakit → snapshot saat publikasi Scenario → Session memilih Scenario terpublikasi → Attempt mendapat salinan snapshot → engine inti menghasilkan fakta transaksi → SIMRS-e menambahkan user/sesi/attempt untuk evidence dan penilaian.

Pergantian sesi memuat penugasan, transaksi, submitted, observasi, histori dan Review sesi tersebut. Akun Mahasiswa tetap Mahasiswa walau actor berbeda pada sesi berikutnya. Reset mengarsipkan attempt lama dan membuat nomor baru dari snapshot; master, skenario, audit, komentar dan penilaian dipertahankan. Revisi/nomor attempt lama ditolak. Kartu sesi dashboard memilih konteks sesi yang diklik.

| Akun/actor | Kemampuan |
| --- | --- |
| Administrator | Struktur/tarif master dan katalog/konfigurasi existing. |
| Dosen | Skenario, sesi, penugasan, observasi, penilaian, reset; transaksi inti hanya observasi. |
| Petugas Pendaftaran | Pasien, pendaftaran, appointment dan tindakan antrean yang diperbolehkan. |
| Petugas Rekam Medis | Dokumentasi draft; tidak mengambil alih finalisasi dokter. |
| Dokter | Verifikasi, pelayanan, rekam medis, finalisasi/koreksi dan penyelesaian kunjungan. |
| Kasir | Billing, deposit, pelunasan, ditolak, refund dan pembatalan sesuai status/saldo. |
| Farmasi/Laboratorium | Konteks tugas dan observasi existing, tanpa engine tahap lanjut. |

Response mahasiswa menyaring catatan klinis untuk actor nonklinis, rincian pembayaran untuk nonkasir, dan hanya mengirim feedback miliknya yang dipublikasikan. Tidak mengirim state sesi lain atau observasi dosen. Audit inti menghasilkan feature/action/object/before/after; SIMRS-e menambahkan user, role, waktu, sesi, attempt dan sumber pada sistem audit yang sama. Core tidak menghitung nilai.

## E. UI dan regresi

Foundation Next.js, shadcn Base UI, Hugeicons, tema/CSS variables, AppShell dan route lama dipertahankan. Area SIMRS Inti/Pembelajaran menggunakan navbar berkelompok tanpa sidebar atau horizontal scroll. Context bar tetap membawa SIMULASI, sesi/attempt, actor dan waktu; dosen diarahkan ke monitor sesuai izinnya.

Form mempertahankan label/required, validasi blur/submit, error terdekat, konfirmasi dan status terkunci. Sukses/penutupan dialog menunggu hasil server. Revisi usang memuat ulang state; kegagalan koneksi menawarkan coba lagi. Tabel memakai search/filter/pagination/ukuran halaman/empty state existing. Dialog riwayat panjang menggulir di dalam viewport.

Regresi otomatis mencakup login/allowlist, scenario published/locked, pembuatan sesi, penugasan, start, serah-terima lama, submit, observasi, Review/publikasi feedback, audit, reset, sesi dijeda/ditutup/kedaluwarsa, snapshot master dan dua sesi terisolasi. Ke-14 pengujian lama dipertahankan.

Browser aktual menguji Dosen/Mahasiswa, dashboard, reset beralasan, briefing/penugasan, start/lanjut, pendaftaran kosong/valid, pencarian pasien kosong, detail/riwayat kunjungan, pemanggilan, verifikasi dokter, simpan/finalisasi/riwayat rekam medis, pelayanan selesai, nominal berlebih, pembayaran dummy, submit dan penguncian. URL `/penilaian` untuk Mahasiswa menghasilkan forbidden. Dashboard Dosen menampilkan transaksi peserta. Penilaian/publikasi feedback/pergantian sesi diperiksa lebih lengkap melalui API.

## F. Perintah dan hasil pengujian

Perintah dijalankan dari `frontend/`.

| Perintah/metode | Hasil |
| --- | --- |
| `npm run typecheck` | Lulus TypeScript. |
| `npm run lint` | Lulus ESLint. |
| `npm test` | 32/32 lulus: 14 regresi lama + 18 test domain/service baru. |
| `npm run test:integration` | 2/2 rangkaian HTTP lulus pada server development port 3000. |
| `npm run build` | Lulus kompilasi, TypeScript, page generation dan finalisasi build; API dan `/simrs/*` menjadi dynamic routes. |
| `npm run start -- --port 3001` | Server hasil build mencapai Ready; server uji kemudian dihentikan. |
| `npm run dev` | Pada pemeriksaan akhir port 3000 tidak tersedia; server dinyalakan kembali, mencapai Ready dan `GET /login` mengembalikan HTTP 200. Pratinjau dibiarkan berjalan. Restart menginisialisasi ulang data demo sesuai batas penyimpanan memori. |
| `$env:SIMRS_TEST_URL='http://localhost:3001'; npm run test:integration` | 2/2 rangkaian HTTP lulus pada hasil build; variabel dibersihkan setelah pengujian. |
| Browser responsif | Pendaftaran pada 1920×1080, 1440×900, 1366×768, 1280×800, 1024×768: scrollWidth navbar sama dengan clientWidth; document tidak melebihi viewport. |
| Dialog/dropdown 1024 px | Dropdown layanan x=155–415; detail pasien x≈280–728, y=208–560. Riwayat rekam medis y=24–744 pada tinggi 768; isi panjang menggulir vertikal. |
| Koneksi gagal | Server uji dihentikan setelah halaman login terbuka. Klik masuk tidak menampilkan sukses; muncul error dan Muat ulang data. Pesan fetch mentah kemudian disesuaikan ke Bahasa Indonesia. |

Test HTTP membuat lingkungan sintetis tersendiri, tanpa membaca cookie browser pengguna. Test modules dikompilasi ke direktori sementara lalu dibersihkan, tanpa menambah test framework/dependency.

Temuan yang diperbaiki: error lintas bundle gagal dikenali untuk redirect; feedback form sebelum penyimpanan; state/penugasan yang sebelumnya hanya punya satu konteks operasional; tautan tugas dosen menuju halaman mahasiswa; dan pesan validasi nominal yang menggeser tombol saat nominal diperbaiki.

Batas verifikasi browser: peringatan native isian belum disimpan terpicu, tetapi alat tidak dapat menutupnya otomatis; tab uji ditutup dan alur valid dilanjutkan pada tab baru. Lima viewport pendaftaran berhasil diukur. Navbar dosen tambahan terverifikasi pada 1024 px; override pada tab latar belakang berikutnya tidak selalu diterapkan alat sehingga tidak diklaim sebagai lima ukuran dosen terpisah. Tidak terlihat error runtime aplikasi pada alur valid akhir; error koneksi sengaja dipicu pada server uji.

## G. Batasan dan pekerjaan lanjutan

- Belum ada database/persistensi permanen, password/SSO, manajemen akun penuh, multi-server, kolaborasi lintas browser/perangkat atau monitor real time. Refresh memuat state terbaru; konflik mutasi ditolak berdasarkan revisi.
- Akademik/materi/kuis mempertahankan cakupan existing. Periode/kelas memakai katalog demo yang tersedia, bukan CRUD akademik/kuis lengkap.
- Master lengkap masih baca kecuali penambahan struktur unit dan perubahan tarif. Penyunting snapshot kompleks, poli operasional tambahan, upload lampiran, template cetak rekam medis dan kapasitas appointment belum dibuat.
- Farmasi/penunjang/rawat inap/IGD penuh, klaim dan integrasi produksi tetap di luar iterasi. Tidak ada data pasien nyata, pembayaran nyata atau keputusan klinis otomatis.
- Tidak dilakukan commit atau deploy. Perubahan berada pada working tree untuk ditinjau melalui diff.
