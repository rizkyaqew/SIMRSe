import * as demo from "./data"
import { createCoreState, hospitalMaster } from "../core/catalog"
import { DomainError } from "../core/validation"
import type { CoreCommand, HospitalMaster } from "../core/types"
import { applyCore } from "./core-adapter"
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

export interface SessionData {
  participants: Participant[]
  attempt: Attempt
  submitted: string[]
  history: Attempt[]
  reviews: Review[]
  observations: string[]
}
export interface DemoState extends SessionData {
  role: Role
  participantId: string
  signedIn: boolean
  scenarios: Scenario[]
  sessions: Session[]
  master: MasterRow[]
  hospitalMaster: HospitalMaster
  audit: AuditEntry[]
  activeSessionId: string
  sessionData: Record<string, SessionData>
  revision: number
}
function runtime(index = 0): SessionData {
  return {
    participants: demo.participants.map((p, i) => ({
      ...p,
      ...(index
        ? {
            actor: demo.actors[(i + index) % demo.actors.length],
            progress: 0,
            status: "Belum dimulai",
          }
        : {}),
    })),
    attempt: {
      number: 1,
      status: "Belum dimulai",
      deadline: null,
      visits: [],
      core: createCoreState(),
    },
    submitted: index ? [] : demo.reviews.map((r) => r.participantId),
    history: [],
    reviews: index ? [] : structuredClone(demo.reviews),
    observations: [],
  }
}
const first = runtime()
export const initialState: DemoState = {
  ...first,
  role: "Dosen",
  participantId: demo.participants[0].id,
  signedIn: true,
  scenarios: demo.scenarios.map((s) => ({
    ...s,
    ...(s.status === "Dipublikasikan"
      ? { initialData: createCoreState() }
      : {}),
  })),
  sessions: demo.sessions,
  master: hospitalMaster.rows,
  hospitalMaster,
  audit: demo.initialAudit,
  activeSessionId: demo.sessions[0].id,
  sessionData: Object.fromEntries(
    demo.sessions.map((s, i) => [s.id, i ? runtime(i) : first])
  ),
  revision: 0,
}
export type Action =
  | { type: "login"; role: Role; participantId: string }
  | { type: "logout" }
  | { type: "scenario"; scenario: Scenario }
  | { type: "session"; session: Session }
  | { type: "select-session"; id: string }
  | { type: "session-status"; status: Session["status"]; reason: string }
  | { type: "assign"; id: string; actor: Participant["actor"] }
  | { type: "start" }
  | {
      type: "core"
      command: CoreCommand
      sessionId: string
      attemptNumber: number
    }
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
  if (state.sessions[0].status === "Terjadwal")
    return "Sesi belum dibuka oleh dosen."
  if (state.attempt.deadline && now >= state.attempt.deadline)
    return "Batas waktu telah berakhir. Hubungi dosen untuk tindak lanjut."
  if (state.submitted.includes(state.participantId))
    return "Hasil Anda sudah diserahkan. Transaksi terkunci untuk penilaian."
  if (state.attempt.status === "Belum dimulai")
    return "Baca briefing dan mulai percobaan terlebih dahulu."
  return ""
}
function slice(state: DemoState): SessionData {
  return {
    participants: state.participants,
    attempt: state.attempt,
    submitted: state.submitted,
    history: state.history,
    reviews: state.reviews,
    observations: state.observations,
  }
}
const denied = (
  message = "Tindakan tidak diizinkan pada peran atau status ini.",
  status = 403
): never => {
  throw new DomainError(message, status)
}
const reason = (value: string) => {
  if (typeof value !== "string" || !value.trim() || value.length > 4000)
    denied("Alasan/keterangan wajib diisi dan maksimal 4000 karakter.", 422)
}
/** Compatibility facade. All hospital mutations delegate to core; learning transitions stay here. */
export function transition(
  state: DemoState,
  action: Action,
  now: number,
  strict = false
): DemoState {
  try {
    return applyAction(state, action, now)
  } catch (error) {
    if (strict) throw error
    if (error instanceof DomainError) return state
    throw error
  }
}
function applyAction(state: DemoState, action: Action, now: number): DemoState {
  let next = state,
    before = "—",
    after = "—",
    object = state.activeSessionId,
    description = "",
    feature = "Pembelajaran"
  const isTeacher = state.signedIn && state.role === "Dosen"
  const editable =
    state.signedIn && state.role === "Mahasiswa" && !lockReason(state, now)
  const core = (command: CoreCommand) => {
    if (!command || typeof command.type !== "string")
      denied("Perintah transaksi tidak valid.", 400)
    const master = command.type.startsWith("master.")
    if (master ? !state.signedIn || state.role !== "Administrator" : !editable)
      denied(
        lockReason(state, now) || "Peran tidak diizinkan memproses transaksi."
      )
    const result = applyCore(next, command, now)
    next = result.state
    before = result.fact.before
    after = result.fact.after
    object = result.fact.object
    description = result.fact.action
    feature = result.fact.feature
  }
  switch (action.type) {
    case "login":
      if (
        !["Dosen", "Mahasiswa", "Administrator"].includes(action.role) ||
        !state.participants.some((p) => p.id === action.participantId)
      )
        denied("Akun demo tidak ditemukan.", 403)
      next = {
        ...state,
        role: action.role,
        participantId: action.participantId,
        signedIn: true,
      }
      after = action.role
      description = "Masuk ke akun demo"
      feature = "Akun"
      break
    case "logout":
      next = { ...state, signedIn: false }
      description = "Keluar dari akun demo"
      feature = "Akun"
      break
    case "select-session": {
      if (!state.signedIn || state.role === "Administrator") denied()
      const target = state.sessionData[action.id],
        session = state.sessions.find((s) => s.id === action.id)
      if (
        !target ||
        !session ||
        (state.role === "Mahasiswa" &&
          !target.participants.some((p) => p.id === state.participantId))
      )
        denied("Sesi tidak ditemukan atau Anda bukan peserta sesi ini.", 403)
      if (action.id === state.activeSessionId) return state
      next = {
        ...state,
        ...target,
        activeSessionId: action.id,
        sessions: [
          session!,
          ...state.sessions.filter((s) => s.id !== action.id),
        ],
        sessionData: {
          ...state.sessionData,
          [state.activeSessionId]: slice(state),
        },
      }
      before = state.activeSessionId
      after = action.id
      object = action.id
      description = "Konteks sesi dipilih"
      break
    }
    case "scenario": {
      if (!isTeacher) denied()
      const incoming = action.scenario,
        current = state.scenarios.find((s) => s.id === incoming?.id)
      if (current && ["Dipublikasikan", "Diarsipkan"].includes(current.status))
        denied(
          "Skenario terpublikasi terkunci. Buat skenario baru untuk perubahan.",
          409
        )
      if (
        !incoming ||
        !["Draft", "Uji Coba", "Dipublikasikan"].includes(incoming.status) ||
        ![
          incoming.id,
          incoming.title,
          incoming.objective,
          incoming.context,
          incoming.period,
          incoming.semester,
          incoming.course,
          incoming.classroom,
          incoming.group,
        ].every((v) => typeof v === "string" && v.trim() && v.length <= 4000) ||
        !Number.isInteger(incoming.duration) ||
        incoming.duration < 5 ||
        incoming.duration > 480
      )
        denied("Lengkapi konteks, nama, tujuan, dan durasi skenario.", 422)
      const scenario: Scenario = {
        id: incoming.id,
        title: incoming.title,
        objective: incoming.objective,
        context: incoming.context,
        period: incoming.period,
        semester: incoming.semester,
        course: incoming.course,
        classroom: incoming.classroom,
        group: incoming.group,
        duration: incoming.duration,
        status: incoming.status,
        ...(incoming.status === "Dipublikasikan"
          ? { initialData: createCoreState(state.hospitalMaster) }
          : {}),
      }
      next = {
        ...state,
        scenarios: current
          ? state.scenarios.map((s) => (s.id === scenario.id ? scenario : s))
          : [...state.scenarios, scenario],
      }
      object = scenario.id
      before = current?.status ?? "Belum dibuat"
      after = scenario.status
      description = "Skenario disimpan"
      break
    }
    case "session": {
      if (!isTeacher) denied()
      const input = action.session
      if (
        !input ||
        !state.scenarios.some(
          (s) => s.id === input.scenarioId && s.status === "Dipublikasikan"
        ) ||
        state.sessions.some((s) => s.id === input.id) ||
        ![input.id, input.title, input.classroom].every(
          (v) => typeof v === "string" && v.trim()
        ) ||
        !Number.isFinite(Date.parse(input.date)) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time) ||
        !Number.isInteger(input.duration) ||
        input.duration < 5 ||
        input.duration > 480
      )
        denied("Data sesi tidak valid atau skenario belum dipublikasikan.", 422)
      const session: Session = {
        id: input.id,
        title: input.title,
        scenarioId: input.scenarioId,
        classroom: input.classroom,
        date: input.date,
        time: input.time,
        duration: input.duration,
        status: "Terjadwal",
      }
      const data = runtime(0)
      data.participants = state.participants.map((p) => ({
        ...p,
        progress: 0,
        status: "Belum dimulai",
      }))
      data.submitted = []
      data.reviews = []
      const scenario = state.scenarios.find((s) => s.id === session.scenarioId)!
      data.attempt.core = structuredClone(
        scenario.initialData ?? createCoreState(state.hospitalMaster)
      )
      next = {
        ...state,
        sessions: [...state.sessions, session],
        sessionData: { ...state.sessionData, [session.id]: data },
      }
      object = session.id
      after = session.status
      description = "Sesi dijadwalkan"
      break
    }
    case "session-status":
      if (!isTeacher) denied()
      reason(action.reason)
      if (
        state.sessions[0].status === "Ditutup" ||
        !["Sedang berjalan", "Dijeda", "Ditutup"].includes(action.status) ||
        state.sessions[0].status === action.status ||
        (state.sessions[0].status === "Terjadwal" && action.status === "Dijeda")
      )
        denied("Perubahan status sesi tidak diizinkan.", 409)
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
        denied()
      if (
        !demo.actors.includes(action.actor) ||
        !state.participants.some((p) => p.id === action.id)
      )
        denied("Peserta atau peran tidak tersedia.", 422)
      object = action.id
      before = state.participants.find((p) => p.id === object)!.actor
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
        denied()
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
    case "core":
      if (
        action.sessionId !== state.activeSessionId ||
        action.attemptNumber !== state.attempt.number
      )
        denied(
          "Konteks sesi/percobaan berubah. Muat data terbaru sebelum menyimpan.",
          409
        )
      core(action.command)
      break
    case "visit":
      if (!action.visit) denied("Data pendaftaran tidak valid.", 400)
      // Transitional call contract; numbers/status/billing supplied by clients are ignored.
      core({
        type: "registration.create",
        patient: action.visit,
        unit: action.visit.unit,
        payer: action.visit.payer,
        serviceId: "LAY-002",
        verified: true,
      })
      after = action.visit.name
      break
    case "visit-update": {
      const original = state.attempt.core.visits.find((v) => v.id === action.id)
      if (!original) denied("Kunjungan tidak ditemukan.", 404)
      if (
        original!.status === "Selesai" &&
        (action.note !== undefined || action.status)
      )
        denied("Catatan final terkunci. Gunakan koreksi beralasan.", 409)
      if (action.note !== undefined)
        core({
          type: "record.save",
          id: action.id,
          data: { ...original!.record.data, note: action.note },
        })
      if (action.status === "Dilayani") {
        if (original!.status !== "Menunggu")
          denied("Urutan status tidak valid.", 409)
        core({ type: "visit.verify", id: action.id })
        core({ type: "queue.transition", id: action.id, status: "Dipanggil" })
        core({ type: "queue.transition", id: action.id, status: "Dilayani" })
      } else if (action.status === "Selesai") {
        core({ type: "record.finalize", id: action.id })
        core({ type: "queue.transition", id: action.id, status: "Selesai" })
      } else if (action.status)
        denied("Gunakan perintah antrean untuk status ini.", 422)
      if (action.paid !== undefined) {
        if (action.paid !== true)
          denied("Gunakan refund untuk membatalkan pembayaran.", 422)
        const visit = next.attempt.core.visits.find((v) => v.id === action.id)!
        const total = visit.charges
          .filter((c) => !c.cancelled)
          .reduce((n, c) => n + c.amount * c.quantity, 0)
        core({
          type: "payment.record",
          id: action.id,
          kind: "Pembayaran",
          amount: total,
          reason: "Pelunasan dummy",
        })
        description = "Pembayaran dummy dicatat"
      }
      break
    }
    case "submit":
      if (
        !editable ||
        !state.attempt.visits.length ||
        (participant(state).actor === "Kasir" &&
          !state.attempt.visits
            .filter((v) => !["Dibatalkan", "Tidak datang"].includes(v.status))
            .every((v) => v.paid))
      )
        denied(
          "Hasil belum dapat diserahkan. Periksa tugas dan status transaksi.",
          409
        )
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
    case "reset": {
      if (!isTeacher || state.sessions[0].status === "Ditutup") denied()
      reason(action.reason)
      const scenario = state.scenarios.find(
        (s) => s.id === state.sessions[0].scenarioId
      )!
      next = {
        ...state,
        history: [...state.history, structuredClone(state.attempt)],
        attempt: {
          number: state.attempt.number + 1,
          status: "Belum dimulai",
          deadline: null,
          visits: [],
          core: structuredClone(
            scenario.initialData ?? createCoreState(state.hospitalMaster)
          ),
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
    }
    case "review": {
      if (!isTeacher) denied()
      reason(action.review?.comment)
      const review = state.reviews.find(
        (r) =>
          r.participantId === action.review.participantId &&
          r.attempt === action.review.attempt
      )
      if (
        !review ||
        !["Menunggu penilaian", "Dinilai", "Dikembalikan"].includes(
          action.review.status
        ) ||
        typeof action.review.published !== "boolean"
      )
        denied("Hasil penilaian tidak ditemukan atau tidak valid.", 422)
      object = action.review.participantId
      before = review!.status
      after = `${action.review.status}: ${action.review.comment}`
      next = {
        ...state,
        reviews: state.reviews.map((r) =>
          r === review
            ? {
                ...r,
                comment: action.review.comment,
                status: action.review.status,
                published: action.review.published,
              }
            : r
        ),
      }
      description = "Penilaian diperbarui"
      break
    }
    case "observe":
      if (!isTeacher) denied()
      reason(action.text)
      next = { ...state, observations: [action.text, ...state.observations] }
      after = action.text
      description = "Observasi disimpan"
      break
    case "master":
      if (!action.row) denied("Data master tidak valid.", 400)
      core({
        type: "master.unit",
        name: action.row.name,
        detail: action.row.detail,
      })
      break
    default:
      denied("Tindakan tidak dikenal.", 400)
  }
  if (next === state) return state
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
          ? participant(state).actor
          : state.role,
    action: description,
    object,
    before,
    after,
    session: next.activeSessionId,
    attempt:
      action.type === "select-session"
        ? next.attempt.number
        : state.attempt.number,
    feature,
    source: "API platform demo",
  }
  return {
    ...next,
    revision: state.revision + 1,
    audit: [event, ...state.audit],
    sessionData: { ...next.sessionData, [next.activeSessionId]: slice(next) },
  }
}
