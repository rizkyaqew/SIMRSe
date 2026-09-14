"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup } from "@/components/ui/field"
import { useDemo } from "./provider"
import { PageHeading } from "./dashboard"
import {
  Confirm,
  DataTable,
  EmptyState,
  FormField,
  Notice,
  Panel,
  SelectControl,
  Status,
  useUnsavedChanges,
} from "./ui"
import {
  academic,
  formatDate,
  formatTime,
  rupiah,
  tariffs,
} from "@/lib/simrs/data"
import type { AuditEntry, Review } from "@/lib/simrs/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function Evaluation({ feedback = false }: { feedback?: boolean }) {
  const { state, dispatch } = useDemo()
  const [selected, setSelected] = useState<Review | null>(null)
  const [comment, setComment] = useState("")
  const [confirm, setConfirm] = useState<"publish" | "return" | null>(null)
  const [message, setMessage] = useState("")
  const rows = state.reviews
    .filter(
      (r) =>
        !feedback || (r.participantId === state.participantId && r.published)
    )
    .map((r) => ({ ...r, id: `${r.participantId}-${r.attempt}` }))
  return (
    <div className="page-stack">
      <PageHeading
        title={feedback ? "Umpan balik dosen" : "Penilaian praktikum"}
        description={
          feedback
            ? "Pelajari hasil tinjauan yang sudah dibuka untuk Anda."
            : "Tinjau ketelitian data, urutan proses, dan hasil praktikum peserta."
        }
      />
      {message && <Notice title={message} />}
      <Panel
        title={feedback ? "Hasil tinjauan Anda" : "Hasil yang diserahkan"}
        description="Umpan balik deskriptif digunakan tanpa mengasumsikan skala atau bobot nilai yang belum ditetapkan."
      >
        {rows.length ? (
          <DataTable
            rows={rows}
            search={(r) =>
              `${r.participantId} ${state.participants.find((p) => p.id === r.participantId)?.name}`
            }
            placeholder="Cari peserta untuk penilaian..."
            columns={[
              {
                label: "Mahasiswa",
                render: (r) => (
                  <strong>
                    {
                      state.participants.find((p) => p.id === r.participantId)
                        ?.name
                    }
                  </strong>
                ),
              },
              { label: "Percobaan", render: (r) => r.attempt },
              { label: "Status", render: (r) => <Status>{r.status}</Status> },
              {
                label: feedback ? "Umpan balik" : "Publikasi",
                render: (r) =>
                  feedback
                    ? r.comment
                    : r.published
                      ? "Dibuka untuk mahasiswa"
                      : "Belum dibuka",
              },
              ...(!feedback
                ? [
                    {
                      label: "Aksi",
                      render: (r: Review) => (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelected(r)
                            setComment(r.comment)
                          }}
                        >
                          Tinjau hasil
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        ) : (
          <EmptyState
            title="Umpan balik belum tersedia"
            description="Umpan balik akan muncul setelah dosen meninjau dan membuka hasil Anda."
          />
        )}
      </Panel>
      <Dialog
        open={!!selected}
        onOpenChange={(value) => {
          if (!value) setSelected(null)
        }}
      >
        <DialogContent className="simrs-ui">
          <DialogHeader>
            <DialogTitle>Tinjau hasil praktikum</DialogTitle>
            <DialogDescription>
              {
                state.participants.find((p) => p.id === selected?.participantId)
                  ?.name
              }{" "}
              · SESI-001
            </DialogDescription>
          </DialogHeader>
          <p>
            Tinjau ketepatan identitas, kelengkapan pencatatan, urutan
            pelayanan, dan serah-terima antarperan melalui monitor aktivitas.
          </p>
          <FormField id="review-comment" label="Umpan balik dosen" required>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tuliskan bukti yang ditinjau dan hal yang perlu dipertahankan atau diperbaiki."
            />
          </FormField>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!comment.trim()}
              onClick={() => {
                if (!selected) return
                dispatch({
                  type: "review",
                  review: {
                    ...selected,
                    comment,
                    status: "Dinilai",
                    published: false,
                  },
                })
                setSelected(null)
                setMessage("Penilaian tersimpan; umpan balik belum dibuka.")
              }}
            >
              Simpan penilaian
            </Button>
            <Button
              variant="outline"
              disabled={!comment.trim()}
              onClick={() => setConfirm("publish")}
            >
              Simpan & buka hasil
            </Button>
            <Button
              variant="destructive"
              disabled={!comment.trim()}
              onClick={() => setConfirm("return")}
            >
              Kembalikan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm === "publish"
            ? "Buka umpan balik untuk mahasiswa?"
            : "Kembalikan hasil kepada mahasiswa?"
        }
        description={
          confirm === "publish"
            ? "Mahasiswa terkait dapat membaca umpan balik yang Anda tulis. Tindakan tercatat dalam audit demo."
            : "Status hasil menjadi Dikembalikan dan komentar dapat dibaca mahasiswa. Pembukaan ulang transaksi belum tersedia; gunakan pengulangan percobaan dengan alasan bila diperlukan."
        }
        onConfirm={() => {
          if (!selected) return
          dispatch({
            type: "review",
            review: {
              ...selected,
              comment,
              status: confirm === "publish" ? "Dinilai" : "Dikembalikan",
              published: true,
            },
          })
          setSelected(null)
          setMessage("Umpan balik berhasil diperbarui.")
        }}
      />
    </div>
  )
}
export function Observations() {
  const { state, dispatch } = useDemo()
  const [text, setText] = useState("")
  const [saved, setSaved] = useState(false)
  useUnsavedChanges(!!text)
  return (
    <div className="page-stack">
      <PageHeading
        title="Catatan observasi"
        description="Dokumentasikan proses kerja peserta tanpa mengambil alih transaksi."
      />
      {saved && <Notice title="Catatan observasi berhasil disimpan." />}
      <Panel
        title="Observasi sesi aktif"
        description="SESI-001 · Alur pelayanan rawat jalan"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return
            dispatch({ type: "observe", text })
            setText("")
            setSaved(true)
          }}
        >
          <FieldGroup>
            <FormField
              id="observation"
              label="Catatan proses dan bukti yang diamati"
              required
            >
              <Textarea
                id="observation"
                required
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setSaved(false)
                }}
                placeholder="Contoh: Peserta memeriksa ulang identitas sebelum membuat kunjungan."
              />
            </FormField>
          </FieldGroup>
          <div className="form-actions">
            <Button type="submit" disabled={!text.trim()}>
              Simpan observasi
            </Button>
          </div>
        </form>
      </Panel>
      <Panel title="Riwayat observasi">
        {state.observations.length ? (
          <ul className="flex flex-col gap-5">
            {state.observations.map((text, i) => (
              <li className="border-b pb-4" key={i}>
                {text}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada observasi"
            description="Catat temuan selama praktikum sebagai bahan penilaian dan umpan balik."
          />
        )}
      </Panel>
    </div>
  )
}
export function Audit() {
  const { state } = useDemo()
  const [selected, setSelected] = useState<AuditEntry | null>(null)
  return (
    <div className="page-stack">
      <PageHeading
        title="Audit aktivitas"
        description="Telusuri pengguna, peran, perubahan data, dan konteks percobaan."
      />
      <Panel title="Riwayat aktivitas simulasi">
        <DataTable
          rows={state.audit}
          search={(a) => `${a.user} ${a.action} ${a.object} ${a.role}`}
          placeholder="Cari pengguna, aktivitas, atau objek..."
          columns={[
            {
              label: "Waktu (WIB)",
              render: (a) => (
                <>
                  {formatTime(a.time)}
                  <small className="block text-muted-foreground">
                    {formatDate(a.time)}
                  </small>
                </>
              ),
            },
            {
              label: "Pengguna / peran",
              render: (a) => (
                <>
                  {a.user}
                  <small className="block text-muted-foreground">
                    {a.role}
                  </small>
                </>
              ),
            },
            { label: "Aktivitas", render: (a) => <strong>{a.action}</strong> },
            {
              label: "Konteks",
              render: (a) => (
                <>
                  {a.session} · #{a.attempt}
                </>
              ),
            },
            {
              label: "Aksi",
              render: (a) => (
                <Button variant="outline" onClick={() => setSelected(a)}>
                  Detail perubahan
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="simrs-ui">
          <DialogHeader>
            <DialogTitle>{selected?.action}</DialogTitle>
            <DialogDescription>
              {selected?.object} · Sumber: antarmuka demo lokal
            </DialogDescription>
          </DialogHeader>
          <dl className="summary-list">
            <div>
              <dt>Nilai sebelum</dt>
              <dd className="break-all">{selected?.before}</dd>
            </div>
            <div>
              <dt>Nilai sesudah</dt>
              <dd className="break-all">{selected?.after}</dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export function Reports() {
  const { state } = useDemo()
  const [filter, setFilter] = useState("Percobaan aktif")
  const total = tariffs.reduce((sum, t) => sum + t.amount, 0)
  const visits =
    filter === "Percobaan aktif"
      ? state.attempt.visits
      : state.history.flatMap((a) => a.visits)
  function download() {
    const data = [
      "DOKUMEN SIMULASI — SIMRS-e",
      `${academic.course} | ${academic.classroom} | ${academic.group}`,
      `SESI-001 | ${filter} | Pengunduh: ${state.role}`,
      "Seluruh identitas dan transaksi merupakan data sintetis.",
      "",
      "Kunjungan\tPasien\tAntrean\tStatus\tPembayaran\tPercobaan",
      ...visits.map(
        (v) =>
          `${v.id}\t${v.name}\t${v.queue}\t${v.status}\t${v.paid ? "Lunas dummy" : "Belum lunas"}\t${v.attempt}`
      ),
    ].join("\n")
    const url = URL.createObjectURL(
      new Blob([data], { type: "text/plain;charset=utf-8" })
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "SIMRS-e-DOKUMEN-SIMULASI.txt"
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="page-stack">
      <PageHeading
        title="Laporan hasil praktikum"
        description="Ringkasan data transaksi kelompok dan riwayat pengulangan sesi."
        action={
          <Button variant="outline" onClick={download}>
            Unduh laporan simulasi
          </Button>
        }
      />
      <Notice title="DOKUMEN SIMULASI">
        Angka dihitung dari kunjungan dalam percobaan yang dipilih. Laporan ini
        berisi data sintetis untuk pembelajaran.
      </Notice>
      <div className="module-card-grid">
        <Panel title="Kunjungan tercatat">
          <strong className="text-3xl">{visits.length}</strong>
          <p className="text-muted-foreground">Jumlah kunjungan tersimpan</p>
        </Panel>
        <Panel title="Pelayanan selesai">
          <strong className="text-3xl">
            {visits.filter((v) => v.status === "Selesai").length}
          </strong>
          <p className="text-muted-foreground">Kunjungan berstatus selesai</p>
        </Panel>
        <Panel title="Pembayaran dummy">
          <strong className="text-3xl">
            {rupiah(visits.filter((v) => v.paid).length * total)}
          </strong>
          <p className="text-muted-foreground">
            Total tagihan simulasi yang lunas
          </p>
        </Panel>
      </div>
      <Panel title="Rincian hasil">
        <DataTable
          rows={visits}
          search={(v) => `${v.id} ${v.name}`}
          placeholder="Cari kunjungan..."
          filters={
            <SelectControl
              label="Cakupan laporan"
              options={["Percobaan aktif", "Riwayat percobaan"]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          }
          columns={[
            { label: "Kunjungan", render: (v) => v.id },
            { label: "Nama sintetis", render: (v) => v.name },
            { label: "Percobaan", render: (v) => v.attempt },
            {
              label: "Status pelayanan",
              render: (v) => <Status>{v.status}</Status>,
            },
            {
              label: "Pembayaran",
              render: (v) => <Status>{v.paid ? "Lunas" : "Menunggu"}</Status>,
            },
          ]}
        />
      </Panel>
    </div>
  )
}
