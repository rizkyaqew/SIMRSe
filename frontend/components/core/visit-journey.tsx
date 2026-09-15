"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ActionLink,
  DataTable,
  EmptyState,
  Notice,
  Panel,
  SelectControl,
  Status,
} from "@/components/platform/shared"
import { journeyText, visitJourney } from "@/lib/core/journey"
import { formatDate, formatTime } from "@/lib/platform/format"
import type { Visit } from "@/lib/core/types"
import type { WorkspaceProps } from "./workspace"

function JourneyDetail({ visit, ...props }: WorkspaceProps & { visit: Visit }) {
  const [showResult, setShowResult] = useState(false)
  const patient = props.data.patients.find((p) => p.id === visit.patientId)
  const activity =
    props.activity?.filter((a) =>
      [visit.id, visit.patientId, visit.appointmentId].includes(a.object)
    ) ?? []
  const appointment = props.data.appointments.find(
    (a) => a.id === visit.appointmentId
  )
  function download() {
    const url = URL.createObjectURL(
      new Blob([journeyText(props.data, visit, props.principal)], {
        type: "text/plain;charset=utf-8",
      })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `SIMULASI-alur-${visit.id}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Allow the browser to consume the object URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <div className="page-stack">
      <Notice title={`${patient?.rm} · ${patient?.name}`}>
        {visit.id} · {visit.queue} · {visit.arrival}
        {appointment
          ? ` · ${appointment.id}, ${formatDate(appointment.date)} ${appointment.time} WIB`
          : ""}
        . Tersimpan {formatDate(visit.savedAt)}, {formatTime(visit.savedAt)}{" "}
        WIB.
      </Notice>
      <ol className="visit-journey" aria-label="Alur kunjungan">
        {visitJourney(visit, props.principal).map((step, i) => (
          <li key={step.title}>
            <span className="journey-number" aria-hidden="true">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="row-actions">
                <strong>{step.title}</strong>
                <Status>{step.status}</Status>
              </div>
              <p>{step.detail}</p>
              {props.linkTo?.(step.module, {
                visit: visit.id,
                patient: visit.patientId,
              }) && (
                <ActionLink
                  href={props.linkTo(step.module, {
                    visit: visit.id,
                    patient: visit.patientId,
                  })!}
                >
                  Buka {step.title.toLowerCase()}
                </ActionLink>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="form-actions">
        <Button variant="outline" onClick={() => setShowResult(!showResult)}>
          {showResult
            ? "Tutup rincian hasil input"
            : "Lihat rincian hasil input"}
        </Button>
        <Button variant="outline" onClick={download}>
          Unduh hasil kunjungan
        </Button>
      </div>
      {showResult && (
        <Panel
          title="Rincian hasil input tersimpan"
          description="DOKUMEN SIMULASI · Data sesuai hak akses akun."
        >
          <pre className="font-sans text-sm leading-7 break-words whitespace-pre-wrap">
            {journeyText(props.data, visit, props.principal)}
          </pre>
        </Panel>
      )}
      <Panel
        title="Aktivitas tercatat"
        description="Aktivitas ditampilkan sesuai hak akses akun pada lingkungan yang sedang dibuka."
      >
        <DataTable
          rows={activity}
          search={(a) => `${a.action} ${a.user} ${a.object}`}
          columns={[
            {
              label: "Waktu",
              render: (a) => `${formatDate(a.time)} ${formatTime(a.time)} WIB`,
            },
            { label: "Pelaksana", render: (a) => a.user },
            { label: "Tindakan", render: (a) => a.action },
          ]}
        />
      </Panel>
    </div>
  )
}
export function JourneyButton(props: WorkspaceProps & { visit: Visit }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Telusuri alur
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="simrs-ui wide-dialog">
          <DialogHeader>
            <DialogTitle>Alur kunjungan · {props.visit.id}</DialogTitle>
            <DialogDescription>
              Hubungan antarform dan hasil transaksi yang sudah tersimpan. DATA
              SINTETIS.
            </DialogDescription>
          </DialogHeader>
          <JourneyDetail {...props} />
        </DialogContent>
      </Dialog>
    </>
  )
}
export function JourneyExplorer(props: WorkspaceProps) {
  const [selected, setSelected] = useState(props.selection?.visit ?? "")
  const visit =
    props.data.visits.find((v) => v.id === selected) ?? props.data.visits.at(-1)
  return (
    <Panel
      title="Penelusuran alur pelayanan"
      description="Pilih kunjungan untuk melihat hasil input dari pendaftaran sampai pembayaran dan aktivitas yang tercatat."
    >
      {visit ? (
        <div className="page-stack">
          <SelectControl
            label="Kunjungan yang ditelusuri"
            value={visit.id}
            options={props.data.visits.map((v) => ({
              value: v.id,
              label: `${v.id} · ${props.data.patients.find((p) => p.id === v.patientId)?.name} · ${v.status}`,
            }))}
            onChange={(e) => setSelected(e.target.value)}
          />
          <JourneyDetail {...props} visit={visit} />
        </div>
      ) : (
        <EmptyState
          title="Belum ada kunjungan untuk ditelusuri"
          description="Simpan pendaftaran terlebih dahulu. Kunjungan akan muncul di sini setelah tersimpan."
        />
      )}
    </Panel>
  )
}
