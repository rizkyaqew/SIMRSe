"use client"
import { canReadCore } from "@/lib/platform/core-access"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CoreTestingGuide } from "./core-testing-guide"
import { CoreInputAccess } from "./core-input-access"
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
  const query = useSearchParams()
  const selection = {
    visit: query.get("visit") ?? undefined,
    patient: query.get("patient") ?? undefined,
    appointment: query.get("appointment") ?? undefined,
  }
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
          <CoreInputAccess module={module} locked={locked} />
        </>
      )}
      {master && (
        <Notice title="Master menjadi dasar skenario berikutnya">
          Perubahan digunakan saat skenario baru dipublikasikan. Skenario
          terpublikasi dan sesi yang sudah dibuat tetap memakai data awalnya;
          reset tidak mengambil perubahan master terbaru.
        </Notice>
      )}
      <CoreWorkspace
        key={`${module}-${state.role}-${state.activeSessionId}-${state.attempt.number}-${state.participantId}-${query.toString()}`}
        module={module}
        data={data}
        principal={corePrincipal(state)}
        locked={locked}
        pending={pending}
        selection={selection}
        activity={state.audit.filter(
          (a) =>
            a.session === state.activeSessionId &&
            a.attempt === state.attempt.number
        )}
        linkTo={(section, target = {}) => {
          if (!canReadCore(state.role, participant(state).actor, section))
            return undefined
          const params = new URLSearchParams()
          Object.entries(target).forEach(([key, value]) => {
            if (value) params.set(key, value)
          })
          return `/simrs/${section === "ringkasan" ? "" : section}${params.size ? `?${params}` : ""}`
        }}
        execute={(command) =>
          dispatch({
            type: "core",
            command,
            sessionId: state.activeSessionId,
            attemptNumber: state.attempt.number,
          })
        }
      />
      {!embedded &&
        (module === "ringkasan" ||
          module === "laporan" ||
          module === "master") && <CoreTestingGuide />}
    </div>
  )
}
