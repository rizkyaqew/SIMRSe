"use client"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { accounts } from "@/lib/platform/accounts"
import { useRouter } from "next/navigation"
import { initialState, type Action, type DemoState } from "@/lib/simrs/store"
import { Notice } from "./ui"
interface DemoContextValue {
  state: DemoState
  dispatch: (action: Action) => Promise<boolean>
  pending: boolean
  refresh: () => Promise<void>
}
const DemoContext = createContext<DemoContextValue | null>(null)
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<DemoState>({
    ...initialState,
    signedIn: false,
  })
  const [ready, setReady] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("")
  const running = useRef(false)
  const readVersion = useRef(0)
  const accountRefreshQueued = useRef(false)
  const accountChannel = useRef<BroadcastChannel | null>(null)
  const lastIdentity = useRef<string | null>(null)
  useEffect(() => {
    if (!ready) return
    const identity = `${state.signedIn}-${state.role}-${state.participantId}`
    // Re-evaluate server-rendered page guards when another tab changes the account.
    if (lastIdentity.current !== null && lastIdentity.current !== identity)
      router.refresh()
    lastIdentity.current = identity
  }, [ready, state.signedIn, state.role, state.participantId, router])
  const refresh = useCallback(async (force = false, accountOnly = false) => {
    if (running.current && !force) {
      accountRefreshQueued.current = true
      return
    }
    const version = ++readVersion.current
    return fetch("/api/workspace", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json()
        if (version !== readVersion.current) return
        if (response.status === 401 || response.status === 403) {
          setState({ ...initialState, signedIn: false })
          if (response.status === 403) setError(payload.error)
          return
        }
        if (!response.ok) throw new Error(payload.error)
        // A focus check must not replace an unsaved form merely because another tab saved a transaction.
        setState((current) =>
          accountOnly &&
          current.signedIn === payload.state.signedIn &&
          current.role === payload.state.role &&
          current.participantId === payload.state.participantId
            ? current
            : payload.state
        )
        setError("")
      })
      .catch(() => {
        if (version !== readVersion.current) return
        setError(
          "Data belum dapat dimuat. Periksa koneksi ke server demo, lalu coba kembali."
        )
      })
      .finally(() => {
        if (version === readVersion.current) setReady(true)
      })
  }, [])
  useEffect(() => {
    void refresh()
  }, [refresh])
  useEffect(() => {
    const syncAccount = () => {
      void refresh(false, true)
    }
    const visible = () => {
      if (document.visibilityState === "visible") syncAccount()
    }
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("simrs-demo-account")
        : null
    accountChannel.current = channel
    if (channel) channel.onmessage = syncAccount
    window.addEventListener("focus", syncAccount)
    document.addEventListener("visibilitychange", visible)
    return () => {
      channel?.close()
      accountChannel.current = null
      window.removeEventListener("focus", syncAccount)
      document.removeEventListener("visibilitychange", visible)
    }
  }, [refresh])
  async function dispatch(action: Action) {
    if (running.current) return false
    running.current = true
    // Ignore reads started before this mutation so an old account cannot overwrite its response.
    readVersion.current++
    setPending(true)
    setError("")
    try {
      let url = "/api/workspace",
        method = "POST",
        body: unknown = {
          action,
          revision: state.revision,
          sessionId: state.activeSessionId,
          attemptNumber: state.attempt.number,
        }
      if (action.type === "login") {
        url = "/api/auth"
        body = {
          accountId: accounts.find(
            (a) =>
              a.role === action.role &&
              (a.role !== "Mahasiswa" ||
                a.participantId === action.participantId)
          )?.id,
        }
      }
      if (action.type === "logout") {
        url = "/api/auth"
        method = "DELETE"
        body = {}
      }
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = await response.json()
      if (!response.ok) {
        if (response.status === 401)
          setState({ ...initialState, signedIn: false })
        if ([401, 403, 409].includes(response.status)) await refresh(true)
        throw new Error(payload.error || "Perubahan belum tersimpan.")
      }
      if (action.type === "logout")
        setState({ ...initialState, signedIn: false })
      else setState(payload.state)
      if (action.type === "login" || action.type === "logout")
        accountChannel.current?.postMessage("account-changed")
      return true
    } catch (error) {
      setError(
        error instanceof TypeError
          ? "Server tidak dapat dijangkau. Perubahan belum tersimpan. Periksa koneksi, lalu coba kembali."
          : error instanceof Error
            ? error.message
            : "Server tidak dapat dijangkau. Perubahan belum tersimpan."
      )
      return false
    } finally {
      running.current = false
      setPending(false)
      if (accountRefreshQueued.current) {
        accountRefreshQueued.current = false
        void refresh(false, true)
      }
    }
  }
  if (!ready)
    return (
      <div
        className="simrs-ui page-stack p-8"
        role="status"
        aria-label="Memuat ruang pembelajaran"
      >
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  return (
    <DemoContext value={{ state, dispatch, pending, refresh }}>
      <div aria-busy={pending}>
        {error && (
          <div className="simrs-ui server-notice">
            <Notice title="Perubahan/data perlu diperiksa" danger>
              {error}
              <Button variant="outline" onClick={() => void refresh()}>
                Muat ulang data
              </Button>
            </Notice>
          </div>
        )}
        {pending && (
          <div className="simrs-ui save-status" role="status">
            Memproses perubahan…
          </div>
        )}
        {children}
      </div>
    </DemoContext>
  )
}
export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error("DemoProvider required")
  return context
}
