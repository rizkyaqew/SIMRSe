/** Hospital facts only. Scope selection and learning evidence belong to callers. */
export interface MasterRow {
  id: string
  name: string
  category: string
  detail: string
  status: string
}
export interface Service {
  id: string
  name: string
  amount: number
  kind: "administration" | "consultation" | "procedure"
  active: boolean
}
export interface HospitalMaster {
  hospital: string
  rows: MasterRow[]
  units: string[]
  payers: string[]
  diagnoses: { id: string; name: string }[]
  services: Service[]
}
export interface PatientInput {
  name: string
  identity: string
  birthDate: string
  gender: string
  address: string
  payer: string
  unit: string
  contact?: string
}
export interface Patient extends Omit<PatientInput, "unit"> {
  id: string
  rm: string
  createdAt: string
}
export type QueueStatus =
  | "Menunggu"
  | "Dipanggil"
  | "Dilayani"
  | "Selesai"
  | "Dibatalkan"
  | "Tidak datang"
export interface RecordInput {
  complaint: string
  examination: string
  diagnosisId: string
  procedureIds: string[]
  note: string
  result: string
  followUp: string
  referral: string
}
export interface RecordVersion {
  version: number
  data: RecordInput
  author: string
  time: string
  reason: string
  finalized: boolean
}
export interface MedicalRecord {
  data: RecordInput
  finalized: boolean
  versions: RecordVersion[]
}
export interface Charge {
  id: string
  serviceId: string
  name: string
  amount: number
  quantity: number
  cancelled: boolean
  reason: string
}
export interface Payment {
  id: string
  kind: "Deposit" | "Pembayaran" | "Refund" | "Ditolak"
  amount: number
  time: string
  reason: string
}
export interface Visit {
  id: string
  patientId: string
  unit: string
  payer: string
  serviceId: string
  arrival: "Datang langsung" | "Appointment"
  appointmentId?: string
  queue: string
  status: QueueStatus
  verified: boolean
  record: MedicalRecord
  charges: Charge[]
  payments: Payment[]
  createdAt: string
  savedAt: string
  cancelReason: string
}
export interface Appointment {
  id: string
  patientId: string
  unit: string
  date: string
  time: string
  status: "Terjadwal" | "Terdaftar" | "Dibatalkan" | "Tidak datang"
  reason: string
}
export interface CoreState {
  master: HospitalMaster
  patients: Patient[]
  visits: Visit[]
  appointments: Appointment[]
}
export type CoreCommand =
  | { type: "patient.create"; patient: PatientInput }
  | {
      type: "registration.create"
      patient?: PatientInput
      patientId?: string
      unit: string
      payer: string
      verified: boolean
      serviceId: string
      appointmentId?: string
    }
  | {
      type: "appointment.create"
      patientId: string
      unit: string
      date: string
      time: string
    }
  | {
      type: "appointment.close"
      id: string
      status: "Dibatalkan" | "Tidak datang"
      reason: string
    }
  | {
      type: "queue.transition"
      id: string
      status: QueueStatus
      reason?: string
    }
  | { type: "visit.verify"; id: string }
  | { type: "record.save"; id: string; data: RecordInput }
  | { type: "record.finalize"; id: string }
  | { type: "record.correct"; id: string; data: RecordInput; reason: string }
  | { type: "billing.cancel"; id: string; reason: string }
  | {
      type: "payment.record"
      id: string
      kind: Payment["kind"]
      amount: number
      reason: string
    }
  | { type: "master.unit"; name: string; detail: string }
  | { type: "master.tariff"; id: string; amount: number; reason: string }
