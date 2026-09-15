import { canReadCore } from "../platform/core-access"
import { randomBytes } from "node:crypto"
import { accounts } from "../platform/accounts"
import type { Account } from "../platform/types"
import { DomainError } from "../core/validation"
import { emptyRecord } from "../core/catalog"
import type { CoreState } from "../core/types"
import { coreModules, type CoreModule } from "../core/navigation"
import {
  initialState,
  participant,
  transition,
  type Action,
  type DemoState,
} from "../simrs/store"
import { canAccess } from "../simrs/navigation"

export const authCookie = "simrs_demo_auth"
export const workspaceCookie = "simrs_demo_workspace"
const lifetime = 8 * 60 * 60 * 1000
type LoginSession = {
  accountId: string
  workspaceId: string
  expiresAt: number
}
export interface Mutation {
  action: Action
  revision: number
  sessionId: string
  attemptNumber: number
}
/** Server-only owner of demo state. Separate browser workspaces are never looked up by client-supplied IDs. */
export class DemoServer {
  sessions = new Map<string, LoginSession>()
  workspaces = new Map<string, { state: DemoState; expiresAt: number }>()
  constructor(
    public directory: Account[] = accounts,
    storage?: Pick<DemoServer, "sessions" | "workspaces">
  ) {
    if (storage) {
      this.sessions = storage.sessions
      this.workspaces = storage.workspaces
    }
  }
  login(accountId: string, workspaceId: string | undefined, now = Date.now()) {
    this.cleanup(now)
    const account = this.directory.find((a) => a.id === accountId)
    if (!account || !account.active)
      throw new DomainError(
        "Akun tidak ditemukan atau telah dinonaktifkan.",
        403
      )
    const existing = workspaceId ? this.workspaces.get(workspaceId) : undefined
    const id = existing ? workspaceId! : randomBytes(32).toString("hex")
    const workspace = existing ?? {
      state: structuredClone(initialState),
      expiresAt: now + lifetime,
    }
    workspace.state = transition(
      workspace.state,
      {
        type: "login",
        role: account.role,
        participantId: account.participantId,
      },
      now,
      true
    )
    workspace.expiresAt = now + lifetime
    this.workspaces.set(id, workspace)
    const token = randomBytes(32).toString("hex")
    this.sessions.set(token, {
      accountId,
      workspaceId: id,
      expiresAt: now + lifetime,
    })
    return { token, workspaceId: id, state: this.read(token, now) }
  }
  authenticate(token: string | undefined, now = Date.now()) {
    const session = token ? this.sessions.get(token) : undefined
    if (!session || session.expiresAt <= now)
      throw new DomainError(
        "Sesi masuk berakhir. Pilih akun demo kembali.",
        401
      )
    const account = this.directory.find((a) => a.id === session.accountId)
    if (!account?.active)
      throw new DomainError("Akun telah dinonaktifkan.", 403)
    const workspace = this.workspaces.get(session.workspaceId)
    if (!workspace || workspace.expiresAt <= now)
      throw new DomainError("Lingkungan demo berakhir. Masuk kembali.", 401)
    return { session, account, workspace }
  }
  private project(state: DemoState, account: Account): DemoState {
    const own = {
      ...state,
      role: account.role,
      participantId: account.participantId,
      signedIn: true,
    }
    if (account.role !== "Mahasiswa") return structuredClone(own)
    if (!own.participants.some((p) => p.id === account.participantId))
      throw new DomainError("Anda tidak ditugaskan pada sesi ini.", 403)
    // Keep evidence/feedback private. Only the active run's transactions leave the server.
    const reviews = own.reviews.filter(
      (r) => r.participantId === account.participantId && r.published
    )
    const actor = participant(own).actor,
      clinical = ["Dokter", "Petugas Rekam Medis"].includes(actor),
      financial = actor === "Kasir"
    const redactCore = (core: CoreState): CoreState => ({
      ...core,
      visits: core.visits.map((v) => ({
        ...v,
        ...(!clinical
          ? {
              record: {
                data: emptyRecord,
                versions: [],
                finalized: v.record.finalized,
              },
            }
          : {}),
        ...(!financial ? { charges: [], payments: [] } : {}),
      })),
    })
    const redactAttempt = (attempt: DemoState["attempt"]) => ({
      ...attempt,
      core: redactCore(attempt.core),
      visits: attempt.visits.map((v) => ({
        ...v,
        note: clinical ? v.note : "",
      })),
    })
    return structuredClone({
      ...own,
      reviews,
      observations: [],
      attempt: redactAttempt(own.attempt),
      history: own.history.map(redactAttempt),
      scenarios: own.scenarios
        .filter((s) => s.status === "Dipublikasikan")
        .map((s) => ({
          ...s,
          initialData: s.initialData ? redactCore(s.initialData) : undefined,
        })),
      sessionData: {},
      audit: own.audit
        .filter((a) => a.user === account.name)
        .map((a) => ({
          ...a,
          before: "Perubahan tercatat pada audit dosen.",
          after: a.action,
        })),
      sessions: own.sessions.filter((s) =>
        state.sessionData[s.id]?.participants.some(
          (p) => p.id === account.participantId
        )
      ),
    })
  }
  read(token: string | undefined, now = Date.now()) {
    const { account, workspace } = this.authenticate(token, now)
    return this.project(workspace.state, account)
  }
  authorizePage(token: string | undefined, path: string, now = Date.now()) {
    const state = this.read(token, now)
    if (path.startsWith("simrs")) {
      const section = (path.split("/")[1] || "ringkasan") as CoreModule
      if (
        !(section in coreModules) ||
        !canReadCore(state.role, participant(state).actor, section)
      )
        throw new DomainError("Akses tidak diizinkan untuk modul ini.", 403)
    } else if (!canAccess(state.role, path))
      throw new DomainError("Akses tidak diizinkan untuk halaman ini.", 403)
    return state
  }
  mutate(token: string | undefined, input: Mutation, now = Date.now()) {
    const { account, workspace } = this.authenticate(token, now)
    if (
      !input?.action ||
      typeof input.action.type !== "string" ||
      ["login", "logout"].includes(input.action.type)
    )
      throw new DomainError("Perintah tidak valid.", 400)
    const state = {
      ...workspace.state,
      role: account.role,
      participantId: account.participantId,
      signedIn: true,
    }
    if (
      account.role === "Mahasiswa" &&
      !state.participants.some((p) => p.id === account.participantId)
    )
      throw new DomainError("Peserta tidak ditugaskan pada sesi ini.", 403)
    if (
      input.revision !== state.revision ||
      input.sessionId !== state.activeSessionId ||
      input.attemptNumber !== state.attempt.number
    )
      throw new DomainError(
        "Data berubah di tab atau sesi lain. Muat ulang data, periksa formulir, lalu simpan kembali.",
        409
      )
    // No caller-controlled role, capability, timestamp, transaction state, or audit values are trusted.
    workspace.state = transition(state, input.action, now, true)
    return this.project(workspace.state, account)
  }
  logout(token: string | undefined, now = Date.now()) {
    if (!token) return
    try {
      const { account, workspace } = this.authenticate(token, now)
      workspace.state = transition(
        {
          ...workspace.state,
          role: account.role,
          participantId: account.participantId,
        },
        { type: "logout" },
        now,
        true
      )
    } catch {
      /* Expired sessions are already logged out. */
    }
    this.sessions.delete(token)
  }
  cleanup(now: number) {
    for (const [id, s] of this.sessions)
      if (s.expiresAt <= now) this.sessions.delete(id)
    for (const [id, w] of this.workspaces)
      if (w.expiresAt <= now) this.workspaces.delete(id)
  }
}
const scope = globalThis as typeof globalThis & {
  simrsDemoServerV1?: DemoServer
}
// Preserve data across development reloads without retaining obsolete class methods.
export const demoServer = new DemoServer(accounts, scope.simrsDemoServerV1)
scope.simrsDemoServerV1 = demoServer
