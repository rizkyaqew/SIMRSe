"use client"
import { useEffect, useState } from "react"
import { validatePatient } from "@/lib/simrs/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup } from "@/components/ui/field"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  SelectControl,
  Status,
  useUnsavedChanges,
} from "./ui"
import {
  actorTasks,
  formatTime,
  patientSeed,
  rupiah,
  tariffs,
} from "@/lib/simrs/data"
import { lockReason, participant } from "@/lib/simrs/store"
import type { PatientInput, Visit } from "@/lib/simrs/types"

const emptyPatient: PatientInput = {
  name: "",
  identity: "",
  birthDate: "",
  gender: "",
  address: "",
  payer: "",
  unit: "",
}
export function Simulation({
  transactions = false,
}: {
  transactions?: boolean
}) {
  const { state, dispatch } = useDemo()
  const person = participant(state)
  const [now, setNow] = useState(0)
  const [submit, setSubmit] = useState(false)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const reason = lockReason(state, now)
  const defaultTab =
    person.actor === "Kasir"
      ? "billing"
      : person.actor === "Petugas Pendaftaran"
        ? "pendaftaran"
        : "pelayanan"
  const hasWork =
    state.attempt.visits.length > 0 &&
    (person.actor !== "Kasir" || state.attempt.visits.every((v) => v.paid))
  return (
    <div className="page-stack">
      <PageHeading
        title={
          transactions ? "Transaksi simulasi" : "Ruang simulasi rawat jalan"
        }
        description={`${state.sessions[0].id} · Percobaan ${state.attempt.number} · ${person.actor} · DATA SINTETIS`}
        action={
          !transactions && (
            <Button
              disabled={!!reason || !hasWork}
              onClick={() => setSubmit(true)}
            >
              Serahkan hasil praktikum
            </Button>
          )
        }
      />
      {reason && (
        <Notice title={reason} danger={reason.includes("berakhir")}>
          {state.attempt.status === "Belum dimulai" && (
            <ActionLink href="/sesi-aktif">Buka briefing</ActionLink>
          )}
        </Notice>
      )}
      {transactions ? (
        <VisitTable />
      ) : (
        <div className="workspace-grid">
          <div className="page-stack">
            <Tabs defaultValue={defaultTab}>
              <TabsList aria-label="Tahap pelayanan">
                <TabsTrigger value="pendaftaran">Pendaftaran</TabsTrigger>
                <TabsTrigger value="antrean">Antrean</TabsTrigger>
                <TabsTrigger value="pelayanan">
                  Rawat jalan & rekam medis
                </TabsTrigger>
                <TabsTrigger value="billing">Billing & kasir</TabsTrigger>
              </TabsList>
              <TabsContent value="pendaftaran" keepMounted>
                <Registration
                  reason={
                    reason ||
                    (person.actor !== "Petugas Pendaftaran"
                      ? "Pendaftaran hanya dapat diubah oleh Petugas Pendaftaran."
                      : "")
                  }
                />
              </TabsContent>
              <TabsContent value="antrean">
                <Panel
                  title="Antrean pelayanan"
                  description="Antrean berasal dari pendaftaran yang disimpan pada percobaan ini."
                >
                  <VisitTable />
                </Panel>
              </TabsContent>
              <TabsContent value="pelayanan">
                <ClinicalWorkspace reason={reason} />
              </TabsContent>
              <TabsContent value="billing">
                <Billing reason={reason} />
              </TabsContent>
            </Tabs>
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
              description="Gunakan data contoh berikut untuk berlatih."
            >
              <dl className="summary-list">
                <div>
                  <dt>Nama</dt>
                  <dd>{patientSeed.name}</dd>
                </div>
                <div>
                  <dt>Kode identitas sintetis</dt>
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
              Penyimpanan, perubahan status, dan serah hasil menjadi bukti
              proses untuk dosen. Seluruh transaksi bersifat simulasi.
            </Notice>
          </div>
        </div>
      )}
      <Confirm
        open={submit}
        onClose={() => setSubmit(false)}
        title="Serahkan hasil praktikum?"
        description="Hasil percobaan Anda akan tersedia untuk ditinjau dosen. Setelah diserahkan, akun Anda tidak dapat mengubah transaksi percobaan ini lagi."
        label="Ya, serahkan hasil"
        onConfirm={() => dispatch({ type: "submit" })}
      />
    </div>
  )
}
function Registration({ reason }: { reason: string }) {
  const { state, dispatch } = useDemo()
  const [form, setForm] = useState<PatientInput>(emptyPatient)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Visit | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reset, setReset] = useState(false)
  useUnsavedChanges(dirty)
  const update = (key: keyof PatientInput, value: string) => {
    setForm({ ...form, [key]: value })
    setDirty(true)
    setSaved(null)
  }
  const blur = (key: keyof PatientInput) =>
    setErrors((previous) => ({
      ...previous,
      [key]: validatePatient(form)[key] ?? "",
    }))
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (reason || saving) return
    const result = validatePatient(form)
    if (state.attempt.visits.some((v) => v.identity === form.identity))
      result.identity =
        "Pasien sudah terdaftar pada percobaan ini. Periksa daftar antrean."
    setErrors(result)
    if (Object.values(result).some(Boolean)) return
    // Yield one frame for loading feedback; no fictional network request is made.
    setSaving(true)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const number = state.attempt.visits.length + 1
    const visit: Visit = {
      ...form,
      id: `KJ-${state.attempt.number}-${String(number).padStart(3, "0")}`,
      rm: `RM-SIM-${form.identity.slice(5)}`,
      queue: `A-${String(number).padStart(3, "0")}`,
      status: "Menunggu",
      note: "",
      paid: false,
      attempt: state.attempt.number,
      savedAt: new Date().toISOString(),
    }
    dispatch({ type: "visit", visit })
    setSaved(visit)
    setDirty(false)
    setSaving(false)
  }
  return (
    <Panel
      title="Pendaftaran pasien"
      description="Latih verifikasi identitas dan pembuatan kunjungan rawat jalan."
    >
      <div className="page-stack">
        {reason.includes("Petugas Pendaftaran") && (
          <Notice title="Formulir hanya dapat dibaca">{reason}</Notice>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!!reason}
            onClick={() => {
              setForm(patientSeed)
              setDirty(true)
              setErrors({})
              setSaved(null)
            }}
          >
            Gunakan pasien dari skenario
          </Button>
          <small className="self-center text-muted-foreground">
            Identitas pasien wajib sintetis.
          </small>
        </div>
        {saved && !reason && (
          <Notice title="Pendaftaran berhasil disimpan">
            {saved.name} · {saved.rm} · Nomor antrean {saved.queue}. Disimpan
            pukul {formatTime(saved.savedAt)} WIB.
          </Notice>
        )}
        <form noValidate onSubmit={save}>
          {!reason && Object.values(errors).some(Boolean) && (
            <div className="mb-5">
              <Notice title="Pendaftaran belum dapat disimpan" danger>
                Perbaiki kolom yang ditandai, lalu simpan kembali.
              </Notice>
            </div>
          )}
          <FieldGroup className="form-grid">
            {(
              [
                ["identity", "Kode identitas sintetis", "SINT-0001"],
                ["name", "Nama lengkap sintetis", "Pasien Sintetis 001"],
                ["birthDate", "Tanggal lahir", ""],
              ] as const
            ).map(([key, label, placeholder]) => (
              <FormField
                key={key}
                id={`patient-${key}`}
                label={label}
                required
                error={errors[key]}
              >
                <Input
                  id={`patient-${key}`}
                  type={key === "birthDate" ? "date" : "text"}
                  placeholder={placeholder}
                  value={form[key]}
                  disabled={!!reason || saving}
                  onChange={(e) => update(key, e.target.value)}
                  onBlur={() => blur(key)}
                  aria-invalid={!!errors[key]}
                  aria-describedby={
                    errors[key] ? `patient-${key}-error` : undefined
                  }
                />
              </FormField>
            ))}
            {(
              [
                [
                  "gender",
                  "Jenis kelamin",
                  ["Pilih jenis kelamin", "Perempuan", "Laki-laki"],
                ],
                [
                  "payer",
                  "Penjamin",
                  ["Pilih penjamin", "Umum", "JKN Simulasi"],
                ],
                ["unit", "Poli tujuan", ["Pilih poli", "Poli Umum"]],
              ] as const
            ).map(([key, label, options]) => (
              <FormField
                key={key}
                id={`patient-${key}`}
                label={label}
                required
                error={errors[key]}
              >
                <SelectControl
                  id={`patient-${key}`}
                  label={label}
                  options={[...options]}
                  value={form[key] || options[0]}
                  onChange={(e) => update(key, e.target.value)}
                  onBlur={() => blur(key)}
                  disabled={!!reason || saving}
                  aria-invalid={!!errors[key]}
                  aria-describedby={
                    errors[key] ? `patient-${key}-error` : undefined
                  }
                />
              </FormField>
            ))}
            <div className="form-full">
              <FormField
                id="patient-address"
                label="Alamat fiktif"
                required
                error={errors.address}
              >
                <Textarea
                  id="patient-address"
                  placeholder="Alamat sesuai data skenario"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  onBlur={() => blur("address")}
                  disabled={!!reason || saving}
                  aria-invalid={!!errors.address}
                  aria-describedby={
                    errors.address ? "patient-address-error" : undefined
                  }
                />
              </FormField>
            </div>
          </FieldGroup>
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              disabled={!!reason || saving}
              onClick={() => setReset(true)}
            >
              Kosongkan formulir
            </Button>
            <Button type="submit" disabled={!!reason || saving}>
              {saving ? "Menyimpan..." : "Simpan pendaftaran"}
            </Button>
          </div>
        </form>
      </div>
      <Confirm
        open={reset}
        onClose={() => setReset(false)}
        title="Kosongkan formulir?"
        description="Isian yang belum disimpan akan dihapus. Pendaftaran yang sudah tercatat tidak berubah."
        label="Kosongkan"
        onConfirm={() => {
          setForm(emptyPatient)
          setErrors({})
          setDirty(false)
          setSaved(null)
        }}
      />
    </Panel>
  )
}
export function VisitTable() {
  const { state } = useDemo()
  return (
    <DataTable
      rows={state.attempt.visits}
      search={(v) => `${v.name} ${v.rm} ${v.queue}`}
      placeholder="Cari pasien, nomor RM, atau antrean..."
      columns={[
        { label: "Antrean", render: (v) => <strong>{v.queue}</strong> },
        {
          label: "Pasien sintetis",
          render: (v) => (
            <div>
              <strong>{v.name}</strong>
              <small className="block text-muted-foreground">
                {v.rm} · {v.id}
              </small>
            </div>
          ),
        },
        {
          label: "Poli / penjamin",
          render: (v) => (
            <>
              {v.unit}
              <small className="block text-muted-foreground">{v.payer}</small>
            </>
          ),
        },
        { label: "Status", render: (v) => <Status>{v.status}</Status> },
        {
          label: "Billing",
          render: (v) => <Status>{v.paid ? "Lunas" : "Menunggu"}</Status>,
        },
      ]}
    />
  )
}
function ClinicalWorkspace({ reason }: { reason: string }) {
  const { state, dispatch } = useDemo()
  const actor = participant(state).actor
  const [selected, setSelected] = useState("")
  const visit =
    state.attempt.visits.find((v) => v.id === selected) ??
    state.attempt.visits[0]
  if (!visit)
    return (
      <Panel title="Rawat jalan dan rekam medis">
        <EmptyState
          title="Belum ada kunjungan"
          description="Petugas pendaftaran perlu menyimpan kunjungan sebelum proses pelayanan dimulai."
        />
      </Panel>
    )
  return (
    <Panel
      title="Rawat jalan dan rekam medis simulasi"
      description="Pencatatan pelayanan mengikuti kasus dari dosen. Tidak ada rekomendasi medis otomatis."
    >
      <div className="page-stack">
        <SelectControl
          label="Kunjungan aktif"
          options={state.attempt.visits.map((v) => v.id)}
          value={visit.id}
          onChange={(e) => setSelected(e.target.value)}
        />
        <ClinicalForm
          key={`${visit.id}-${state.attempt.number}`}
          visit={visit}
          reason={
            reason ||
            (!["Dokter", "Petugas Rekam Medis"].includes(actor)
              ? "Catatan hanya dapat diubah oleh Dokter atau Petugas Rekam Medis."
              : "")
          }
          onSave={(note, complete) =>
            dispatch({
              type: "visit-update",
              id: visit.id,
              note,
              ...(complete ? { status: "Selesai" } : {}),
            })
          }
        />
      </div>
    </Panel>
  )
}
function ClinicalForm({
  visit,
  reason,
  onSave,
}: {
  visit: Visit
  reason: string
  onSave: (note: string, complete: boolean) => void
}) {
  const { state, dispatch } = useDemo()
  const [note, setNote] = useState(visit.note)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState("")
  const actor = participant(state).actor
  const locked = !!reason || visit.paid || visit.status === "Selesai"
  useUnsavedChanges(dirty)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (locked || !note.trim()) {
          setError("Isi catatan pelayanan sesuai skenario.")
          return
        }
        onSave(note, false)
        setDirty(false)
        setError("")
      }}
    >
      <div className="page-stack">
        <div className="flex items-center justify-between gap-3">
          <h3>
            {visit.name} · {visit.rm}
          </h3>
          <Status>{visit.status}</Status>
        </div>
        {(reason || visit.status === "Selesai") && (
          <Notice title="Catatan hanya dapat dibaca">
            {reason || "Pelayanan sudah diselesaikan dan catatan dikunci."}
          </Notice>
        )}
        {actor === "Dokter" && visit.status === "Menunggu" && (
          <Button
            type="button"
            disabled={!!reason}
            onClick={() =>
              dispatch({
                type: "visit-update",
                id: visit.id,
                status: "Dilayani",
              })
            }
          >
            Terima pasien dan mulai pelayanan
          </Button>
        )}
        <FormField
          id="visit-note"
          label="Catatan pelayanan sesuai skenario"
          required
          error={error}
        >
          <Textarea
            id="visit-note"
            value={note}
            disabled={locked}
            onChange={(e) => {
              setNote(e.target.value)
              setDirty(true)
            }}
            aria-invalid={!!error}
            placeholder="Tuliskan hasil verifikasi dan pelayanan yang ditetapkan dalam kasus praktikum."
          />
        </FormField>
        <div className="form-actions">
          <small>Terakhir disimpan {formatTime(visit.savedAt)} WIB</small>
          <Button type="submit" variant="outline" disabled={locked}>
            Simpan catatan
          </Button>
          {actor === "Dokter" && (
            <Button
              type="button"
              disabled={locked || visit.status !== "Dilayani" || !note.trim()}
              onClick={() => {
                onSave(note, true)
                setDirty(false)
              }}
            >
              Selesaikan pelayanan
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
function Billing({ reason }: { reason: string }) {
  const { state, dispatch } = useDemo()
  const [confirm, setConfirm] = useState<Visit | null>(null)
  const actor = participant(state).actor
  return (
    <Panel
      title="Billing dan kasir simulasi"
      description="Tarif berasal dari master data. Pembayaran menggunakan transaksi dummy."
    >
      <div className="page-stack">
        {actor !== "Kasir" && (
          <Notice title="Tagihan hanya dapat dibaca">
            Pencatatan pembayaran merupakan tugas peran Kasir.
          </Notice>
        )}
        {!state.attempt.visits.length ? (
          <EmptyState
            title="Belum ada tagihan"
            description="Tagihan tersedia setelah kunjungan pasien dibuat."
          />
        ) : (
          state.attempt.visits.map((v) => (
            <div className="page-stack" key={v.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <h3>
                  {v.name} · {v.id}
                </h3>
                <Status>{v.paid ? "Lunas" : "Menunggu"}</Status>
              </div>
              <dl className="summary-list">
                {tariffs.map((t) => (
                  <div className="flex justify-between" key={t.name}>
                    <dt>{t.name}</dt>
                    <dd>{rupiah(t.amount)}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-4">
                  <dt>Total tagihan simulasi</dt>
                  <dd>
                    {rupiah(tariffs.reduce((sum, t) => sum + t.amount, 0))}
                  </dd>
                </div>
              </dl>
              <p className="text-muted-foreground">
                Penjamin: {v.payer} ·{" "}
                {v.status === "Selesai"
                  ? "Pelayanan sudah selesai."
                  : "Menunggu pelayanan selesai sebelum pembayaran."}
              </p>
              <Button
                disabled={
                  !!reason ||
                  actor !== "Kasir" ||
                  v.paid ||
                  v.status !== "Selesai"
                }
                onClick={() => setConfirm(v)}
              >
                {v.paid
                  ? "Pembayaran sudah tercatat"
                  : "Catat pembayaran dummy"}
              </Button>
            </div>
          ))
        )}
      </div>
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Catat pembayaran dummy?"
        description={`Tagihan ${confirm?.id ?? ""} akan ditandai lunas dalam simulasi. Tidak ada uang atau transaksi pembayaran nyata.`}
        label="Catat pembayaran"
        onConfirm={() => {
          if (confirm)
            dispatch({ type: "visit-update", id: confirm.id, paid: true })
        }}
      />
    </Panel>
  )
}
