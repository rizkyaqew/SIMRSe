import type { PatientInput } from "./types"
export function validatePatient(form: PatientInput) {
  const errors: Record<string, string> = {}
  if (!form.name.trim().toLowerCase().includes("sintetis"))
    errors.name = "Gunakan nama dengan penanda Sintetis."
  if (!/^SINT-\d{4,}$/.test(form.identity))
    errors.identity = "Gunakan kode sintetis, misalnya SINT-0001."
  if (
    !form.birthDate ||
    !Number.isFinite(Date.parse(form.birthDate)) ||
    new Date(form.birthDate) > new Date() ||
    new Date(form.birthDate).getFullYear() < 1900
  )
    errors.birthDate = "Pilih tanggal lahir valid yang tidak melebihi hari ini."
  if (!["Perempuan", "Laki-laki"].includes(form.gender))
    errors.gender = "Pilih jenis kelamin."
  if (form.address.trim().length < 8)
    errors.address = "Isi alamat fiktif minimal 8 karakter."
  if (!["Umum", "JKN Simulasi"].includes(form.payer))
    errors.payer = "Pilih penjamin simulasi."
  if (form.unit !== "Poli Umum")
    errors.unit = "Pilih poli tujuan dari skenario."
  return errors
}
