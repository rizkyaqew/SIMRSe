/** Compatibility contracts; hospital facts are owned by core. */
import type { Actor } from "../platform/types"
import type { CoreState, PatientInput, QueueStatus } from "../core/types"
export type { Role, Actor } from "../platform/types"
export type { MasterRow, PatientInput } from "../core/types"
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
  initialData?: CoreState
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
export interface Visit extends PatientInput {
  id: string
  rm: string
  queue: string
  status: QueueStatus
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
  feature?: string
  source?: string
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
  core: CoreState
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
