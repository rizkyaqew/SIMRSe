import { billSummary, executeCore } from "../core/engine"
import { capabilities } from "../platform/permissions"
import type { CoreCommand, CoreState } from "../core/types"
import type { AuditFact, Principal } from "../platform/types"
import type { DemoState } from "./store"
import type { Visit } from "./types"

/** Legacy views receive a projection, never a second transaction source of truth. */
export function legacyVisits(core: CoreState, number: number): Visit[] {
  return core.visits.map((v) => {
    const p = core.patients.find((p) => p.id === v.patientId)!
    return {
      id: v.id,
      name: p.name,
      identity: p.identity,
      birthDate: p.birthDate,
      gender: p.gender,
      address: p.address,
      contact: p.contact,
      payer: v.payer,
      unit: v.unit,
      rm: p.rm,
      queue: v.queue,
      status: v.status,
      note: v.record.data.note,
      paid: billSummary(v).status === "Lunas",
      attempt: number,
      savedAt: v.savedAt,
    }
  })
}
export function corePrincipal(state: DemoState): Principal {
  const participant = state.participants.find(
    (p) => p.id === state.participantId
  )!
  return {
    id: state.role === "Mahasiswa" ? participant.id : state.role,
    name: state.role === "Mahasiswa" ? participant.name : `${state.role} Demo`,
    active: state.signedIn,
    capabilities: capabilities(state.role, participant?.actor),
  }
}
export function applyCore(
  state: DemoState,
  command: CoreCommand,
  now: number
): { state: DemoState; fact: AuditFact } {
  const master = command.type.startsWith("master.")
  const result = executeCore(
    master
      ? { ...state.attempt.core, master: state.hospitalMaster }
      : state.attempt.core,
    command,
    corePrincipal(state),
    now
  )
  if (master)
    return {
      state: {
        ...state,
        hospitalMaster: result.state.master,
        master: result.state.master.rows,
      },
      fact: result.fact,
    }
  return {
    state: {
      ...state,
      attempt: {
        ...state.attempt,
        core: result.state,
        visits: legacyVisits(result.state, state.attempt.number),
      },
      participants: state.participants.map((p) =>
        p.id === state.participantId
          ? { ...p, progress: 100, status: "Tersimpan" }
          : p
      ),
    },
    fact: result.fact,
  }
}
