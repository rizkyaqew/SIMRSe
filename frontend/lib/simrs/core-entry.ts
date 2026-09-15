import { coreModules, type CoreModule } from "../core/navigation"
import { accounts } from "../platform/accounts"
import { canReadCore } from "../platform/core-access"
import { capabilities } from "../platform/permissions"
import type { Actor, Capability, Role } from "../platform/types"
import type { DemoState } from "./store"

export const inputTargets: Partial<
  Record<
    CoreModule,
    { title: string; target: CoreModule; capability: Capability; actor?: Actor }
  >
> = {
  pasien: {
    title: "Data pasien",
    target: "pasien",
    capability: "patient.write",
    actor: "Petugas Pendaftaran",
  },
  pendaftaran: {
    title: "Pendaftaran",
    target: "pendaftaran",
    capability: "registration.write",
    actor: "Petugas Pendaftaran",
  },
  appointment: {
    title: "Appointment",
    target: "appointment",
    capability: "registration.write",
    actor: "Petugas Pendaftaran",
  },
  antrean: {
    title: "Antrean",
    target: "antrean",
    capability: "queue.write",
    actor: "Petugas Pendaftaran",
  },
  "rawat-jalan": {
    title: "Rawat jalan",
    target: "rawat-jalan",
    capability: "record.write",
    actor: "Dokter",
  },
  "rekam-medis": {
    title: "Rekam medis",
    target: "rekam-medis",
    capability: "record.write",
    actor: "Dokter",
  },
  billing: {
    title: "Pembayaran kasir",
    target: "kasir",
    capability: "cashier.write",
    actor: "Kasir",
  },
  kasir: {
    title: "Pembayaran kasir",
    target: "kasir",
    capability: "cashier.write",
    actor: "Kasir",
  },
  master: {
    title: "Master rumah sakit",
    target: "master",
    capability: "master.write",
  },
}

/** Navigation help only: authentication and transaction permissions stay on the server. */
export function coreInputEntry(state: DemoState, module: CoreModule) {
  const target = inputTargets[module]
  if (!target) return null
  const current = state.participants.find((p) => p.id === state.participantId)
  const canWrite =
    state.signedIn &&
    capabilities(state.role, current?.actor).includes(target.capability)
  const candidates = state.participants.filter(
    (p) =>
      p.actor === target.actor &&
      accounts.some(
        (a) => a.active && a.role === "Mahasiswa" && a.participantId === p.id
      )
  )
  const person =
    candidates.find((p) => !state.submitted.includes(p.id)) ?? candidates[0]
  const account = accounts.find(
    (a) =>
      a.active &&
      (target.actor
        ? a.role === "Mahasiswa" && a.participantId === person?.id
        : a.role === "Administrator")
  )
  const path = `/simrs/${target.target}`
  return {
    ...target,
    canWrite,
    path,
    account,
    loginPath: account
      ? `/login?${new URLSearchParams({ akun: account.id, lanjut: path })}`
      : null,
    briefingPath: `/sesi-aktif?${new URLSearchParams({ lanjut: path })}`,
  }
}

/** Accept only known local core pages that the chosen account can read. */
export function safeCoreDestination(
  value: string | null,
  role: Role,
  actor?: Actor
) {
  const section =
    value === "/simrs"
      ? "ringkasan"
      : (Object.keys(coreModules).find((key) => value === `/simrs/${key}`) as
          CoreModule | undefined)
  return section && canReadCore(role, actor, section) ? value : null
}
