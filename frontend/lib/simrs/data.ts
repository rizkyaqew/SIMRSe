import type {
  Actor,
  AuditEntry,
  Participant,
  Review,
  Scenario,
  Session,
} from "./types"
export const academic = {
  year: "2026/2027",
  semester: "Ganjil",
  course: "Administrasi Pelayanan Rumah Sakit",
  classroom: "ARS A",
  group: "Kelompok 1",
  hospital: "RS Edukasi SIMRS-e",
}
export const actors: Actor[] = [
  "Petugas Pendaftaran",
  "Petugas Rekam Medis",
  "Dokter",
  "Petugas Farmasi",
  "Petugas Laboratorium",
  "Kasir",
]
export const participants: Participant[] = actors.map((actor, i) => ({
  id: `MHS-DEMO-0${i + 1}`,
  name: `Mahasiswa Demo 0${i + 1}`,
  actor,
  progress: [50, 75, 100, 25, 50, 100][i],
  status: ["Berjalan", "Berjalan", "Submit", "Menunggu", "Berjalan", "Submit"][
    i
  ],
}))
const context = {
  period: academic.year,
  semester: academic.semester,
  course: academic.course,
  classroom: academic.classroom,
  group: academic.group,
}
export const scenarios: Scenario[] = [
  {
    ...context,
    id: "SK-001",
    title: "Alur pelayanan rawat jalan",
    objective:
      "Memproses administrasi pasien dari pendaftaran hingga billing serta melakukan serah-terima antarperan secara tepat.",
    context:
      "Pasien Sintetis 001 datang ke poli umum. Kelompok memverifikasi identitas, mencatat kunjungan, melengkapi administrasi pelayanan, dan menyelesaikan tagihan simulasi.",
    duration: 60,
    status: "Dipublikasikan",
  },
  {
    ...context,
    id: "SK-002",
    title: "Verifikasi administrasi pasien",
    objective:
      "Memeriksa kelengkapan identitas, penjamin, dan berkas kunjungan secara teliti.",
    context:
      "Pasien sintetis membawa berkas yang perlu diverifikasi sebelum memasuki antrean pelayanan.",
    duration: 45,
    status: "Uji Coba",
  },
  {
    ...context,
    id: "SK-003",
    title: "Ketelitian billing dan kasir",
    objective:
      "Mencocokkan layanan dengan tarif dan mencatat pembayaran dummy.",
    context:
      "Petugas kasir memeriksa tagihan dari layanan rawat jalan yang sudah selesai.",
    duration: 45,
    status: "Draft",
  },
]
export const sessions: Session[] = [
  {
    id: "SESI-001",
    scenarioId: "SK-001",
    title: scenarios[0].title,
    date: "2026-09-14",
    time: "08:00",
    status: "Sedang berjalan",
    classroom: "ARS A",
    duration: 60,
  },
  {
    id: "SESI-002",
    scenarioId: "SK-001",
    title: "Rawat jalan · latihan lanjutan",
    date: "2026-09-16",
    time: "09:00",
    status: "Terjadwal",
    classroom: "ARS A",
    duration: 60,
  },
]
export const reviews: Review[] = participants
  .filter((p) => p.status === "Submit")
  .map((p) => ({
    participantId: p.id,
    attempt: 1,
    comment: "",
    status: "Menunggu penilaian",
    published: false,
  }))
export const initialAudit: AuditEntry[] = [
  {
    id: "AUD-003",
    time: "2026-09-14T08:24:00+07:00",
    user: participants[0].name,
    role: actors[0],
    action: "Data pendaftaran diperiksa",
    object: "Pasien Sintetis 001",
    before: "Belum diperiksa",
    after: "Identitas sesuai skenario",
    session: "SESI-001",
    attempt: 1,
  },
  {
    id: "AUD-002",
    time: "2026-09-14T08:20:00+07:00",
    user: participants[2].name,
    role: actors[2],
    action: "Tugas diserahkan",
    object: participants[2].id,
    before: "Berjalan",
    after: "Submit",
    session: "SESI-001",
    attempt: 1,
  },
  {
    id: "AUD-001",
    time: "2026-09-14T08:00:00+07:00",
    user: "Dosen Demo",
    role: "Dosen",
    action: "Sesi praktikum dibuka",
    object: "SESI-001",
    before: "Terjadwal",
    after: "Sedang berjalan",
    session: "SESI-001",
    attempt: 1,
  },
]
export { masterData, patientSeed, tariffs } from "../core/catalog"
export const materials = [
  {
    id: "MAT-001",
    title: "Alur administrasi rawat jalan",
    type: "Modul",
    duration: "10 menit",
    content:
      "Pendaftaran → Antrean → Unit pelayanan → Rekam medis dan tindakan → Billing dan laporan. Periksa identitas sintetis, pilih poli serta penjamin sesuai skenario, lalu serahkan informasi ke peran berikutnya. Setiap peran bertanggung jawab atas ketepatan dan kelengkapan data yang dicatat.",
  },
  {
    id: "MAT-002",
    title: "Ketelitian dan verifikasi identitas",
    type: "SOP",
    duration: "5 menit",
    content:
      "Cocokkan kode identitas, nama, dan tanggal lahir dengan data skenario. Cari pasien yang sudah terdaftar sebelum membuat data baru. Nomor rekam medis mengidentifikasi pasien, sedangkan nomor kunjungan mengidentifikasi episode pelayanan.",
  },
  {
    id: "MAT-003",
    title: "Serah-terima tugas antarperan",
    type: "Panduan",
    duration: "8 menit",
    content:
      "Pastikan pekerjaan pada tahap Anda lengkap. Sampaikan nomor kunjungan, status pelayanan, dan informasi administrasi yang diperlukan kepada peran selanjutnya. Hasil yang sudah diserahkan terkunci agar riwayat proses tetap dapat ditinjau dosen.",
  },
]
export const actorTasks: Record<Actor, string[]> = {
  "Petugas Pendaftaran": [
    "Verifikasi identitas pasien sintetis",
    "Pilih penjamin dan poli tujuan",
    "Simpan pendaftaran dan nomor antrean",
  ],
  "Petugas Rekam Medis": [
    "Periksa identitas dan kunjungan",
    "Lengkapi catatan administrasi",
    "Finalisasi kelengkapan berkas",
  ],
  Dokter: [
    "Periksa kunjungan yang diterima",
    "Catat pelayanan sesuai skenario",
    "Selesaikan pelayanan rawat jalan",
  ],
  "Petugas Farmasi": [
    "Baca penugasan dari dosen",
    "Periksa data obat simulasi",
    "Catat hasil pengamatan dalam laporan",
  ],
  "Petugas Laboratorium": [
    "Baca penugasan dari dosen",
    "Periksa kelengkapan permintaan",
    "Catat hasil pengamatan dalam laporan",
  ],
  Kasir: [
    "Periksa rincian layanan",
    "Cocokkan tagihan dengan tarif",
    "Catat pembayaran dummy",
  ],
}
export { formatDate, formatTime, rupiah } from "../platform/format"
