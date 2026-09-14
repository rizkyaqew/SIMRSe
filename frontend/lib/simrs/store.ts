import * as demo from "./data"
import { validatePatient } from "./validation"
import type {
  Attempt,
  AuditEntry,
  MasterRow,
  Participant,
  Review,
  Role,
  Scenario,
  Session,
  Visit,
} from "./types"

export interface DemoState {
  role: Role
  participantId: string
  signedIn: boolean
  scenarios: Scenario[]
  sessions: Session[]
  participants: Participant[]
  master: MasterRow[]
  audit: AuditEntry[]
  reviews: Review[]
  attempt: Attempt
  submitted: string[]
  history: Attempt[]
  observations: string[]
}
export const initialState: DemoState = {
  role: "Dosen",
  participantId: demo.participants[0].id,
  signedIn: true,
  scenarios: demo.scenarios,
  sessions: demo.sessions,
  participants: demo.participants,
  master: demo.masterData,
  audit: demo.initialAudit,
  reviews: demo.reviews,
  attempt: { number: 1, status: "Belum dimulai", deadline: null, visits: [] },
  submitted: demo.participants
    .filter((p) => p.status === "Submit")
    .map((p) => p.id),
  history: [],
  observations: [],
}
export type Action =
  | { type: "login"; role: Role; participantId: string }
  | { type: "logout" }
  | { type: "scenario"; scenario: Scenario }
  | { type: "session"; session: Session }
  | { type: "session-status"; status: Session["status"]; reason: string }
  | { type: "assign"; id: string; actor: Participant["actor"] }
  | { type: "start" }
  | { type: "visit"; visit: Visit }
  | {
      type: "visit-update"
      id: string
      status?: Visit["status"]
      note?: string
      paid?: boolean
    }
  | { type: "submit" }
  | { type: "reset"; reason: string }
  | { type: "review"; review: Review }
  | { type: "observe"; text: string }
  | { type: "master"; row: MasterRow }
