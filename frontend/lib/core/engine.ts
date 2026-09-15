import { hasCapability } from "../platform/permissions"
import type { AuditFact, Capability, Principal } from "../platform/types"
import { emptyRecord } from "./catalog"
import { saveMaster } from "./master"
import type {
  CoreCommand,
  CoreState,
  Patient,
  PatientInput,
  RecordInput,
  Service,
  Visit,
} from "./types"
import { DomainError, validatePatient, validateRecord } from "./validation"

const fail = (message: string, status = 422): never => {
  throw new DomainError(message, status)
}
const text = (value: unknown, label: string, required = false) => {
  if (
    typeof value !== "string" ||
    value.length > 4000 ||
    (required && !value.trim())
  )
    return fail(`${label} tidak valid atau belum diisi.`)
  return value.trim()
}
const money = (value: number) =>
  Number.isSafeInteger(value) && value > 0 && value <= 100_000_000
const requireCapability = (principal: Principal, capability: Capability) => {
  if (!hasCapability(principal, capability))
    fail("Peran Anda tidak diizinkan melakukan tindakan ini.", 403)
}
export function billSummary(visit: Visit) {
  const total = visit.charges
    .filter((c) => !c.cancelled)
    .reduce((n, c) => n + c.amount * c.quantity, 0)
  const paid = visit.payments.reduce(
    (n, p) =>
      n +
      (p.kind === "Refund" ? -p.amount : p.kind === "Ditolak" ? 0 : p.amount),
    0
  )
  const cancelled =
    visit.charges.length > 0 && visit.charges.every((c) => c.cancelled)
  return {
    total,
    paid,
    due: Math.max(0, total - paid),
    credit: Math.max(0, paid - total),
    status: cancelled
      ? "Dibatalkan"
      : total > 0 && paid >= total
        ? "Lunas"
        : visit.payments.at(-1)?.kind === "Ditolak"
          ? "Ditolak"
          : "Belum lunas",
  }
}
export function operationalSummary(state: CoreState) {
  const bills = state.visits.map(billSummary)
  return {
    patients: state.patients.length,
    visits: state.visits.length,
    waiting: state.visits.filter((v) =>
      ["Menunggu", "Dipanggil"].includes(v.status)
    ).length,
    completed: state.visits.filter((v) => v.status === "Selesai").length,
    cancelled: state.visits.filter((v) =>
      ["Dibatalkan", "Tidak datang"].includes(v.status)
    ).length,
    charges: bills.reduce((n, b) => n + b.total, 0),
    received: bills.reduce((n, b) => n + b.paid, 0),
    outstanding: bills.reduce((n, b) => n + b.due, 0),
  }
}
function patientFields(input: PatientInput): PatientInput {
  if (!input || typeof input !== "object")
    return fail("Data pasien tidak valid.", 400)
  return {
    name: text(input.name, "Nama", true),
    identity: text(input.identity, "Identitas", true),
    birthDate: text(input.birthDate, "Tanggal lahir", true),
    gender: text(input.gender, "Jenis kelamin", true),
    address: text(input.address, "Alamat", true),
    payer: text(input.payer, "Penjamin", true),
    unit: text(input.unit, "Poli", true),
    contact: text(input.contact ?? "", "Kontak"),
  }
}
function recordFields(input: RecordInput): RecordInput {
  if (
    !input ||
    !Array.isArray(input.procedureIds) ||
    input.procedureIds.length > 20
  )
    return fail("Data rekam medis tidak valid.")
  return {
    complaint: text(input.complaint, "Keluhan"),
    examination: text(input.examination, "Pemeriksaan"),
    diagnosisId: text(input.diagnosisId, "Diagnosis"),
    procedureIds: [
      ...new Set(input.procedureIds.map((id) => text(id, "Tindakan", true))),
    ],
    note: text(input.note, "Catatan"),
    result: text(input.result, "Hasil/lampiran"),
    followUp: text(input.followUp, "Tindak lanjut"),
    referral: text(input.referral, "Rujukan"),
  }
}
/** One transaction engine for all callers. It never receives academic or assessment data. */
export function executeCore(
  current: CoreState,
  command: CoreCommand,
  principal: Principal,
  now: number
): { state: CoreState; fact: AuditFact } {
  if (!command || typeof command.type !== "string")
    fail("Perintah tidak valid.", 400)
  if (!principal.active) fail("Akun tidak aktif.", 403)
  const state = structuredClone(current)
  const time = new Date(now).toISOString()
  let before = "—",
    after = "—",
    object = "",
    description = "",
    feature = ""
  const getVisit = (id: string) =>
    state.visits.find((v) => v.id === id) ??
    fail("Kunjungan tidak ditemukan pada lingkungan ini.", 404)
  const service = (id: string, kind?: Service["kind"]) => {
    const row = state.master.services.find(
      (s) => s.id === id && s.active && (!kind || s.kind === kind)
    )
    if (!row || !money(row.amount))
      return fail("Layanan atau tarif tidak valid. Periksa master tarif.")
    return row
  }
  const addCharge = (visit: Visit, row: Service) => {
    if (visit.charges.some((c) => c.serviceId === row.id)) return
    visit.charges.push({
      id: `${visit.id}-${row.id}`,
      serviceId: row.id,
      name: row.name,
      amount: row.amount,
      quantity: 1,
      cancelled: false,
      reason: "",
    })
  }
  const addPatient = (raw: PatientInput) => {
    const input = patientFields(raw)
    const errors = validatePatient(input, state.master, now)
    if (Object.keys(errors).length)
      throw new DomainError("Periksa data pasien.", 422, errors)
    if (state.patients.some((p) => p.identity === input.identity))
      fail("Identitas sudah terdaftar. Cari dan pilih pasien lama.", 409)
    const number = String(state.patients.length + 1).padStart(4, "0")
    const { unit: _unit, ...demographics } = input
    void _unit
    const patient: Patient = {
      ...demographics,
      id: `PS-${number}`,
      rm: `RM-SIM-${number}`,
      createdAt: time,
    }
    state.patients.push(patient)
    return patient
  }
  switch (command.type) {
    case "master.hospital": {
      requireCapability(principal, "master.write")
      const name = text(command.name, "Nama rumah sakit", true)
      if (name.length < 3 || name.length > 120)
        fail("Nama rumah sakit harus 3–120 karakter.")
      const reason = text(command.reason, "Alasan", true)
      before = state.master.hospital
      state.master.hospital = name
      after = `${name} · ${reason}`
      object = "HOSPITAL"
      feature = "Master rumah sakit"
      description = "Identitas rumah sakit diperbarui"
      break
    }
    case "master.save": {
      requireCapability(principal, "master.write")
      const reason = text(command.reason, "Alasan", true)
      const result = saveMaster(state.master, command.data)
      before = result.previous ? JSON.stringify(result.previous) : "—"
      after = JSON.stringify({ ...result.row, reason })
      object = result.row.id
      feature = "Master rumah sakit"
      description = result.previous ? "Master diperbarui" : "Master ditambahkan"
      break
    }
    case "patient.update": {
      requireCapability(principal, "patient.write")
      const patient =
        state.patients.find((p) => p.id === command.id) ??
        fail("Pasien tidak ditemukan.", 404)
      if (
        state.visits.some(
          (v) => v.patientId === patient.id && v.record.finalized
        )
      )
        fail(
          "Identitas pasien terkait rekam medis final terkunci. Riwayat dokumen harus tetap utuh.",
          409
        )
      const input = patientFields(command.patient)
      const errors = validatePatient(input, state.master, now)
      if (Object.keys(errors).length)
        throw new DomainError("Periksa data pasien.", 422, errors)
      if (
        state.patients.some(
          (p) => p.id !== patient.id && p.identity === input.identity
        )
      )
        fail("Identitas sudah digunakan pasien lain.", 409)
      const reason = text(command.reason, "Alasan koreksi", true)
      before = JSON.stringify(patient)
      const { unit: _unit, ...fields } = input
      void _unit
      Object.assign(patient, fields, { updatedAt: time })
      after = JSON.stringify({ ...patient, reason })
      object = patient.id
      feature = "Pasien"
      description = "Identitas pasien dikoreksi"
      break
    }
    case "patient.create": {
      requireCapability(principal, "patient.write")
      const patient = addPatient(command.patient)
      object = patient.id
      after = JSON.stringify(patient)
      description = "Pasien sintetis dibuat"
      feature = "Pasien"
      break
    }
    case "registration.create": {
      requireCapability(principal, "registration.write")
      if (command.verified !== true)
        fail("Verifikasi identitas dan penjamin terlebih dahulu.")
      if (
        !state.master.units.includes(command.unit) ||
        !state.master.payers.includes(command.payer)
      )
        fail("Unit atau penjamin tidak tersedia.")
      const consultation = service(command.serviceId, "consultation")
      const administration = state.master.services.find(
        (s) => s.kind === "administration" && s.active
      )
      if (!administration) fail("Tarif administrasi belum tersedia.")
      service(administration!.id, "administration")
      const patient = command.patientId
        ? (state.patients.find((p) => p.id === command.patientId) ??
          fail("Pasien tidak ditemukan.", 404))
        : command.patient
          ? addPatient(command.patient)
          : fail("Pilih pasien lama atau isi pasien baru.")
      if (
        state.visits.some(
          (v) =>
            v.patientId === patient.id &&
            v.unit === command.unit &&
            ["Menunggu", "Dipanggil", "Dilayani"].includes(v.status)
        )
      )
        fail("Pasien masih memiliki kunjungan aktif pada poli ini.", 409)
      const appointment = command.appointmentId
        ? state.appointments.find((a) => a.id === command.appointmentId)
        : undefined
      if (
        command.appointmentId &&
        (!appointment ||
          appointment.patientId !== patient.id ||
          appointment.unit !== command.unit ||
          appointment.status !== "Terjadwal")
      )
        fail("Appointment tidak sesuai atau sudah diproses.", 409)
      if (appointment) appointment.status = "Terdaftar"
      const number = String(state.visits.length + 1).padStart(3, "0")
      const visit: Visit = {
        id: `KJ-${number}`,
        patientId: patient.id,
        unit: command.unit,
        payer: command.payer,
        serviceId: consultation.id,
        arrival: appointment ? "Appointment" : "Datang langsung",
        ...(appointment ? { appointmentId: appointment.id } : {}),
        queue: `A-${number}`,
        status: "Menunggu",
        verified: false,
        record: {
          data: structuredClone(emptyRecord),
          finalized: false,
          versions: [],
        },
        charges: [],
        payments: [],
        createdAt: time,
        savedAt: time,
        cancelReason: "",
      }
      addCharge(visit, administration!)
      state.visits.push(visit)
      object = visit.id
      after = JSON.stringify(visit)
      description = "Pendaftaran pasien disimpan"
      feature = "Pendaftaran"
      break
    }
    case "appointment.create": {
      requireCapability(principal, "registration.write")
      if (
        !state.patients.some((p) => p.id === command.patientId) ||
        !state.master.units.includes(command.unit)
      )
        fail("Pilih pasien dan poli yang tersedia.")
      const date = text(command.date, "Tanggal", true),
        clock = text(command.time, "Jam", true)
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)
      )
        fail("Tanggal atau jam appointment tidak valid.")
      if (
        state.appointments.some(
          (a) =>
            a.patientId === command.patientId &&
            a.date === date &&
            a.time === clock &&
            a.status === "Terjadwal"
        )
      )
        fail("Appointment yang sama sudah terjadwal.", 409)
      const row = {
        id: `APT-${String(state.appointments.length + 1).padStart(3, "0")}`,
        patientId: command.patientId,
        unit: command.unit,
        date,
        time: clock,
        status: "Terjadwal" as const,
        reason: "",
      }
      state.appointments.push(row)
      object = row.id
      after = JSON.stringify(row)
      description = "Appointment dicatat"
      feature = "Appointment"
      break
    }
    case "appointment.close": {
      requireCapability(principal, "registration.write")
      const row =
        state.appointments.find((a) => a.id === command.id) ??
        fail("Appointment tidak ditemukan.", 404)
      if (
        row.status !== "Terjadwal" ||
        !["Dibatalkan", "Tidak datang"].includes(command.status)
      )
        fail("Appointment sudah terkunci.", 409)
      before = JSON.stringify(row)
      row.reason = text(command.reason, "Alasan", true)
      row.status = command.status
      object = row.id
      after = JSON.stringify(row)
      description = "Status appointment diubah"
      feature = "Appointment"
      break
    }
    case "queue.transition": {
      requireCapability(principal, "queue.write")
      const visit = getVisit(command.id)
      const allowed: Record<string, string[]> = {
        Menunggu: ["Dipanggil", "Dibatalkan", "Tidak datang"],
        Dipanggil: ["Dilayani", "Dibatalkan", "Tidak datang"],
        Dilayani: ["Selesai"],
      }
      if (!allowed[visit.status]?.includes(command.status))
        fail(
          `Perubahan ${visit.status} → ${command.status} tidak diizinkan.`,
          409
        )
      if (["Dilayani", "Selesai"].includes(command.status))
        requireCapability(principal, "record.finalize")
      if (command.status === "Dilayani" && !visit.verified)
        fail("Verifikasi kunjungan sebelum memulai pelayanan.")
      if (command.status === "Selesai" && !visit.record.finalized)
        fail("Finalisasi rekam medis sebelum menyelesaikan pelayanan.")
      before = JSON.stringify(visit)
      if (["Dibatalkan", "Tidak datang"].includes(command.status)) {
        if (billSummary(visit).paid > 0)
          fail("Kembalikan saldo deposit sebelum membatalkan kunjungan.", 409)
        visit.cancelReason = text(command.reason, "Alasan", true)
        visit.charges.forEach((c) => {
          c.cancelled = true
          c.reason = visit.cancelReason
        })
      }
      if (command.status === "Selesai") {
        addCharge(visit, service(visit.serviceId, "consultation"))
        visit.record.data.procedureIds.forEach((id) =>
          addCharge(visit, service(id, "procedure"))
        )
      }
      visit.status = command.status
      visit.savedAt = time
      object = visit.id
      after = JSON.stringify(visit)
      description = "Status antrean diubah"
      feature = "Antrean"
      break
    }
    case "visit.verify": {
      requireCapability(principal, "record.write")
      const visit = getVisit(command.id)
      if (!["Menunggu", "Dipanggil"].includes(visit.status) || visit.verified)
        fail("Verifikasi tidak dapat diulang pada status ini.", 409)
      before = "Belum diverifikasi"
      visit.verified = true
      visit.savedAt = time
      object = visit.id
      after = "Terverifikasi"
      description = "Kunjungan diverifikasi"
      feature = "Rawat jalan"
      break
    }
    case "record.save":
    case "record.finalize":
    case "record.correct": {
      requireCapability(
        principal,
        command.type === "record.save" ? "record.write" : "record.finalize"
      )
      const visit = getVisit(command.id)
      if (["Dibatalkan", "Tidak datang"].includes(visit.status))
        fail("Kunjungan telah dibatalkan.", 409)
      const correct = command.type === "record.correct"
      if (
        correct
          ? !visit.record.finalized
          : visit.record.finalized || visit.status === "Selesai"
      )
        fail(
          "Catatan terkunci. Gunakan koreksi beralasan untuk dokumen final.",
          409
        )
      if (command.type === "record.finalize" && visit.status !== "Dilayani")
        fail("Finalisasi dilakukan saat pasien sedang dilayani.", 409)
      const data =
        command.type === "record.finalize"
          ? visit.record.data
          : recordFields(command.data)
      const errors = validateRecord(
        data,
        state.master,
        command.type !== "record.save"
      )
      if (Object.keys(errors).length)
        throw new DomainError("Rekam medis belum lengkap.", 422, errors)
      if (
        correct &&
        JSON.stringify(data.procedureIds) !==
          JSON.stringify(visit.record.data.procedureIds)
      )
        fail(
          "Koreksi catatan tidak boleh mengganti tindakan yang sudah menjadi sumber tagihan."
        )
      const reason = correct ? text(command.reason, "Alasan koreksi", true) : ""
      before = JSON.stringify(visit.record)
      visit.record.data = data
      visit.record.finalized = command.type !== "record.save"
      visit.record.versions.push({
        version: visit.record.versions.length + 1,
        data: structuredClone(data),
        author: principal.name,
        time,
        reason,
        finalized: visit.record.finalized,
      })
      visit.savedAt = time
      object = visit.id
      after = JSON.stringify(visit.record)
      feature = "Rekam medis"
      description = correct
        ? "Koreksi rekam medis dicatat"
        : command.type === "record.finalize"
          ? "Rekam medis difinalisasi"
          : "Rekam medis disimpan"
      break
    }
    case "billing.cancel": {
      requireCapability(principal, "cashier.write")
      const visit = getVisit(command.id),
        summary = billSummary(visit)
      if (summary.paid !== 0 || summary.status === "Dibatalkan")
        fail(
          "Tagihan sudah dibatalkan atau masih memiliki saldo. Lakukan refund lebih dahulu.",
          409
        )
      if (visit.status !== "Selesai")
        fail(
          "Pembatalan billing dilakukan setelah pelayanan selesai; gunakan pembatalan kunjungan untuk antrean."
        )
      before = JSON.stringify(visit.charges)
      const reason = text(command.reason, "Alasan", true)
      visit.charges.forEach((c) => {
        c.cancelled = true
        c.reason = reason
      })
      visit.savedAt = time
      object = visit.id
      after = JSON.stringify(visit.charges)
      description = "Tagihan dibatalkan"
      feature = "Billing"
      break
    }
    case "payment.record": {
      requireCapability(principal, "cashier.write")
      const visit = getVisit(command.id),
        summary = billSummary(visit)
      if (
        !money(command.amount) ||
        !["Deposit", "Pembayaran", "Refund", "Ditolak"].includes(command.kind)
      )
        fail("Jenis atau nominal transaksi tidak valid.")
      const reason = text(command.reason, "Alasan/keterangan", true)
      if (command.kind === "Refund") {
        if (command.amount > summary.paid)
          fail("Refund melebihi saldo pembayaran yang tersedia.")
      } else {
        if (
          ["Dibatalkan", "Tidak datang"].includes(visit.status) ||
          summary.status === "Dibatalkan"
        )
          fail("Tagihan/kunjungan dibatalkan.", 409)
        if (command.kind !== "Deposit" && visit.status !== "Selesai")
          fail("Pembayaran hanya dapat diproses setelah pelayanan selesai.")
        if (command.kind === "Deposit" && visit.status === "Selesai")
          fail("Gunakan pembayaran pelunasan untuk pelayanan selesai.")
        if (command.kind !== "Deposit" && command.amount > summary.due)
          fail("Nominal melebihi sisa tagihan.")
      }
      before = JSON.stringify(visit.payments)
      visit.payments.push({
        id: `${visit.id}-PAY-${visit.payments.length + 1}`,
        kind: command.kind,
        amount: command.amount,
        time,
        reason,
      })
      visit.savedAt = time
      object = visit.id
      after = JSON.stringify(visit.payments)
      description = `${command.kind} dummy dicatat`
      feature = "Kasir"
      break
    }
    case "master.unit": {
      requireCapability(principal, "master.write")
      const name = text(command.name, "Nama unit", true),
        detail = text(command.detail, "Keterangan", true)
      if (
        state.master.rows.some(
          (r) => r.name.toLowerCase() === name.toLowerCase()
        )
      )
        fail("Nama unit sudah tersedia.", 409)
      const row = {
        id: `UNIT-${state.master.rows.length + 1}`,
        name,
        detail,
        category: "Unit & poli",
        status: "Aktif",
      }
      state.master.rows.push(row)
      object = row.id
      after = JSON.stringify(row)
      description = "Unit simulasi ditambahkan"
      feature = "Master rumah sakit"
      break
    }
    case "master.tariff": {
      requireCapability(principal, "master.write")
      const row = service(command.id)
      if (!money(command.amount))
        fail("Tarif harus berupa Rupiah bulat positif.")
      const reason = text(command.reason, "Alasan", true)
      before = String(row.amount)
      row.amount = command.amount
      object = row.id
      after = `${row.amount}: ${reason}`
      state.master.rows = state.master.rows.map((r) =>
        r.id === row.id
          ? {
              ...r,
              detail: `Rp${command.amount.toLocaleString("id-ID")} · per layanan`,
            }
          : r
      )
      description = "Tarif master diperbarui"
      feature = "Master tarif"
      break
    }
    default:
      fail("Tindakan tidak dikenal.", 400)
  }
  return {
    state,
    fact: { feature, action: description, object, before, after },
  }
}
