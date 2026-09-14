/** Demo contracts: keep master, scenario, and attempt data separate. */
export type Role = "Administrator" | "Dosen" | "Mahasiswa"
export type Actor =
  | "Petugas Pendaftaran"
  | "Petugas Rekam Medis"
  | "Dokter"
  | "Petugas Farmasi"
  | "Petugas Laboratorium"
  | "Kasir"
export interface Participant {
  id: string
  name: string
  actor: Actor
  progress: number
  status: string
}
export interface Scenario {
  id: string
  title: string
  objective: string
  context: string
  period: string
  semester: string
  course: string
  classroom: string
  group: string
  duration: number
  status: "Draft" | "Uji Coba" | "Dipublikasikan" | "Diarsipkan"
}
export interface Session {
  id: string
  scenarioId: string
  title: string
  date: string
  time: string
  status: "Terjadwal" | "Sedang berjalan" | "Dijeda" | "Ditutup"
  classroom: string
  duration: number
}
export interface PatientInput {
  name: string
  identity: string
  birthDate: string
  gender: string
  address: string
  payer: string
  unit: string
}
export interface Visit extends PatientInput {
  id: string
  rm: string
  queue: string
  status: "Menunggu" | "Dilayani" | "Selesai"
  note: string
  paid: boolean
  attempt: number
  savedAt: string
}
export interface AuditEntry {
  id: string
  time: string
  user: string
  role: string
  action: string
  object: string
  before: string
  after: string
  session: string
  attempt: number
}
export interface Review {
  participantId: string
  attempt: number
  comment: string
  status: "Menunggu penilaian" | "Dinilai" | "Dikembalikan"
  published: boolean
}
export interface Attempt {
  number: number
  status: "Belum dimulai" | "Berjalan" | "Submit"
  deadline: number | null
  visits: Visit[]
}
export interface MasterRow {
  id: string
  name: string
  category: string
  detail: string
  status: string
}
export interface NavItem {
  path: string
  label: string
  description: string
}
export interface NavGroup {
  label: string
  items: NavItem[]
}
