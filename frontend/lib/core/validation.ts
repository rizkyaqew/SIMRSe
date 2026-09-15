import type { HospitalMaster, PatientInput, RecordInput } from "./types"
export class DomainError extends Error {
  constructor(
    message: string,
    public status = 422,
    public fields: Record<string, string> = {}
  ) {
    super(message)
    this.name = "DomainError"
  }
}
/** Next server route bundles may load separate copies of this class. */
export function isDomainError(error: unknown): error is DomainError {
  return (
    error instanceof Error &&
    error.name === "DomainError" &&
    "status" in error &&
    typeof error.status === "number" &&
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500 &&
    "fields" in error &&
    typeof error.fields === "object" &&
    error.fields !== null
  )
}
export function validatePatient(
  form: PatientInput,
  master?: HospitalMaster,
  now = Date.now()
) {
  const errors: Record<string, string> = {}
  if (
    typeof form.name !== "string" ||
    !form.name.trim().toLowerCase().includes("sintetis")
  )
    errors.name = "Gunakan nama dengan penanda Sintetis."
  if (typeof form.identity !== "string" || !/^SINT-\d{4,}$/.test(form.identity))
    errors.identity = "Gunakan kode sintetis, misalnya SINT-0001."
  const date = new Date(form.birthDate)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== form.birthDate ||
    date.getTime() > now ||
    date.getUTCFullYear() < 1900
  )
    errors.birthDate = "Pilih tanggal lahir valid yang tidak melebihi hari ini."
  if (!["Perempuan", "Laki-laki"].includes(form.gender))
    errors.gender = "Pilih jenis kelamin."
  if (typeof form.address !== "string" || form.address.trim().length < 8)
    errors.address = "Isi alamat fiktif minimal 8 karakter."
  if (!(master?.payers ?? ["Umum", "JKN Simulasi"]).includes(form.payer))
    errors.payer = "Pilih penjamin dari master."
  if (!(master?.units ?? ["Poli Umum"]).includes(form.unit))
    errors.unit = "Pilih poli dari master."
  if (form.contact && !/^KONTAK-SINT-\d{4,}$/.test(form.contact))
    errors.contact = "Gunakan kontak fiktif, misalnya KONTAK-SINT-0001."
  return errors
}
export function validateRecord(
  data: RecordInput,
  master: HospitalMaster,
  complete = false
) {
  const errors: Record<string, string> = {}
  if (complete && !data.note?.trim())
    errors.note = "Catatan pelayanan wajib dilengkapi sebelum finalisasi."
  if (
    data.diagnosisId &&
    !master.diagnoses.some((d) => d.id === data.diagnosisId)
  )
    errors.diagnosisId = "Pilih diagnosis contoh dari master."
  if (
    !Array.isArray(data.procedureIds) ||
    data.procedureIds.some(
      (id) =>
        !master.services.some(
          (s) => s.id === id && s.active && s.kind === "procedure"
        )
    )
  )
    errors.procedureIds = "Tindakan tidak tersedia pada master."
  return errors
}
