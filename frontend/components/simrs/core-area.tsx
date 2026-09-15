"use client"
import { canReadCore } from "@/lib/platform/core-access"
import { useEffect, useState } from "react"
import { CoreWorkspace } from "@/components/core/workspace"
import { EmptyState, Notice, PageHeading } from "@/components/platform/shared"
import { coreModules, type CoreModule } from "@/lib/core/navigation"
import { createCoreState } from "@/lib/core/catalog"
import { corePrincipal } from "@/lib/simrs/core-adapter"
import { lockReason, participant } from "@/lib/simrs/store"
import { useDemo } from "./provider"

/** Adapter: only this layer adds run constraints to reusable operational screens. */
export function CoreArea({
  module,
  embedded = false,
}: {
  module: CoreModule
  embedded?: boolean
}) {
  const { state, dispatch, pending } = useDemo()
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  if (!canReadCore(state.role, participant(state).actor, module))
    return (
      <EmptyState
        title="Akses tidak diizinkan"
        description="Modul ini tidak tersedia untuk peran Anda pada sesi aktif."
      />
    )
  const master = module === "master"
  const data =
    state.role === "Administrator"
      ? createCoreState(state.hospitalMaster)
      : master
        ? { ...state.attempt.core, master: state.hospitalMaster }
        : state.attempt.core
  const locked =
    state.role === "Mahasiswa"
      ? lockReason(state, now)
      : state.role === "Dosen"
        ? "Mode observasi. Dosen dapat meninjau data; transaksi dikerjakan mahasiswa sesuai penugasan."
        : master
          ? ""
          : "Mode baca. Administrator mengelola master rumah sakit."
  return (
    <div className="page-stack">
      {!embedded && (
        <>
          <PageHeading
            title={coreModules[module]}
            description={
              state.role === "Administrator"
                ? `${state.hospitalMaster.hospital} · SIMRS Inti · DATA SINTETIS`
                : `SIMRS Inti · ${state.activeSessionId} · Percobaan ${state.attempt.number} · DATA SINTETIS`
            }
          />
          {locked && <Notice title={locked} />}
        </>
      )}
      <CoreWorkspace
        key={`${module}-${state.activeSessionId}-${state.attempt.number}-${state.participantId}`}
        module={module}
        data={data}
        principal={corePrincipal(state)}
        locked={locked}
        pending={pending}
        execute={(command) =>
          dispatch({
            type: "core",
            command,
            sessionId: state.activeSessionId,
            attemptNumber: state.attempt.number,
          })
        }
      />
    </div>
  )
}
