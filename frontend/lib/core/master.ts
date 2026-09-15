import {
  masterCategories,
  type HospitalMaster,
  type MasterInput,
} from "./types"
import { DomainError } from "./validation"

export function validateMaster(data: MasterInput) {
  const errors: Record<string, string> = {}
  if (!masterCategories.includes(data?.category))
    errors.category = "Pilih kategori master."
  if (
    typeof data?.name !== "string" ||
    data.name.trim().length < 3 ||
    data.name.length > 120
  )
    errors.name = "Isi nama sintetis sepanjang 3–120 karakter."
  if (
    typeof data?.detail !== "string" ||
    !data.detail.trim() ||
    data.detail.length > 4000
  )
    errors.detail = "Isi keterangan, maksimal 4000 karakter."
  if (!["Aktif", "Nonaktif"].includes(data?.status))
    errors.status = "Pilih status master."
  if (
    ["Layanan & tarif", "Tindakan"].includes(data?.category) &&
    (!Number.isSafeInteger(data.amount) ||
      data.amount! <= 0 ||
      data.amount! > 100_000_000)
  )
    errors.amount = "Isi tarif Rupiah bulat positif, maksimal 100.000.000."
  return errors
}

/** Update catalog and operational options together; callers own snapshot isolation. */
export function saveMaster(master: HospitalMaster, data: MasterInput) {
  const errors = validateMaster(data)
  if (Object.keys(errors).length)
    throw new DomainError("Periksa formulir master.", 422, errors)
  const previous = data.id
    ? master.rows.find((r) => r.id === data.id)
    : undefined
  if (data.id && !previous)
    throw new DomainError("Master tidak ditemukan.", 404)
  if (previous && previous.category !== data.category)
    throw new DomainError(
      "Kategori data tersimpan tidak dapat dipindahkan.",
      409
    )
  const name = data.name.trim(),
    detail = data.detail.trim()
  if (
    master.rows.some(
      (r) =>
        r.id !== data.id &&
        r.category === data.category &&
        r.name.toLowerCase() === name.toLowerCase()
    )
  )
    throw new DomainError("Nama sudah tersedia dalam kategori ini.", 409)
  const existingService =
    previous && master.services.find((s) => s.id === previous.id)
  if (existingService?.kind === "administration" && data.status === "Nonaktif")
    throw new DomainError("Administrasi pendaftaran harus tetap aktif.", 409)
  if (
    existingService?.kind === "consultation" &&
    data.status === "Nonaktif" &&
    !master.services.some(
      (s) => s.id !== data.id && s.kind === "consultation" && s.active
    )
  )
    throw new DomainError("Minimal satu layanan rawat jalan harus aktif.", 409)
  const prefix: Record<MasterInput["category"], string> = {
    "Unit & poli": "UNIT",
    Poli: "POLI",
    "SDM & jadwal": "SDM",
    "Layanan & tarif": "LAY",
    Penjamin: "JMN",
    "Obat & bahan": "OBT",
    Ruangan: "RNG",
    "Tempat tidur": "BED",
    Supplier: "SUP",
    Diagnosis: "DX-DEMO",
    Tindakan: "TIN",
  }
  let n = master.rows.length + 1
  let id = data.id ?? `${prefix[data.category]}-${String(n).padStart(3, "0")}`
  while (!data.id && master.rows.some((r) => r.id === id))
    id = `${prefix[data.category]}-${String(++n).padStart(3, "0")}`
  const row = { id, name, detail, category: data.category, status: data.status }
  const syncNames = (values: string[]) => {
    const next = values.filter((v) => v !== previous?.name)
    if (data.status === "Aktif" && !next.includes(name)) next.push(name)
    if (!next.length)
      throw new DomainError("Minimal satu pilihan aktif harus tersedia.", 409)
    return next
  }
  if (data.category === "Poli") master.units = syncNames(master.units)
  if (data.category === "Penjamin") master.payers = syncNames(master.payers)
  if (data.category === "Diagnosis") {
    master.diagnoses = master.diagnoses.filter((d) => d.id !== id)
    if (data.status === "Aktif") master.diagnoses.push({ id, name })
  }
  if (["Layanan & tarif", "Tindakan"].includes(data.category)) {
    const service = {
      id,
      name,
      amount: data.amount!,
      active: data.status === "Aktif",
      kind:
        existingService?.kind ??
        (data.category === "Tindakan"
          ? ("procedure" as const)
          : ("consultation" as const)),
    }
    master.services = [...master.services.filter((s) => s.id !== id), service]
  }
  master.rows = previous
    ? master.rows.map((r) => (r.id === id ? row : r))
    : [...master.rows, row]
  return { row, previous }
}
