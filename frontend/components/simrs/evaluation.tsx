"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup } from "@/components/ui/field"
import { useDemo } from "./provider"
import { PageHeading } from "./dashboard"
import {
  ActionLink,
  Confirm,
  DataTable,
  EmptyState,
  FormField,
  Notice,
  Panel,
  Status,
  useUnsavedChanges,
} from "./ui"
import { academic, formatDate, formatTime } from "@/lib/simrs/data"
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
              · {state.activeSessionId}
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
              onClick={async () => {
                if (!selected) return
                const ok = await dispatch({
                  type: "review",
                  review: {
                    ...selected,
                    comment,
                    status: "Dinilai",
                    published: false,
                  },
                })
                if (!ok) return
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
        onConfirm={async () => {
          if (!selected) return
          const ok = await dispatch({
            type: "review",
            review: {
              ...selected,
              comment,
              status: confirm === "publish" ? "Dinilai" : "Dikembalikan",
              published: true,
            },
          })
          if (!ok) return false
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
        description={`${state.activeSessionId} · ${state.sessions[0].title}`}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!text.trim()) return
            if (!(await dispatch({ type: "observe", text }))) return
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
  const attempts = [...state.history, state.attempt].map((a) => ({
    ...a,
    id: String(a.number),
  }))
  const participants =
    state.role === "Mahasiswa"
      ? state.participants.filter((p) => p.id === state.participantId)
      : state.participants
  return (
    <div className="page-stack">
      <PageHeading
        title="Laporan hasil praktikum"
        description={`${state.activeSessionId} · ${academic.classroom} · ${academic.group}`}
      />
      <Notice title="Laporan pembelajaran">
        Progres, penyerahan, penilaian, dan riwayat percobaan berada di SIMRS-e.
        Rincian kunjungan serta tagihan tersedia di laporan operasional.
      </Notice>
      <ActionLink href="/simrs/laporan">Lihat laporan operasional</ActionLink>
      <Panel title="Progres dan hasil peserta">
        <DataTable
          rows={participants}
          search={(p) => `${p.id} ${p.name}`}
          columns={[
            {
              label: "Peserta",
              render: (p) => (
                <>
                  <strong>{p.name}</strong>
                  <small className="block">{p.actor}</small>
                </>
              ),
            },
            { label: "Progres", render: (p) => `${p.progress}%` },
            {
              label: "Status tugas",
              render: (p) => <Status>{p.status}</Status>,
            },
            {
              label: "Umpan balik percobaan ini",
              render: (p) => {
                const review = state.reviews.find(
                  (r) =>
                    r.participantId === p.id &&
                    r.attempt === state.attempt.number
                )
                return review?.published
                  ? review.comment
                  : review
                    ? "Menunggu tinjauan/publikasi dosen"
                    : "Belum diserahkan"
              },
            },
          ]}
        />
      </Panel>
      <Panel title="Riwayat percobaan">
        <DataTable
          rows={attempts}
          search={(a) => String(a.number)}
          columns={[
            { label: "Percobaan", render: (a) => a.number },
            {
              label: "Status",
              render: (a) => (
                <Status>
                  {a.number === state.attempt.number ? a.status : "Riwayat"}
                </Status>
              ),
            },
            { label: "Bukti kunjungan", render: (a) => a.visits.length },
            {
              label: "Penilaian tersimpan",
              render: (a) =>
                state.reviews.filter((r) => r.attempt === a.number).length,
            },
            {
              label: "Batas waktu",
              render: (a) =>
                a.deadline
                  ? `${formatDate(new Date(a.deadline).toISOString())} ${formatTime(new Date(a.deadline).toISOString())} WIB`
                  : "Belum dimulai",
            },
          ]}
        />
      </Panel>
    </div>
  )
}
