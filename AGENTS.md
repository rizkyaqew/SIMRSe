`AGENTS.md` berfungsi sebagai aturan kerja untuk AI Agent yang akan mengembangkan SIMRS-e. File ini bukan penjelasan fitur, melainkan petunjuk agar setiap agent bekerja dengan cara yang konsisten.

# 1. Tujuan Dokumen
Bagian awal menjelaskan bahwa AI Agent bertugas mengembangkan SIMRS-e Fase 1 sebagai sistem pembelajaran dan simulasi praktikum Administrasi Rumah Sakit.

Agent harus memahami bahwa :
- SIMRS-e bukan SIMRS produksi
- Data pasiend dan data master lainnya yang berhubungan dengan SIMRS merupakan data sintetis
- Transaksi tidak boleh menggunakan pembayaran nyata
- Sistem tidak boleh terhubung ke lingkungan rumah sakit produksi
- Fitur yang dibuat harus mendukung kegiatan teori dan/atau praktikumm

# 2. Dokumen yang Wajib dibaca
Sebelum mengubah kode atau merancang fitur, agent harus membaca :
1. TODO.md
2. ABOUT.md
3. WORKFLOW.md
4. UI.md
5. Laporan fitur terkait di dalam folder Reports

Agent juga harus memeriksa struktur proyek, teknologi yang digunakan, pola penamaan, modul yang sudah tersedia, dan pekerjaan yang masih berlangsung.

# 3. Aturan Memahami Tugas
Agent harus mengerjakan fitur berdasarkan ruang lingkup yang sudah ditetapkan. Agent tidak boleh menambahkan fitur besar yang belum diminta hanya karena dianggap menarik.

Jika terdapat konflik antara dokumen, agent harus : 
- Mengutamakan kebutuhan paling spesifik
- tidak mengambil keputusan yang mengubah alur utama secara sepihak
- mencatat konflik tersebut
- meminta klarifikasi apabila keputusan tersebut memengaruhi struktur data, hak akses atau alur bisnis

# 4. Urutan Kerja Agent
AGENTS.md perlu memberikan alur kerja yang jelas :
1. Memahami tujuan fitur.
2. Membaca dokumen terkait.
3. Memeriksa implementasi yang sudah ada.
4. Menentukan bagian yang perlu ditambahkan atau diperbaiki.
5. Menyusun perubahan paling kecil yang dapat menyelesaikan kebutuhan.
6. Mengikuti aturan UI dan workflow.
7. Menguji alur berhasil dan alur gagal.
8. Memeriksa hak akses dan audit trail.
9. Memperbarui TODO jika pekerjaan memang sudah selesai.
10. Menulis laporan fitur di folder Reports.

Agent tidak boleh langsung mengubah banyak bagian sistem tanpa memahami hubungan antarfitur.

# 5. Aturan Implementasi
Agent harus mengikuti beberapa ketentuan :
- menggunakan pola kode yang sudah ada;
- tidak mengganti teknologi utama tanpa alasan yang jelas;
- tidak menghapus perubahan milik pengguna;
tidak melakukan refactor besar jika tidak berhubungan dengan fitur;
- menjaga agar perubahan dapat dibatalkan atau ditelusuri;
- memisahkan data master, data skenario, dan data hasil percobaan;
- menggunakan status yang jelas pada setiap proses;
- menerapkan hak akses berdasarkan peran;
- mencatat aktivitas penting ke audit trail;
- tidak menyimpan data rahasia di dalam kode;
- tidak menggunakan data pasien nyata untuk pengujian.
# 6. Aturan Khusus SIMRS-e
Agent harus selalu membedakan tiga jenis data:

- master data untuk SIMRS dan modul untuk SIMRS-e simulasi, seperti unit, layanan, tarif, dan petugas;
- data skenario, seperti kondisi awal dan kejadian yang diberikan dosen;
- data percobaan, yaitu transaksi yang dihasilkan mahasiswa.

Data percobaan dapat di-reset, tetapi master data dan riwayat penilaian tidak boleh ikut hilang.

Agent juga harus memastikan setiap fitur dapat dipahami dalam konteks pembelajaran. Sebuah fitur tidak cukup hanya berjalan secara teknis; harus jelas kemampuan apa yang dilatih melalui fitur tersebut.

# 7. Pengujian
Agent wajib menguji :
- alur normal;
- data kosong;
- input tidak valid;
- pengguna tanpa hak akses;
- data yang sudah terkunci;
- sesi yang sudah berakhir;
- pengulangan atau reset;
- perubahan data yang harus tercatat;
- tampilan pada kondisi loading dan error.

Laporan pengujian harus menyebutkan perintah atau metode pengujian yang dijalankan serta hasilnya.

# Perintah Mengisi Laporan
Bagian paling penting dalam `AGENTS.md` adalah instruksi agar setiap agent mengisi laporan fitur setelah selesai bekerja.

Isi perintahnya kurang lebih:

`Setelah menyelesaikan fitur, buat atau perbarui satu file laporan di folder Reports dengan nama yang sesuai. Laporan harus menjelaskan perubahan yang dibuat, alur fitur, aturan bisnis, hak akses, perubahan data atau API, tampilan yang dibuat, pengujian, kendala, dan pekerjaan lanjutan. Jangan menulis laporan yang hanya berisi daftar file yang berubah. Jelaskan dampak perubahan terhadap penggunaan SIMRS-e.`

Agent juga harus mencantumkan:
- status fitur;
- tanggal pengerjaan;
- bagian yang sudah selesai;
- bagian yang belum selesai;
- keputusan teknis penting;
- masalah yang masih diketahui;
- fitur lain yang terdampak.

Laporan harus ditulis dengan bahasa yang jelas dan faktual. Jangan memasukkan token, kata sandi, data pasien nyata, atau log yang berisi informasi sensiti