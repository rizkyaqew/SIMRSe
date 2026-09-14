"use client"
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useSyncExternalStore,
} from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  initialState,
  transition,
  type Action,
  type DemoState,
} from "@/lib/simrs/store"
const DemoContext = createContext<{
  state: DemoState
  dispatch: (action: Action) => void
} | null>(null)
const subscribe = () => () => {}
const accountKey = "simrs-e-demo-account-v1"
function restoreAccount(state: DemoState): DemoState {
  if (typeof window === "undefined") return state
  try {
    const stored = JSON.parse(sessionStorage.getItem(accountKey) ?? "null")
    if (
      stored &&
      ["Dosen", "Mahasiswa", "Administrator"].includes(stored.role) &&
      typeof stored.signedIn === "boolean" &&
      state.participants.some((p) => p.id === stored.participantId)
    ) {
      return {
        ...state,
        role: stored.role,
        signedIn: stored.signedIn,
        participantId: stored.participantId,
      }
    }
  } catch {
    /* An unavailable or stale browser store falls back to the demo account. */
  }
  return state
}
export function DemoProvider({ children }: { children: React.ReactNode }) {
  // In-memory demo deliberately survives route changes, but never persists patient-like data.
  const [state, dispatch] = useReducer(
    (state: DemoState, action: Action) => transition(state, action, Date.now()),
    initialState,
    restoreAccount
  )
  // Persist only demo identity, never patient/transaction data. This keeps URL guards stable on reload.
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  useEffect(() => {
    try {
      sessionStorage.setItem(
        accountKey,
        JSON.stringify({
          role: state.role,
          signedIn: state.signedIn,
          participantId: state.participantId,
        })
      )
    } catch {
      /* The demo remains usable when storage is disabled. */
    }
  }, [state.role, state.signedIn, state.participantId])
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
  return <DemoContext value={{ state, dispatch }}>{children}</DemoContext>
}
export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error("DemoProvider required")
  return context
}
