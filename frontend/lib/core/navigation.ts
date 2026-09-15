export const coreModules = {
  ringkasan: "Dashboard operasional",
  pasien: "Data pasien",
  pendaftaran: "Pendaftaran",
  appointment: "Appointment",
  antrean: "Antrean",
  "rawat-jalan": "Rawat jalan",
  "rekam-medis": "Rekam medis",
  billing: "Billing",
  kasir: "Kasir",
  master: "Master rumah sakit",
  laporan: "Laporan operasional",
}
export type CoreModule = keyof typeof coreModules
export const coreGroups: { label: string; items: CoreModule[] }[] = [
  {
    label: "Layanan pasien",
    items: ["pasien", "pendaftaran", "appointment", "antrean", "rawat-jalan"],
  },
  { label: "Dokumentasi", items: ["rekam-medis"] },
  { label: "Keuangan", items: ["billing", "kasir"] },
  { label: "Data & laporan", items: ["master", "laporan"] },
]
