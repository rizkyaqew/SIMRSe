"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ActionLink,
  Confirm,
  Notice,
  Panel,
  Status,
  PageHeading,
} from "@/components/platform/shared"
import { CoreArea } from "./core-area"
import { useDemo } from "./provider"
import { actorTasks, patientSeed } from "@/lib/simrs/data"
import { lockReason, participant } from "@/lib/simrs/store"
import type { CoreModule } from "@/lib/core/navigation"
import { canReadCore } from "@/lib/platform/core-access"
export function Simulation({
  transactions = false,
}: {
  transactions?: boolean
}) {
  const { state, dispatch, pending } = useDemo(),
    person = participant(state)
  const [now, setNow] = useState(Date.now),
    [submit, setSubmit] = useState(false)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const reason = lockReason(state, now)
  const sections: { key: CoreModule; label: string }[] = [
    { key: "pendaftaran", label: "Pendaftaran" },
    { key: "appointment", label: "Appointment" },
    { key: "antrean", label: "Antrean" },
    { key: "rekam-medis", label: "Rawat jalan & rekam medis" },
    { key: "kasir", label: "Billing & kasir" },
  ].filter((s) =>
    canReadCore(state.role, person.actor, s.key as CoreModule)
  ) as { key: CoreModule; label: string }[]
  const defaultTab = sections[0]?.key ?? "ringkasan"
  const hasWork =
    state.attempt.visits.length > 0 &&
    (person.actor !== "Kasir" ||
      state.attempt.visits
        .filter((v) => !["Dibatalkan", "Tidak datang"].includes(v.status))
        .every((v) => v.paid))
  return (
    <div className="page-stack">
      <PageHeading
        title={
          transactions ? "Transaksi simulasi" : "Ruang simulasi rawat jalan"
        }
        description={`${state.activeSessionId} · Percobaan ${state.attempt.number} · ${person.actor} · DATA SINTETIS`}
        action={
          !transactions && (
            <Button
              disabled={pending || !!reason || !hasWork}
              onClick={() => setSubmit(true)}
            >
              Serahkan hasil praktikum
            </Button>
          )
        }
      />
      {reason && (
        <Notice title={reason} danger={reason.includes("berakhir")}>
          <ActionLink href="/sesi-aktif">Buka briefing</ActionLink>
        </Notice>
      )}
      {transactions ? (
        <CoreArea module="laporan" embedded />
      ) : (
        <div className="workspace-grid">
          <div className="page-stack">
            {sections.length ? (
              <Tabs defaultValue={defaultTab}>
                <TabsList aria-label="Tahap pelayanan">
                  {sections.map((s) => (
                    <TabsTrigger key={s.key} value={s.key}>
                      {s.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {sections.map((s) => (
                  <TabsContent key={s.key} value={s.key} keepMounted>
                    <CoreArea module={s.key} embedded />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <CoreArea module="ringkasan" embedded />
            )}
          </div>
          <div className="page-stack">
            <Panel
              title="Tugas sesuai peran"
              action={
                <Status>
                  {state.submitted.includes(person.id)
                    ? "Terkunci"
                    : state.attempt.status}
                </Status>
              }
            >
              <ol className="task-list">
                {actorTasks[person.actor].map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ol>
            </Panel>
            <Panel
              title="Data pasien skenario"
              description="Identitas fiktif untuk latihan."
            >
              <dl className="summary-list">
                <div>
                  <dt>Nama</dt>
                  <dd>{patientSeed.name}</dd>
                </div>
                <div>
                  <dt>Kode identitas</dt>
                  <dd>{patientSeed.identity}</dd>
                </div>
                <div>
                  <dt>Poli / penjamin</dt>
                  <dd>
                    {patientSeed.unit} · {patientSeed.payer}
                  </dd>
                </div>
              </dl>
            </Panel>
            <Notice title="Aktivitas Anda tercatat">
              Transaksi diproses oleh SIMRS Inti. Sesi, penugasan, dan hasil
              belajar tetap terhubung untuk ditinjau dosen.
            </Notice>
            <ActionLink href="/simrs">Buka area SIMRS Inti</ActionLink>
          </div>
        </div>
      )}
      <Confirm
        open={submit}
        onClose={() => setSubmit(false)}
        title="Serahkan hasil praktikum?"
        description="Hasil Anda tersedia untuk penilaian. Transaksi akun Anda terkunci; hasil dan audit tetap tersimpan untuk percobaan ini."
        label="Ya, serahkan hasil"
        onConfirm={() => dispatch({ type: "submit" })}
      />
    </div>
  )
}
