/** Account authorization is distinct from the actor assigned to a hospital workflow. */
export type Role = "Administrator" | "Dosen" | "Mahasiswa"
export type Actor =
  | "Petugas Pendaftaran"
  | "Petugas Rekam Medis"
  | "Dokter"
  | "Petugas Farmasi"
  | "Petugas Laboratorium"
  | "Kasir"
export type Capability =
  | "patient.write"
  | "registration.write"
  | "queue.write"
  | "record.write"
  | "record.finalize"
  | "cashier.write"
  | "master.write"
  | "billing.read"
  | "record.read"
export interface Principal {
  id: string
  name: string
  active: boolean
  capabilities: Capability[]
}
export interface AuditFact {
  feature: string
  action: string
  object: string
  before: string
  after: string
}
export interface Account {
  id: string
  role: Role
  name: string
  participantId: string
  active: boolean
}
