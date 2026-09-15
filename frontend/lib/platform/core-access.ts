import type { Actor, Role } from "./types"
import type { CoreModule } from "../core/navigation"

/** Platform permissions map accounts and contextual assignments to hospital modules. */
export function canReadCore(
  role: Role,
  actor: Actor | undefined,
  module: CoreModule
) {
  if (role === "Administrator")
    return ["ringkasan", "master", "laporan"].includes(module)
  if (role === "Dosen") return true
  const sections: Record<Actor, CoreModule[]> = {
    "Petugas Pendaftaran": [
      "ringkasan",
      "pasien",
      "pendaftaran",
      "appointment",
      "antrean",
      "laporan",
    ],
    "Petugas Rekam Medis": ["ringkasan", "pasien", "rekam-medis", "laporan"],
    Dokter: ["ringkasan", "antrean", "rawat-jalan", "rekam-medis", "laporan"],
    Kasir: ["ringkasan", "billing", "kasir", "laporan"],
    "Petugas Farmasi": ["ringkasan", "laporan"],
    "Petugas Laboratorium": ["ringkasan", "laporan"],
  }
  return !!actor && sections[actor].includes(module)
}