export function participant(state: DemoState) {
  return (
    state.participants.find((p) => p.id === state.participantId) ??
    state.participants[0]
  )
}
export function lockReason(state: DemoState, now: number) {
  if (state.sessions[0].status === "Ditutup")
    return "Sesi telah berakhir. Data hanya dapat dibaca."
  if (state.sessions[0].status === "Dijeda")
    return "Sesi dijeda oleh dosen. Tunggu sesi dilanjutkan."
  if (state.attempt.deadline && now >= state.attempt.deadline)
    return "Batas waktu telah berakhir. Hubungi dosen untuk tindak lanjut."
  if (state.submitted.includes(state.participantId))
    return "Hasil Anda sudah diserahkan. Transaksi terkunci untuk penilaian."
  if (state.attempt.status === "Belum dimulai")
    return "Baca briefing dan mulai percobaan terlebih dahulu."
  return ""
}
/** Pure transitions keep role/status checks at the mutation boundary, not just on buttons. */
export function transition(
  state: DemoState,
  action: Action,
  now: number
): DemoState {
  let next = state
  let before = "—"
  let after = "—"
  let object = "SESI-001"
  let description = ""
  const actor = participant(state).actor
  const isTeacher = state.signedIn && state.role === "Dosen"
  const editable =
    state.signedIn && state.role === "Mahasiswa" && !lockReason(state, now)
  switch (action.type) {
    case "login":
      next = {
        ...state,
        role: action.role,
        participantId: action.participantId,
        signedIn: true,
      }
      description = "Masuk ke akun demo"
      after = action.role
      break
    case "logout":
      next = { ...state, signedIn: false }
      description = "Keluar dari akun demo"
      break
    case "scenario": {
      if (!isTeacher) return state
      const current = state.scenarios.find((s) => s.id === action.scenario.id)
      if (current && ["Dipublikasikan", "Diarsipkan"].includes(current.status))
        return state
      before = current?.status ?? "Belum dibuat"
      after = action.scenario.status
      object = action.scenario.id
      next = {
        ...state,
        scenarios: current
          ? state.scenarios.map((s) => (s.id === object ? action.scenario : s))
          : [...state.scenarios, action.scenario],
      }
      description = "Skenario disimpan"
      break
    }
    case "session":
      if (
        !isTeacher ||
        !state.scenarios.some(
          (s) =>
            s.id === action.session.scenarioId && s.status === "Dipublikasikan"
        )
      )
        return state
      next = { ...state, sessions: [...state.sessions, action.session] }
      object = action.session.id
      after = action.session.status
      description = "Sesi dijadwalkan"
      break
    case "session-status":
      if (
        !isTeacher ||
        !action.reason.trim() ||
        state.sessions[0].status === "Ditutup"
      )
        return state
      before = state.sessions[0].status
      after = `${action.status}: ${action.reason}`
      next = {
        ...state,
        sessions: state.sessions.map((s, i) =>
          i === 0 ? { ...s, status: action.status } : s
        ),
      }
      description = "Status sesi diubah"
      break
    case "assign":
      if (
        !isTeacher ||
        state.attempt.status !== "Belum dimulai" ||
        state.sessions[0].status === "Ditutup"
      )
        return state
      object = action.id
      before = state.participants.find((p) => p.id === object)?.actor ?? "—"
      after = action.actor
      next = {
        ...state,
        participants: state.participants.map((p) =>
          p.id === object ? { ...p, actor: action.actor } : p
        ),
      }
      description = "Peran mahasiswa ditetapkan"
      break
    case "start":
      if (
        !state.signedIn ||
        state.role !== "Mahasiswa" ||
        state.submitted.includes(state.participantId) ||
        state.sessions[0].status !== "Sedang berjalan" ||
        state.attempt.status !== "Belum dimulai"
      )
        return state
      next = {
        ...state,
        participants: state.participants.map((p) =>
          state.submitted.includes(p.id)
            ? p
            : { ...p, status: "Berjalan", progress: Math.max(p.progress, 10) }
        ),
        attempt: {
          ...state.attempt,
          status: "Berjalan",
          deadline: now + state.sessions[0].duration * 60000,
        },
      }
      before = "Belum dimulai"
      after = "Berjalan"
      description = "Percobaan dimulai"
      break
    case "visit":
      if (
        !editable ||
        actor !== "Petugas Pendaftaran" ||
        Object.keys(validatePatient(action.visit)).length > 0 ||
        state.attempt.visits.some((v) => v.identity === action.visit.identity)
      )
        return state
      next = {
        ...state,
        attempt: {
          ...state.attempt,
          visits: [...state.attempt.visits, action.visit],
        },
      }
      object = action.visit.id
      after = action.visit.name
      description = "Pendaftaran pasien disimpan"
      next = {
        ...next,
        participants: next.participants.map((p) =>
          p.id === state.participantId
            ? { ...p, progress: 100, status: "Tersimpan" }
            : p
        ),
      }
      break
    case "visit-update": {
      const visit = state.attempt.visits.find((v) => v.id === action.id)
      if (!editable || !visit || visit.paid) return state
      if (
        visit.status === "Selesai" &&
        (action.status || action.note !== undefined)
      )
        return state
      if (action.status === "Dilayani" && visit.status !== "Menunggu")
        return state
      if (
        action.paid !== undefined &&
        (actor !== "Kasir" || visit.status !== "Selesai")
      )
        return state
      if (action.status && actor !== "Dokter") return state
      if (
        action.status === "Selesai" &&
        (visit.status !== "Dilayani" || !(action.note ?? visit.note).trim())
      )
        return state
      if (
        action.note !== undefined &&
        !["Petugas Rekam Medis", "Dokter"].includes(actor)
      )
        return state
      const updated = {
        ...visit,
        ...(action.status ? { status: action.status } : {}),
        ...(action.note !== undefined ? { note: action.note } : {}),
        ...(action.paid !== undefined ? { paid: action.paid } : {}),
        savedAt: new Date(now).toISOString(),
      }
      before = JSON.stringify(visit)
      after = JSON.stringify(updated)
      object = visit.id
      next = {
        ...state,
        attempt: {
          ...state.attempt,
          visits: state.attempt.visits.map((v) =>
            v.id === object ? updated : v
          ),
        },
      }
      description = action.paid
        ? "Pembayaran dummy dicatat"
        : "Kunjungan diperbarui"
      next = {
        ...next,
        participants: next.participants.map((p) =>
          p.id === state.participantId
            ? { ...p, progress: 100, status: "Tersimpan" }
            : p
        ),
      }
      break
    }
    case "submit":
      if (!editable || !state.attempt.visits.length) return state
      if (actor === "Kasir" && !state.attempt.visits.every((v) => v.paid))
        return state
      next = {
        ...state,
        submitted: [...state.submitted, state.participantId],
        participants: state.participants.map((p) =>
          p.id === state.participantId
            ? { ...p, status: "Submit", progress: 100 }
            : p
        ),
        reviews: [
          ...state.reviews.filter(
            (r) =>
              r.participantId !== state.participantId ||
              r.attempt !== state.attempt.number
          ),
          {
            participantId: state.participantId,
            attempt: state.attempt.number,
            comment: "",
            status: "Menunggu penilaian",
            published: false,
          },
        ],
      }
      before = "Berjalan"
      after = "Submit"
      object = state.participantId
      description = "Hasil praktikum diserahkan"
      break
    case "reset":
      if (
        !isTeacher ||
        !action.reason.trim() ||
        state.sessions[0].status === "Ditutup"
      )
        return state
      next = {
        ...state,
        history: [...state.history, state.attempt],
        attempt: {
          number: state.attempt.number + 1,
          status: "Belum dimulai",
          deadline: null,
          visits: [],
        },
        submitted: [],
        participants: state.participants.map((p) => ({
          ...p,
          progress: 0,
          status: "Belum dimulai",
        })),
      }
      before = `Percobaan ${state.attempt.number}`
      after = `Percobaan ${next.attempt.number}: ${action.reason}`
      description = "Percobaan diulang"
      break
    case "review":
      if (!isTeacher || !action.review.comment.trim()) return state
      next = {
        ...state,
        reviews: state.reviews.map((r) =>
          r.participantId === action.review.participantId &&
          r.attempt === action.review.attempt
            ? action.review
            : r
        ),
      }
      object = action.review.participantId
      before =
        state.reviews.find((r) => r.participantId === object)?.status ?? "—"
      after = `${action.review.status}: ${action.review.comment}`
      description = "Penilaian diperbarui"
      break
    case "observe":
      if (!isTeacher || !action.text.trim()) return state
      next = { ...state, observations: [action.text, ...state.observations] }
      after = action.text
      description = "Observasi disimpan"
      break
    case "master":
      if (
        !state.signedIn ||
        state.role !== "Administrator" ||
        !action.row.name.trim()
      )
        return state
      next = { ...state, master: [...state.master, action.row] }
      object = action.row.id
      after = action.row.name
      description = "Unit simulasi ditambahkan"
      break
  }
  const event: AuditEntry = {
    id: `AUD-${now}-${state.audit.length}`,
    time: new Date(now).toISOString(),
    user:
      action.type === "login"
        ? `${action.role} Demo`
        : state.role === "Mahasiswa"
          ? participant(state).name
          : `${state.role} Demo`,
    role:
      action.type === "login"
        ? action.role
        : state.role === "Mahasiswa"
          ? actor
          : state.role,
    action: description,
    object,
    before,
    after,
    session: "SESI-001",
    attempt: state.attempt.number,
  }
  return { ...next, audit: [event, ...state.audit] }
}
