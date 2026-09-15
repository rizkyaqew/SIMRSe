"use client"
import { ActionLink, Notice, Panel, Status } from "@/components/platform/shared"
import { coreInputEntry } from "@/lib/simrs/core-entry"
import { participant } from "@/lib/simrs/store"
import type { CoreModule } from "@/lib/core/navigation"
import { useDemo } from "./provider"

export function CoreInputAccess({
  module,
  locked,
}: {
  module: CoreModule
  locked: string
}) {
  const { state } = useDemo()
  const person = participant(state)
  const entry = coreInputEntry(state, module)
  if (module === "ringkasan")
    return (
      <Panel
        title="Mulai mengisi form SIMRS Inti"
        description={`Akun aktif: ${state.role === "Mahasiswa" ? `${person.name} · ${person.actor}` : state.role}. Pilih pekerjaan; akun demo penginput akan dipilihkan pada halaman masuk.`}
      >
        <div className="row-actions">
          {(["pendaftaran", "rekam-medis", "kasir", "master"] as const).map(
            (key) => {
              const item = coreInputEntry(state, key)!
              const href = item.canWrite
                ? key !== "master" && locked
                  ? item.briefingPath
                  : item.path
                : item.loginPath
              return href ? (
                <ActionLink
                  key={key}
                  href={href}
                  primary={key === "pendaftaran"}
                >
                  Isi {item.title.toLowerCase()}
                </ActionLink>
              ) : null
            }
          )}
        </div>
      </Panel>
    )
  if (!entry) return locked ? <Notice title={locked} /> : null
  if (!entry.canWrite)
    return (
      <Notice
        title={`Form hanya dapat dibaca oleh akun ${state.role === "Mahasiswa" ? person.actor : state.role}`}
      >
        <div className="page-stack">
          <p>
            Untuk mengisi {entry.title.toLowerCase()}, masuk dengan akun{" "}
            {entry.actor ?? "Administrator"}. Data sesi dan transaksi tersimpan
            tetap dipertahankan.
          </p>
          {entry.loginPath ? (
            <ActionLink href={entry.loginPath} primary>
              Gunakan akun penginput
            </ActionLink>
          ) : (
            <p>
              Belum ada akun aktif untuk peran ini. Dosen perlu memeriksa
              penugasan sesi.
            </p>
          )}
        </div>
      </Notice>
    )
  if (locked)
    return (
      <Notice title={locked}>
        <div className="page-stack">
          <p>
            Form akan aktif setelah prasyarat sesi terpenuhi. Hasil yang sudah
            diserahkan tetap terkunci.
          </p>
          <ActionLink href={entry.briefingPath}>
            Buka briefing / pilih sesi
          </ActionLink>
        </div>
      </Notice>
    )
  return (
    <div className="row-actions">
      <Status>Input aktif</Status>
      <span className="text-sm text-muted-foreground">
        {state.role === "Mahasiswa"
          ? `${person.name} · ${person.actor}`
          : "Administrator"}
      </span>
      {module === "billing" && (
        <ActionLink href={entry.path}>Isi pembayaran di kasir</ActionLink>
      )}
    </div>
  )
}
