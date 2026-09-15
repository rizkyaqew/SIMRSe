import type { Actor, Capability, Principal, Role } from "./types"
export function capabilities(role: Role, actor?: Actor): Capability[] {
  if (role === "Administrator") return ["master.write", "billing.read"]
  if (role === "Dosen") return ["billing.read", "record.read"]
  switch (actor) {
    case "Petugas Pendaftaran":
      return ["patient.write", "registration.write", "queue.write"]
    case "Petugas Rekam Medis":
      return ["record.write"]
    case "Dokter":
      return ["queue.write", "record.write", "record.finalize"]
    case "Kasir":
      return ["cashier.write", "billing.read"]
    default:
      return []
  }
}
export function hasCapability(principal: Principal, capability: Capability) {
  return principal.active && principal.capabilities.includes(capability)
}
