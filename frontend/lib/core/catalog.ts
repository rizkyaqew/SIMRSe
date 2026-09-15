import type { CoreState, HospitalMaster, MasterRow, RecordInput } from "./types"
export const masterData: MasterRow[] = [
  {
    id: "UNIT-001",
    name: "Poliklinik Rawat Jalan",
    category: "Unit & poli",
    detail: "Unit pelayanan · Poli Umum",
    status: "Aktif",
  },
  {
    id: "UNIT-002",
    name: "Instalasi Rekam Medis",
    category: "Unit & poli",
    detail: "Unit administrasi pelayanan",
    status: "Aktif",
  },
  {
    id: "UNIT-003",
    name: "Instalasi Farmasi",
    category: "Unit & poli",
    detail: "Unit penunjang simulasi",
    status: "Aktif",
  },
  {
    id: "UNIT-004",
    name: "Laboratorium",
    category: "Unit & poli",
    detail: "Unit penunjang simulasi",
    status: "Aktif",
  },
  {
    id: "UNIT-005",
    name: "Kasir Rawat Jalan",
    category: "Unit & poli",
    detail: "Administrasi pembayaran dummy",
    status: "Aktif",
  },
  {
    id: "SDM-001",
    name: "Dokter Sintetis 001",
    category: "SDM & jadwal",
    detail: "Poli Umum · Senin–Jumat, 08:00–12:00",
    status: "Aktif",
  },
  {
    id: "SDM-002",
    name: "Petugas Sintetis 002",
    category: "SDM & jadwal",
    detail: "Pendaftaran · Senin–Jumat, 07:00–14:00",
    status: "Aktif",
  },
  {
    id: "LAY-001",
    name: "Administrasi pendaftaran",
    category: "Layanan & tarif",
    detail: "Rp15.000 · per kunjungan",
    status: "Aktif",
  },
  {
    id: "LAY-002",
    name: "Pelayanan rawat jalan",
    category: "Layanan & tarif",
    detail: "Rp50.000 · per kunjungan",
    status: "Aktif",
  },
  {
    id: "JMN-001",
    name: "Umum",
    category: "Penjamin",
    detail: "Pembayaran mandiri simulasi",
    status: "Aktif",
  },
  {
    id: "JMN-002",
    name: "JKN Simulasi",
    category: "Penjamin",
    detail: "Verifikasi internal · tanpa integrasi",
    status: "Aktif",
  },
  {
    id: "OBT-001",
    name: "Obat Simulasi A",
    category: "Obat & bahan",
    detail: "100 unit · stok pembelajaran",
    status: "Aktif",
  },
  {
    id: "RNG-001",
    name: "Ruang Pemeriksaan 01",
    category: "Ruangan",
    detail: "Poli Umum · kapasitas 1",
    status: "Aktif",
  },
]
export const patientSeed = {
  name: "Pasien Sintetis 001",
  identity: "SINT-0001",
  birthDate: "1995-01-15",
  gender: "Perempuan",
  address: "Jalan Simulasi No. 1, Kota Edukasi",
  payer: "Umum",
  unit: "Poli Umum",
}
const legacyTariffs = [
  { name: "Administrasi pendaftaran", amount: 15000 },
  { name: "Pelayanan rawat jalan", amount: 50000 },
]
export const hospitalMaster: HospitalMaster = {
  hospital: "RS Edukasi SIMRS-e",
  rows: [
    ...masterData,
    {
      id: "DX-DEMO-01",
      name: "Diagnosis contoh A",
      category: "Diagnosis",
      detail:
        "Kode internal fiktif untuk dokumentasi; bukan rekomendasi diagnosis",
      status: "Aktif",
    },
    {
      id: "TIN-001",
      name: "Tindakan administrasi pelayanan",
      category: "Tindakan",
      detail: "Rp25.000 · contoh tindakan tercatat",
      status: "Aktif",
    },
  ],
  units: ["Poli Umum"],
  payers: ["Umum", "JKN Simulasi"],
  diagnoses: [
    { id: "DX-DEMO-01", name: "Diagnosis contoh A" },
    { id: "DX-DEMO-02", name: "Diagnosis contoh B" },
  ],
  services: [
    {
      id: "LAY-001",
      ...legacyTariffs[0],
      kind: "administration",
      active: true,
    },
    { id: "LAY-002", ...legacyTariffs[1], kind: "consultation", active: true },
    {
      id: "TIN-001",
      name: "Tindakan administrasi pelayanan",
      amount: 25000,
      kind: "procedure",
      active: true,
    },
  ],
}
export const tariffs = hospitalMaster.services.filter(
  (s) => s.kind !== "procedure"
)
export const emptyRecord: RecordInput = {
  complaint: "",
  examination: "",
  diagnosisId: "",
  procedureIds: [],
  note: "",
  result: "",
  followUp: "",
  referral: "",
}
export function createCoreState(
  master: HospitalMaster = hospitalMaster
): CoreState {
  return {
    master: structuredClone(master),
    patients: [],
    visits: [],
    appointments: [],
  }
}
