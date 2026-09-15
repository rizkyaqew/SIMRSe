"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
} from "@/components/platform/shared"
import { patientSeed } from "@/lib/core/catalog"
import { billSummary, operationalSummary } from "@/lib/core/engine"
import { validatePatient, validateRecord } from "@/lib/core/validation"
import type {
  CoreCommand,
  CoreState,
  PatientInput,
  RecordInput,
  Visit,
  Payment,
} from "@/lib/core/types"
import type { Capability, Principal } from "@/lib/platform/types"
import type { CoreModule } from "@/lib/core/navigation"
import { formatDate, formatTime, rupiah } from "@/lib/platform/format"

export interface WorkspaceProps {
  data: CoreState
  principal: Principal
  execute: (command: CoreCommand) => Promise<boolean>
  locked: string
  pending: boolean
}
const allowed = (props: WorkspaceProps, cap: Capability) =>
  !props.locked &&
  !props.pending &&
  props.principal.active &&
  props.principal.capabilities.includes(cap)
const emptyPatient: PatientInput = {
  name: "",
  identity: "",
  birthDate: "",
  gender: "",
  address: "",
  contact: "",
  payer: "",
  unit: "",
}
const option = (value: string, label = value) => ({ value, label })
function Saved({ text }: { text: string }) {
  return text ? <Notice title={text} /> : null
}

/** These screens know hospital facts/capabilities only. Context and pedagogy are supplied outside. */
export function CoreWorkspace(props: WorkspaceProps & { module: CoreModule }) {
  switch (props.module) {
    case "pasien":
      return <Patients {...props} />
    case "pendaftaran":
      return <Registration {...props} />
    case "appointment":
      return <Appointments {...props} />
    case "antrean":
      return <Queue {...props} />
    case "rawat-jalan":
    case "rekam-medis":
      return <Clinical {...props} />
    case "billing":
    case "kasir":
      return <Finance {...props} cashier={props.module === "kasir"} />
    case "master":
      return <Master {...props} />
    case "laporan":
      return <OperationalReport {...props} />
    default:
      return <OperationalReport {...props} dashboard />
  }
}
function PatientFields({
  form,
  update,
  errors,
  blur,
  disabled,
}: {
  form: PatientInput
  update: (key: keyof PatientInput, value: string) => void
  errors: Record<string, string>
  blur: (key: string) => void
  disabled: boolean
}) {
  const fields: [keyof PatientInput, string, string][] = [
    ["identity", "Kode identitas sintetis", "text"],
    ["name", "Nama lengkap sintetis", "text"],
    ["birthDate", "Tanggal lahir", "date"],
    ["contact", "Kontak fiktif (opsional)", "text"],
  ]
  return (
    <>
      {fields.map(([key, label, type]) => (
        <FormField
          key={key}
          id={`patient-${key}`}
          label={label}
          required={key !== "contact"}
          error={errors[key]}
        >
          <Input
            id={`patient-${key}`}
            type={type}
            value={form[key] ?? ""}
            disabled={disabled}
            aria-invalid={!!errors[key]}
            aria-describedby={errors[key] ? `patient-${key}-error` : undefined}
            onChange={(e) => update(key, e.target.value)}
            onBlur={() => blur(key)}
            placeholder={
              key === "identity"
                ? "SINT-0001"
                : key === "contact"
                  ? "KONTAK-SINT-0001"
                  : undefined
            }
          />
        </FormField>
      ))}
      <FormField
        id="patient-gender"
        label="Jenis kelamin"
        required
        error={errors.gender}
      >
        <SelectControl
          id="patient-gender"
          label="Jenis kelamin"
          options={[
            option("", "Pilih jenis kelamin"),
            "Perempuan",
            "Laki-laki",
          ]}
          value={form.gender}
          disabled={disabled}
          onChange={(e) => update("gender", e.target.value)}
          onBlur={() => blur("gender")}
        />
      </FormField>
      <FormField
        id="patient-address"
        label="Alamat fiktif"
        required
        error={errors.address}
      >
        <Textarea
          id="patient-address"
          value={form.address}
          disabled={disabled}
          onChange={(e) => update("address", e.target.value)}
          onBlur={() => blur("address")}
          aria-invalid={!!errors.address}
        />
      </FormField>
    </>
  )
}
function Registration(
  props: WorkspaceProps & { patientOnly?: boolean; onDone?: () => void }
) {
  const { data, execute } = props
  const [mode, setMode] = useState("baru"),
    [form, setForm] = useState<PatientInput>(emptyPatient),
    [patientId, setPatientId] = useState(""),
    [appointmentId, setAppointmentId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [dirty, setDirty] = useState(false),
    [verified, setVerified] = useState(false),
    [message, setMessage] = useState("")
  const [reset, setReset] = useState(false),
    [serviceId, setServiceId] = useState(
      data.master.services.find((s) => s.kind === "consultation" && s.active)
        ?.id ?? ""
    )
  const canEdit = allowed(
    props,
    props.patientOnly ? "patient.write" : "registration.write"
  )
  useUnsavedChanges(dirty)
  function update(key: keyof PatientInput, value: string) {
    setForm({ ...form, [key]: value })
    setDirty(true)
    setMessage("")
  }
  function blur(key: string) {
    const error = validatePatient(form, data.master)[key]
    setErrors({ ...errors, [key]: error ?? "" })
  }
  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    const check =
      mode === "baru"
        ? validatePatient(form, data.master)
        : !patientId
          ? { patientId: "Pilih pasien terdaftar." }
          : {}
    if (!props.patientOnly && !verified)
      check.verified = "Verifikasi identitas dan penjamin sebelum menyimpan."
    if (
      mode !== "baru" &&
      (!data.master.units.includes(form.unit) ||
        !data.master.payers.includes(form.payer))
    )
      check.unit = "Pilih poli dan penjamin."
    if (mode === "appointment" && !appointmentId)
      check.appointmentId = "Pilih appointment terjadwal."
    setErrors(check)
    if (Object.values(check).some(Boolean)) return
    const command: CoreCommand = props.patientOnly
      ? { type: "patient.create", patient: form }
      : {
          type: "registration.create",
          ...(mode === "baru" ? { patient: form } : { patientId }),
          unit: form.unit,
          payer: form.payer,
          verified,
          serviceId,
          ...(mode === "appointment" ? { appointmentId } : {}),
        }
    if (await execute(command)) {
      setDirty(false)
      setMessage(
        props.patientOnly
          ? "Pasien sintetis tersimpan."
          : "Pendaftaran tersimpan. Nomor kunjungan dan antrean tersedia pada tabel di bawah."
      )
      props.onDone?.()
    }
  }
  return (
    <div className="page-stack">
      <Panel
        title={props.patientOnly ? "Pasien baru" : "Pendaftaran pasien"}
        description="Satu identitas pasien dapat digunakan untuk kunjungan berikutnya. Seluruh data sintetis."
      >
        <form onSubmit={save} noValidate className="page-stack">
          {!props.patientOnly && (
            <Tabs
              value={mode}
              onValueChange={(value) => {
                if (
                  dirty &&
                  !window.confirm(
                    "Isian belum disimpan. Ganti jenis pendaftaran?"
                  )
                )
                  return
                setMode(value)
                setVerified(false)
                setErrors({})
                setMessage("")
              }}
            >
              <TabsList aria-label="Jenis pendaftaran">
                <TabsTrigger value="baru">Pasien baru</TabsTrigger>
                <TabsTrigger value="lama">Pasien lama</TabsTrigger>
                <TabsTrigger value="appointment">Appointment</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Saved text={message} />
          {Object.values(errors).some(Boolean) && (
            <Notice danger title="Periksa formulir">
              {Object.values(errors).filter(Boolean).join(" ")}
            </Notice>
          )}
          {mode === "baru" ? (
            <>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canEdit}
                  onClick={() => {
                    setForm({ ...patientSeed, contact: "KONTAK-SINT-0001" })
                    setDirty(true)
                    setErrors({})
                    setMessage("")
                  }}
                >
                  Gunakan data pasien contoh
                </Button>
              </div>
              <div className="form-grid">
                <PatientFields
                  form={form}
                  update={update}
                  errors={errors}
                  blur={blur}
                  disabled={!canEdit}
                />
              </div>
            </>
          ) : (
            <>
              <DataTable
                rows={data.patients}
                search={(p) => `${p.name} ${p.rm} ${p.identity}`}
                placeholder="Cari pasien / nomor RM..."
                columns={[
                  {
                    label: "Pasien",
                    render: (p) => (
                      <>
                        <strong>{p.name}</strong>
                        <small className="block">{p.identity}</small>
                      </>
                    ),
                  },
                  { label: "No. RM", render: (p) => p.rm },
                  {
                    label: "Aksi",
                    render: (p) => (
                      <Button
                        type="button"
                        disabled={!canEdit}
                        variant={patientId === p.id ? "default" : "outline"}
                        onClick={() => {
                          setPatientId(p.id)
                          setForm({
                            ...form,
                            payer: p.payer,
                            unit: data.master.units[0],
                          })
                          setAppointmentId("")
                          setVerified(false)
                          setDirty(true)
                        }}
                      >
                        {patientId === p.id ? "Dipilih" : "Pilih pasien"}
                      </Button>
                    ),
                  },
                ]}
              />
              {mode === "appointment" && (
                <FormField
                  id="registration-appointment"
                  label="Appointment"
                  required
                  error={errors.appointmentId}
                >
                  <SelectControl
                    id="registration-appointment"
                    label="Appointment terjadwal"
                    options={[
                      option("", "Pilih appointment"),
                      ...data.appointments
                        .filter(
                          (a) =>
                            a.patientId === patientId &&
                            a.status === "Terjadwal"
                        )
                        .map((a) =>
                          option(
                            a.id,
                            `${a.id} · ${formatDate(a.date)} ${a.time}`
                          )
                        ),
                    ]}
                    value={appointmentId}
                    disabled={!canEdit}
                    onChange={(e) => {
                      setAppointmentId(e.target.value)
                      const appt = data.appointments.find(
                        (a) => a.id === e.target.value
                      )
                      if (appt) update("unit", appt.unit)
                    }}
                  />
                </FormField>
              )}
            </>
          )}
          <div className="form-grid">
            <FormField
              id="registration-payer"
              label="Penjamin"
              required
              error={errors.payer}
            >
              <SelectControl
                id="registration-payer"
                label="Penjamin"
                options={[option("", "Pilih penjamin"), ...data.master.payers]}
                value={form.payer}
                disabled={!canEdit}
                onChange={(e) => update("payer", e.target.value)}
                onBlur={() => blur("payer")}
              />
            </FormField>
            <FormField
              id="registration-unit"
              label="Poli tujuan"
              required
              error={errors.unit}
            >
              <SelectControl
                id="registration-unit"
                label="Poli tujuan"
                options={[option("", "Pilih poli"), ...data.master.units]}
                value={form.unit}
                disabled={!canEdit}
                onChange={(e) => update("unit", e.target.value)}
                onBlur={() => blur("unit")}
              />
            </FormField>
            {!props.patientOnly && (
              <FormField
                id="registration-service"
                label="Layanan tujuan"
                required
              >
                <SelectControl
                  id="registration-service"
                  label="Layanan tujuan"
                  options={data.master.services
                    .filter((s) => s.kind === "consultation" && s.active)
                    .map((s) => option(s.id, s.name))}
                  value={serviceId}
                  disabled={!canEdit}
                  onChange={(e) => {
                    setServiceId(e.target.value)
                    setDirty(true)
                  }}
                />
              </FormField>
            )}
          </div>
          {!props.patientOnly && (
            <label className="check-line">
              <input
                type="checkbox"
                checked={verified}
                disabled={!canEdit}
                onChange={(e) => {
                  setVerified(e.target.checked)
                  setDirty(true)
                }}
              />
              Identitas, penjamin, dan tujuan kunjungan telah diverifikasi.
            </label>
          )}
          {errors.verified && (
            <p className="text-sm text-destructive" role="alert">
              {errors.verified}
            </p>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              disabled={!canEdit}
              onClick={() => setReset(true)}
            >
              Kosongkan formulir
            </Button>
            <Button type="submit" disabled={!canEdit}>
              {props.pending
                ? "Menyimpan…"
                : props.patientOnly
                  ? "Simpan pasien"
                  : "Simpan pendaftaran"}
            </Button>
          </div>
        </form>
      </Panel>
      {!props.patientOnly && <Queue {...props} readOnly />}
      <Confirm
        open={reset}
        onClose={() => setReset(false)}
        title="Kosongkan formulir pendaftaran?"
        description="Isian yang belum disimpan akan dihapus. Pasien dan kunjungan tersimpan tetap tersedia. Tindakan ini tidak dapat membatalkan penyimpanan."
        onConfirm={() => {
          setForm(emptyPatient)
          setDirty(false)
          setVerified(false)
          setErrors({})
          setMessage("")
        }}
      />
    </div>
  )
}
function Patients(props: WorkspaceProps) {
  const [create, setCreate] = useState(false),
    [selected, setSelected] = useState("")
  const patient = props.data.patients.find((p) => p.id === selected)
  return (
    <div className="page-stack">
      <Panel
        title="Daftar pasien"
        description="Identitas pasien dan nomor rekam medis menjadi rujukan bersama untuk pelayanan."
        action={
          props.principal.capabilities.includes("patient.write") && (
            <Button
              disabled={!!props.locked}
              onClick={() => setCreate(!create)}
            >
              {create ? "Tutup formulir" : "Tambah pasien"}
            </Button>
          )
        }
      >
        <DataTable
          rows={props.data.patients}
          search={(p) => `${p.name} ${p.identity} ${p.rm}`}
          placeholder="Cari identitas pasien atau No. RM..."
          columns={[
            { label: "No. RM", render: (p) => p.rm },
            {
              label: "Pasien",
              render: (p) => (
                <>
                  <strong>{p.name}</strong>
                  <small className="block">{p.identity}</small>
                </>
              ),
            },
            { label: "Tanggal lahir", render: (p) => formatDate(p.birthDate) },
            { label: "Penjamin", render: (p) => p.payer },
            {
              label: "Aksi",
              render: (p) => (
                <Button variant="outline" onClick={() => setSelected(p.id)}>
                  Detail pasien
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      {create && (
        <Registration {...props} patientOnly onDone={() => setCreate(false)} />
      )}
      <Dialog
        open={!!patient}
        onOpenChange={(open) => {
          if (!open) setSelected("")
        }}
      >
        <DialogContent className="simrs-ui">
          <DialogHeader>
            <DialogTitle>{patient?.name}</DialogTitle>
            <DialogDescription>{patient?.rm} · DATA SINTETIS</DialogDescription>
          </DialogHeader>
          <dl className="summary-list">
            <div>
              <dt>Identitas</dt>
              <dd>{patient?.identity}</dd>
            </div>
            <div>
              <dt>Alamat fiktif</dt>
              <dd>{patient?.address}</dd>
            </div>
            <div>
              <dt>Kontak</dt>
              <dd>{patient?.contact || "Belum dicatat"}</dd>
            </div>
            <div>
              <dt>Riwayat kunjungan</dt>
              <dd>
                {props.data.visits
                  .filter((v) => v.patientId === patient?.id)
                  .map((v) => `${v.id} (${v.status})`)
                  .join(", ") || "Belum ada kunjungan"}
              </dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </div>
  )
}
function Appointments(props: WorkspaceProps) {
  const [patientId, setPatient] = useState(""),
    [date, setDate] = useState(""),
    [time, setTime] = useState("08:00"),
    [unit, setUnit] = useState(props.data.master.units[0]),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({})
  const [close, setClose] = useState<{
    id: string
    status: "Dibatalkan" | "Tidak datang"
  } | null>(null)
  const canEdit = allowed(props, "registration.write")
  useUnsavedChanges(dirty)
  function validate() {
    const parsed = new Date(date)
    return {
      patient: patientId ? "" : "Pilih pasien yang sudah terdaftar.",
      date:
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
          ? ""
          : "Pilih tanggal appointment yang valid.",
      time: /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
        ? ""
        : "Isi waktu appointment yang valid.",
    }
  }
  return (
    <div className="page-stack">
      <Panel
        title="Appointment pasien"
        description="Pencatatan janji temu sederhana sebelum pendaftaran kunjungan."
      >
        <Saved text={message} />
        <form
          className="page-stack"
          noValidate
          onChange={() => setDirty(true)}
          onSubmit={async (e) => {
            e.preventDefault()
            const check = validate()
            setErrors(check)
            if (Object.values(check).some(Boolean)) return
            if (
              await props.execute({
                type: "appointment.create",
                patientId,
                date,
                time,
                unit,
              })
            ) {
              setDirty(false)
              setMessage("Appointment berhasil dijadwalkan.")
            }
          }}
        >
          <div className="form-grid">
            <FormField
              id="appt-patient"
              label="Pasien terdaftar"
              required
              error={errors.patient}
            >
              <SelectControl
                id="appt-patient"
                label="Pasien appointment"
                options={[
                  option("", "Pilih pasien"),
                  ...props.data.patients.map((p) =>
                    option(p.id, `${p.rm} · ${p.name}`)
                  ),
                ]}
                value={patientId}
                disabled={!canEdit}
                onChange={(e) => setPatient(e.target.value)}
                onBlur={() =>
                  setErrors({ ...errors, patient: validate().patient })
                }
              />
            </FormField>
            <FormField id="appt-unit" label="Poli" required>
              <SelectControl
                id="appt-unit"
                label="Poli appointment"
                options={props.data.master.units}
                value={unit}
                disabled={!canEdit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </FormField>
            <FormField
              id="appt-date"
              label="Tanggal"
              required
              error={errors.date}
            >
              <Input
                id="appt-date"
                type="date"
                value={date}
                required
                disabled={!canEdit}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setErrors({ ...errors, date: validate().date })}
              />
            </FormField>
            <FormField
              id="appt-time"
              label="Waktu (WIB)"
              required
              error={errors.time}
            >
              <Input
                id="appt-time"
                type="time"
                value={time}
                required
                disabled={!canEdit}
                onChange={(e) => setTime(e.target.value)}
                onBlur={() => setErrors({ ...errors, time: validate().time })}
              />
            </FormField>
          </div>
          <div className="form-actions">
            <Button disabled={!canEdit || !patientId || !date}>
              Simpan appointment
            </Button>
          </div>
        </form>
      </Panel>
      <Panel title="Daftar appointment">
        <DataTable
          rows={props.data.appointments}
          search={(a) =>
            `${a.id} ${props.data.patients.find((p) => p.id === a.patientId)?.name}`
          }
          columns={[
            { label: "Appointment", render: (a) => a.id },
            {
              label: "Pasien",
              render: (a) =>
                props.data.patients.find((p) => p.id === a.patientId)?.name,
            },
            {
              label: "Jadwal",
              render: (a) => `${formatDate(a.date)} · ${a.time} WIB`,
            },
            { label: "Status", render: (a) => <Status>{a.status}</Status> },
            {
              label: "Aksi",
              render: (a) => (
                <div className="row-actions">
                  <Button
                    disabled={!canEdit || a.status !== "Terjadwal"}
                    variant="outline"
                    onClick={() => setClose({ id: a.id, status: "Dibatalkan" })}
                  >
                    Batalkan
                  </Button>
                  <Button
                    disabled={!canEdit || a.status !== "Terjadwal"}
                    variant="outline"
                    onClick={() =>
                      setClose({ id: a.id, status: "Tidak datang" })
                    }
                  >
                    Tidak datang
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Panel>
      <Confirm
        open={!!close}
        onClose={() => setClose(null)}
        title={`${close?.status} · ${close?.id}?`}
        description="Appointment ini tidak dapat dipakai untuk pendaftaran setelah ditutup. Riwayat dan alasan tetap tersimpan. Buat appointment baru bila diperlukan."
        requireReason
        onConfirm={(reason) =>
          close
            ? props.execute({ type: "appointment.close", ...close, reason })
            : false
        }
      />
    </div>
  )
}
function Queue(props: WorkspaceProps & { readOnly?: boolean }) {
  const [filter, setFilter] = useState("Semua status"),
    [close, setClose] = useState<{
      id: string
      status: "Dibatalkan" | "Tidak datang"
    } | null>(null)
  const canEdit = !props.readOnly && allowed(props, "queue.write")
  return (
    <Panel
      title="Antrean dan kunjungan"
      description="Pendaftaran → pemanggilan → verifikasi unit → pelayanan → selesai."
    >
      <DataTable
        rows={props.data.visits.filter(
          (v) => filter === "Semua status" || v.status === filter
        )}
        search={(v) =>
          `${v.id} ${v.queue} ${props.data.patients.find((p) => p.id === v.patientId)?.name}`
        }
        placeholder="Cari kunjungan / pasien / antrean..."
        filters={
          <SelectControl
            label="Status antrean"
            options={[
              "Semua status",
              "Menunggu",
              "Dipanggil",
              "Dilayani",
              "Selesai",
              "Dibatalkan",
              "Tidak datang",
            ]}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        }
        columns={[
          { label: "Antrean", render: (v) => <strong>{v.queue}</strong> },
          {
            label: "Kunjungan / pasien",
            render: (v) => (
              <>
                {v.id}
                <small className="block">
                  {props.data.patients.find((p) => p.id === v.patientId)?.name}
                </small>
              </>
            ),
          },
          {
            label: "Poli / kedatangan",
            render: (v) => (
              <>
                {v.unit}
                <small className="block">{v.arrival}</small>
              </>
            ),
          },
          {
            label: "Status",
            render: (v) => (
              <>
                <Status>{v.status}</Status>
                <small className="block">{formatTime(v.savedAt)} WIB</small>
              </>
            ),
          },
          {
            label: "Aksi",
            render: (v) =>
              canEdit && ["Menunggu", "Dipanggil"].includes(v.status) ? (
                <div className="row-actions">
                  {v.status === "Menunggu" && (
                    <Button
                      onClick={() =>
                        void props.execute({
                          type: "queue.transition",
                          id: v.id,
                          status: "Dipanggil",
                        })
                      }
                    >
                      Panggil
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setClose({ id: v.id, status: "Dibatalkan" })}
                  >
                    Batalkan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setClose({ id: v.id, status: "Tidak datang" })
                    }
                  >
                    Tidak datang
                  </Button>
                </div>
              ) : (
                <small>{v.cancelReason || "Lihat status pelayanan"}</small>
              ),
          },
        ]}
      />
      <Confirm
        open={!!close}
        onClose={() => setClose(null)}
        title={`${close?.status} · ${close?.id}?`}
        description="Kunjungan dan tagihan administrasi akan ditutup. Data tetap tersedia untuk audit. Tindakan tidak dapat dibatalkan; buat kunjungan baru jika pasien kembali."
        requireReason
        onConfirm={(reason) =>
          close
            ? props.execute({ type: "queue.transition", ...close, reason })
            : false
        }
      />
    </Panel>
  )
}
function Clinical(props: WorkspaceProps) {
  const [selected, setSelected] = useState("")
  const [dirty, setDirty] = useState(false)
  const visit =
    props.data.visits.find((v) => v.id === selected) ?? props.data.visits[0]
  if (!visit)
    return (
      <EmptyState
        title="Belum ada kunjungan"
        description="Pendaftaran yang tersimpan akan tersedia untuk verifikasi dan pelayanan."
      />
    )
  return (
    <div className="page-stack">
      <SelectControl
        label="Pilih kunjungan pelayanan"
        options={props.data.visits.map((v) =>
          option(
            v.id,
            `${v.id} · ${props.data.patients.find((p) => p.id === v.patientId)?.name} · ${v.status}`
          )
        )}
        value={visit.id}
        onChange={(e) => {
          if (
            dirty &&
            !window.confirm(
              "Catatan belum disimpan. Pindah ke kunjungan lain dan abaikan perubahan?"
            )
          )
            return
          setDirty(false)
          setSelected(e.target.value)
        }}
      />
      <RecordEditor
        key={`${visit.id}-${visit.record.versions.length}`}
        {...props}
        visit={visit}
        dirty={dirty}
        onDirtyChange={setDirty}
      />
    </div>
  )
}
function RecordEditor(
  props: WorkspaceProps & {
    visit: Visit
    dirty: boolean
    onDirtyChange: (dirty: boolean) => void
  }
) {
  const { visit } = props
  const dirty = props.dirty,
    setDirty = props.onDirtyChange
  const patient = props.data.patients.find((p) => p.id === visit.patientId)!
  const [data, setData] = useState<RecordInput>(visit.record.data),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [correct, setCorrect] = useState(false),
    [confirm, setConfirm] = useState<"final" | "complete" | "correct" | null>(
      null
    ),
    [history, setHistory] = useState(false)
  const write =
      allowed(props, "record.write") &&
      !["Dibatalkan", "Tidak datang"].includes(visit.status),
    finalize = allowed(props, "record.finalize")
  const locked = !write || (visit.record.finalized && !correct)
  useUnsavedChanges(dirty)
  function update(key: keyof RecordInput, value: string | string[]) {
    setData({ ...data, [key]: value })
    setDirty(true)
  }
  const recordFields: [
    keyof Omit<RecordInput, "procedureIds" | "diagnosisId">,
    string,
  ][] = [
    ["complaint", "Keluhan / alasan kunjungan"],
    ["examination", "Pemeriksaan"],
    ["note", "Catatan pelayanan"],
    ["result", "Hasil / keterangan lampiran sintetis"],
    ["followUp", "Tindak lanjut"],
    ["referral", "Rujukan / unit tujuan"],
  ]
  async function save() {
    const check = validateRecord(data, props.data.master)
    setErrors(check)
    if (Object.keys(check).length) return false
    const ok = await props.execute({ type: "record.save", id: visit.id, data })
    if (ok) setDirty(false)
    return ok
  }
  return (
    <div className="page-stack">
      <Panel
        title="Kunjungan rawat jalan"
        description={`${visit.id} · ${patient.rm} · ${patient.name}`}
        action={<Status>{visit.status}</Status>}
      >
        <dl className="detail-grid">
          <div>
            <dt>Identitas</dt>
            <dd>
              {patient.identity} · {formatDate(patient.birthDate)}
            </dd>
          </div>
          <div>
            <dt>Tujuan</dt>
            <dd>
              {visit.unit} · {visit.payer}
            </dd>
          </div>
          <div>
            <dt>Verifikasi unit</dt>
            <dd>{visit.verified ? "Terverifikasi" : "Belum diverifikasi"}</dd>
          </div>
          <div>
            <dt>Terakhir tersimpan</dt>
            <dd>
              {formatDate(visit.savedAt)} · {formatTime(visit.savedAt)} WIB
            </dd>
          </div>
        </dl>
        <div className="form-actions">
          {!visit.verified && (
            <Button
              disabled={
                !write || !["Menunggu", "Dipanggil"].includes(visit.status)
              }
              onClick={() =>
                void props.execute({ type: "visit.verify", id: visit.id })
              }
            >
              Verifikasi kunjungan
            </Button>
          )}
          {visit.status === "Menunggu" && (
            <Button
              disabled={!allowed(props, "queue.write")}
              onClick={() =>
                void props.execute({
                  type: "queue.transition",
                  id: visit.id,
                  status: "Dipanggil",
                })
              }
            >
              Panggil pasien
            </Button>
          )}
          {visit.status === "Dipanggil" && (
            <Button
              disabled={!finalize || !visit.verified}
              onClick={() =>
                void props.execute({
                  type: "queue.transition",
                  id: visit.id,
                  status: "Dilayani",
                })
              }
            >
              Mulai pelayanan
            </Button>
          )}
          {visit.status === "Dilayani" && (
            <Button
              disabled={!finalize || !visit.record.finalized || dirty}
              onClick={() => setConfirm("complete")}
            >
              Selesaikan pelayanan
            </Button>
          )}
        </div>
      </Panel>
      <Panel
        title="Rekam medis"
        description="Dokumentasi pelayanan sintetis. Isi berdasarkan fakta yang diberikan; tidak ada rekomendasi diagnosis otomatis."
        action={
          <Status>{visit.record.finalized ? "Terkunci" : "Draft"}</Status>
        }
      >
        <div className="page-stack">
          {visit.record.finalized && (
            <Notice
              title={
                correct
                  ? "Koreksi sebagai versi baru"
                  : "Dokumen final · hanya dapat dibaca"
              }
            >
              {correct
                ? "Versi sebelumnya tetap disimpan. Koreksi memerlukan alasan dan tidak mengubah tindakan yang sudah ditagihkan."
                : "Gunakan koreksi beralasan untuk memperbarui catatan; dokumen asli tidak ditimpa."}
            </Notice>
          )}
          {Object.values(errors).some(Boolean) && (
            <Notice danger title="Periksa rekam medis">
              {Object.values(errors).join(" ")}
            </Notice>
          )}
          <div className="form-grid">
            {recordFields.map(([key, label]) => (
              <FormField
                key={key}
                id={`record-${key}`}
                label={label}
                required={key === "note"}
                error={errors[key]}
              >
                <Textarea
                  id={`record-${key}`}
                  value={data[key]}
                  disabled={locked}
                  onChange={(e) => update(key, e.target.value)}
                  onBlur={() => {
                    const check = validateRecord(data, props.data.master, true)
                    setErrors({ ...errors, [key]: check[key] ?? "" })
                  }}
                />
              </FormField>
            ))}
            <FormField id="record-diagnosis" label="Diagnosis contoh">
              <SelectControl
                id="record-diagnosis"
                label="Diagnosis contoh"
                options={[
                  option("", "Belum dicatat"),
                  ...props.data.master.diagnoses.map((d) =>
                    option(d.id, `${d.id} · ${d.name}`)
                  ),
                ]}
                value={data.diagnosisId}
                disabled={locked}
                onChange={(e) => update("diagnosisId", e.target.value)}
              />
            </FormField>
            <div>
              <p className="field-caption">Tindakan yang dilakukan</p>
              {props.data.master.services
                .filter((s) => s.kind === "procedure")
                .map((s) => (
                  <label className="check-line" key={s.id}>
                    <input
                      type="checkbox"
                      checked={data.procedureIds.includes(s.id)}
                      disabled={locked || correct}
                      onChange={(e) =>
                        update(
                          "procedureIds",
                          e.target.checked
                            ? [...data.procedureIds, s.id]
                            : data.procedureIds.filter((id) => id !== s.id)
                        )
                      }
                    />
                    {s.name} · {rupiah(s.amount)}
                  </label>
                ))}
            </div>
          </div>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setHistory(true)}>
              Riwayat perubahan ({visit.record.versions.length})
            </Button>
            {visit.record.finalized ? (
              <Button
                disabled={!finalize}
                onClick={() =>
                  correct ? setConfirm("correct") : setCorrect(true)
                }
              >
                {correct ? "Simpan koreksi" : "Koreksi catatan"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={locked}
                  onClick={() => void save()}
                >
                  Simpan rekam medis
                </Button>
                <Button
                  disabled={!finalize || visit.status !== "Dilayani" || dirty}
                  onClick={() => setConfirm("final")}
                >
                  Finalisasi rekam medis
                </Button>
              </>
            )}
          </div>
          {dirty && (
            <small className="text-muted-foreground">
              Perubahan belum disimpan. Simpan catatan sebelum finalisasi atau
              penyelesaian pelayanan.
            </small>
          )}
        </div>
      </Panel>
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm === "correct" ? "Simpan koreksi" : confirm === "complete" ? "Selesaikan pelayanan" : "Finalisasi rekam medis"} · ${visit.id}?`}
        description={
          confirm === "correct"
            ? "Versi baru ditambahkan dengan alasan. Versi sebelumnya tetap dapat dibaca dan tindakan/tagihan tidak diubah."
            : confirm === "complete"
              ? "Kunjungan menjadi selesai. Layanan dan tindakan yang tercatat membentuk rincian tagihan. Proses pelayanan tidak dapat dibuka ulang."
              : "Catatan menjadi baca saja. Perubahan berikutnya harus melalui koreksi beralasan; versi asli tetap disimpan."
        }
        requireReason={confirm === "correct"}
        onConfirm={async (reason) => {
          if (confirm === "correct") {
            const check = validateRecord(data, props.data.master, true)
            setErrors(check)
            if (Object.keys(check).length) return false
          }
          const ok = await props.execute(
            confirm === "correct"
              ? { type: "record.correct", id: visit.id, data, reason }
              : confirm === "complete"
                ? { type: "queue.transition", id: visit.id, status: "Selesai" }
                : { type: "record.finalize", id: visit.id }
          )
          if (ok) setDirty(false)
          return ok
        }}
      />
      <Dialog open={history} onOpenChange={setHistory}>
        <DialogContent className="simrs-ui wide-dialog">
          <DialogHeader>
            <DialogTitle>Riwayat rekam medis · {visit.id}</DialogTitle>
            <DialogDescription>
              Versi sebelumnya tetap tersimpan setelah finalisasi dan koreksi.
            </DialogDescription>
          </DialogHeader>
          {visit.record.versions.length ? (
            visit.record.versions.map((v) => (
              <div className="record-version" key={v.version}>
                <strong>
                  Versi {v.version} · {v.finalized ? "Final" : "Draft"}
                </strong>
                <small className="block">
                  {v.author} · {formatDate(v.time)} {formatTime(v.time)} WIB
                </small>
                <p>{v.reason || "Penyimpanan catatan"}</p>
                <dl className="summary-list">
                  {Object.entries(v.data).map(([key, value]) => (
                    <div key={key}>
                      <dt>
                        {recordFields.find(([field]) => field === key)?.[1] ??
                          (key === "diagnosisId" ? "Diagnosis" : "Tindakan")}
                      </dt>
                      <dd>
                        {Array.isArray(value)
                          ? value.join(", ") || "—"
                          : value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))
          ) : (
            <EmptyState description="Belum ada catatan yang disimpan." />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
function Finance(props: WorkspaceProps & { cashier: boolean }) {
  const [selected, setSelected] = useState(""),
    [kind, setKind] = useState<Payment["kind"]>("Pembayaran"),
    [amount, setAmount] = useState(""),
    [confirm, setConfirm] = useState<"payment" | "cancel" | null>(null),
    [message, setMessage] = useState(""),
    [amountError, setAmountError] = useState("")
  const visit =
    props.data.visits.find((v) => v.id === selected) ?? props.data.visits[0]
  const summary = visit ? billSummary(visit) : null
  const canPay = allowed(props, "cashier.write")
  useUnsavedChanges(!!amount)
  function checkAmount() {
    const value = Number(amount)
    const error =
      !Number.isInteger(value) || value <= 0 || value > 100_000_000
        ? "Masukkan Rupiah bulat positif, maksimal 100.000.000."
        : summary && kind === "Refund" && value > summary.paid
          ? "Refund melebihi saldo pembayaran."
          : summary &&
              ["Pembayaran", "Ditolak"].includes(kind) &&
              value > summary.due
            ? "Nominal melebihi sisa tagihan."
            : ""
    setAmountError(error)
    return !error
  }
  return (
    <div className="page-stack">
      <Panel
        title={props.cashier ? "Kasir · pembayaran simulasi" : "Daftar tagihan"}
        description="Tagihan berasal dari administrasi pendaftaran dan pelayanan/tindakan yang diselesaikan."
      >
        <DataTable
          rows={props.data.visits}
          search={(v) =>
            `${v.id} ${props.data.patients.find((p) => p.id === v.patientId)?.name}`
          }
          columns={[
            {
              label: "Kunjungan / pasien",
              render: (v) => (
                <>
                  {v.id}
                  <small className="block">
                    {
                      props.data.patients.find((p) => p.id === v.patientId)
                        ?.name
                    }
                  </small>
                </>
              ),
            },
            { label: "Tagihan", render: (v) => rupiah(billSummary(v).total) },
            {
              label: "Saldo dibayar",
              render: (v) => rupiah(billSummary(v).paid),
            },
            {
              label: "Status",
              render: (v) => <Status>{billSummary(v).status}</Status>,
            },
            {
              label: "Aksi",
              render: (v) => (
                <Button
                  variant={visit?.id === v.id ? "default" : "outline"}
                  onClick={() => {
                    if (
                      amount &&
                      !window.confirm(
                        "Nominal belum disimpan. Pindah tagihan dan abaikan perubahan?"
                      )
                    )
                      return
                    setSelected(v.id)
                    setAmount("")
                    setAmountError("")
                    setMessage("")
                  }}
                >
                  Rincian tagihan
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      {visit && summary && (
        <Panel
          title={`Rincian ${visit.id}`}
          description={`${props.data.patients.find((p) => p.id === visit.patientId)?.name} · ${visit.payer} · ${visit.status}`}
        >
          <div className="page-stack">
            <Saved text={message} />
            <DataTable
              rows={visit.charges}
              search={(c) => c.name}
              columns={[
                {
                  label: "Layanan aktual",
                  render: (c) => (
                    <>
                      {c.name}
                      <small className="block">{c.serviceId}</small>
                    </>
                  ),
                },
                { label: "Jumlah", render: (c) => c.quantity },
                {
                  label: "Tarif saat dibebankan",
                  render: (c) => rupiah(c.amount),
                },
                {
                  label: "Status",
                  render: (c) => (
                    <>
                      {c.cancelled ? `Dibatalkan: ${c.reason}` : "Dibebankan"}
                    </>
                  ),
                },
              ]}
            />
            <dl className="detail-grid">
              <div>
                <dt>Total tagihan</dt>
                <dd>{rupiah(summary.total)}</dd>
              </div>
              <div>
                <dt>Saldo pembayaran</dt>
                <dd>{rupiah(summary.paid)}</dd>
              </div>
              <div>
                <dt>Sisa tagihan</dt>
                <dd>{rupiah(summary.due)}</dd>
              </div>
              <div>
                <dt>Saldo deposit berlebih</dt>
                <dd>{rupiah(summary.credit)}</dd>
              </div>
            </dl>
            {props.cashier && (
              <>
                <Notice title="Seluruh transaksi adalah dummy">
                  Tidak ada pengiriman uang. Refund mengurangi saldo yang sudah
                  dicatat dan tetap menyimpan riwayat transaksi.
                </Notice>
                <div className="form-grid">
                  <FormField id="payment-kind" label="Jenis transaksi">
                    <SelectControl
                      id="payment-kind"
                      label="Jenis transaksi"
                      options={["Pembayaran", "Deposit", "Refund", "Ditolak"]}
                      value={kind}
                      disabled={!canPay}
                      onChange={(e) => {
                        setKind(e.target.value as Payment["kind"])
                        setAmount("")
                        setAmountError("")
                      }}
                    />
                  </FormField>
                  <FormField
                    id="payment-amount"
                    label="Nominal (Rp)"
                    required
                    error={amountError}
                  >
                    <Input
                      id="payment-amount"
                      type="number"
                      min={1}
                      step={1}
                      value={amount}
                      placeholder={String(
                        kind === "Refund" ? summary.paid : summary.due
                      )}
                      disabled={!canPay}
                      aria-invalid={!!amountError}
                      aria-describedby={
                        amountError ? "payment-amount-error" : undefined
                      }
                      onBlur={checkAmount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setAmountError("")
                      }}
                    />
                  </FormField>
                </div>
                <div className="form-actions">
                  <Button
                    variant="outline"
                    disabled={
                      !canPay ||
                      summary.paid > 0 ||
                      summary.status === "Dibatalkan" ||
                      visit.status !== "Selesai"
                    }
                    onClick={() => setConfirm("cancel")}
                  >
                    Batalkan tagihan
                  </Button>
                  <Button
                    disabled={!canPay || !amount || Number(amount) <= 0}
                    onClick={() => {
                      if (checkAmount()) setConfirm("payment")
                    }}
                  >
                    Catat {kind.toLowerCase()} dummy
                  </Button>
                </div>
              </>
            )}
            <h3>Riwayat pembayaran</h3>
            <DataTable
              rows={visit.payments}
              search={(p) => `${p.kind} ${p.reason}`}
              columns={[
                { label: "Jenis", render: (p) => <Status>{p.kind}</Status> },
                { label: "Nominal", render: (p) => rupiah(p.amount) },
                { label: "Waktu", render: (p) => `${formatTime(p.time)} WIB` },
                { label: "Keterangan", render: (p) => p.reason },
              ]}
            />
          </div>
        </Panel>
      )}
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm === "cancel" ? "Batalkan tagihan" : `${kind} ${rupiah(Number(amount))}`} · ${visit?.id}?`}
        description={
          confirm === "cancel"
            ? "Seluruh rincian tagihan ditandai batal, tanpa menghapus layanan atau riwayat. Tindakan ini tidak dapat dibatalkan."
            : "Transaksi dummy akan dicatat pada riwayat. Pembayaran tidak dihapus; pengembaliannya menggunakan refund beralasan dengan batas saldo tersedia."
        }
        requireReason
        onConfirm={async (reason) => {
          if (!visit) return false
          const ok = await props.execute(
            confirm === "cancel"
              ? { type: "billing.cancel", id: visit.id, reason }
              : {
                  type: "payment.record",
                  id: visit.id,
                  kind,
                  amount: Number(amount),
                  reason,
                }
          )
          if (ok) {
            setAmount("")
            setMessage("Transaksi berhasil dicatat.")
          }
          return ok
        }}
      />
    </div>
  )
}
function Master(props: WorkspaceProps) {
  const [category, setCategory] = useState("Semua kategori"),
    [name, setName] = useState(""),
    [detail, setDetail] = useState(""),
    [unitOpen, setUnitOpen] = useState(false),
    [tariffId, setTariffId] = useState(""),
    [amount, setAmount] = useState(""),
    [tariffOpen, setTariffOpen] = useState(false),
    [tariffDirty, setTariffDirty] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState("")
  const canEdit = allowed(props, "master.write")
  const unitDirty = !!(name || detail)
  useUnsavedChanges((unitOpen && unitDirty) || (tariffOpen && tariffDirty))
  const requiredText = (value: string) =>
    value.trim() ? "" : "Kolom ini wajib diisi."
  return (
    <div className="page-stack">
      <Saved text={message} />
      <Panel
        title={props.data.master.hospital}
        description="Struktur, SDM, layanan, penjamin, diagnosis, dan tindakan dari master rumah sakit."
        action={
          <Button disabled={!canEdit} onClick={() => setUnitOpen(true)}>
            Tambah unit simulasi
          </Button>
        }
      >
        <DataTable
          rows={props.data.master.rows.filter(
            (r) => category === "Semua kategori" || r.category === category
          )}
          search={(r) => `${r.id} ${r.name} ${r.detail}`}
          placeholder="Cari kode atau nama master..."
          filters={
            <SelectControl
              label="Kategori master"
              options={[
                "Semua kategori",
                ...new Set(props.data.master.rows.map((r) => r.category)),
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          }
          columns={[
            { label: "Kode", render: (r) => r.id },
            {
              label: "Nama / kategori",
              render: (r) => (
                <>
                  <strong>{r.name}</strong>
                  <small className="block">{r.category}</small>
                </>
              ),
            },
            { label: "Keterangan", render: (r) => r.detail },
            { label: "Status", render: (r) => <Status>{r.status}</Status> },
          ]}
        />
      </Panel>
      <Panel
        title="Layanan dan tarif"
        description="Perubahan master berlaku untuk snapshot baru. Tagihan yang sudah terbentuk tetap memakai tarif saat layanan dibebankan."
      >
        <DataTable
          rows={props.data.master.services}
          search={(s) => s.name}
          columns={[
            { label: "Layanan", render: (s) => s.name },
            { label: "Tarif", render: (s) => rupiah(s.amount) },
            {
              label: "Aksi",
              render: (s) => (
                <Button
                  disabled={!canEdit}
                  variant="outline"
                  onClick={() => {
                    setTariffId(s.id)
                    setAmount(String(s.amount))
                    setTariffDirty(false)
                    setTariffOpen(true)
                  }}
                >
                  Ubah tarif
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      <Dialog
        open={unitOpen}
        onOpenChange={(open) => {
          if (
            !open &&
            unitDirty &&
            !window.confirm("Isian unit belum disimpan. Tutup formulir?")
          )
            return
          setUnitOpen(open)
        }}
      >
        <DialogContent className="simrs-ui">
          <DialogHeader>
            <DialogTitle>Tambah unit simulasi</DialogTitle>
            <DialogDescription>
              Menambahkan struktur master; tidak mengubah snapshot sesi yang
              sudah ada.
            </DialogDescription>
          </DialogHeader>
          <form
            className="page-stack"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault()
              const check = {
                name: requiredText(name),
                detail: requiredText(detail),
              }
              setErrors(check)
              if (Object.values(check).some(Boolean)) return
              if (await props.execute({ type: "master.unit", name, detail })) {
                setUnitOpen(false)
                setName("")
                setDetail("")
                setMessage("Unit rumah sakit berhasil disimpan.")
              }
            }}
          >
            <FormField
              id="unit-name"
              label="Nama unit sintetis"
              required
              error={errors.name}
            >
              <Input
                id="unit-name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                onBlur={() =>
                  setErrors({ ...errors, name: requiredText(name) })
                }
              />
            </FormField>
            <FormField
              id="unit-detail"
              label="Keterangan"
              required
              error={errors.detail}
            >
              <Textarea
                id="unit-detail"
                value={detail}
                required
                onChange={(e) => setDetail(e.target.value)}
                onBlur={() =>
                  setErrors({ ...errors, detail: requiredText(detail) })
                }
              />
            </FormField>
            <Button disabled={!canEdit}>Simpan unit</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={tariffOpen}
        onOpenChange={(open) => {
          if (
            !open &&
            tariffDirty &&
            !window.confirm("Perubahan tarif belum disimpan. Tutup formulir?")
          )
            return
          setTariffOpen(open)
        }}
      >
        <DialogContent className="simrs-ui">
          <DialogHeader>
            <DialogTitle>Ubah tarif master</DialogTitle>
            <DialogDescription>
              {tariffId} · Perubahan dicatat dengan alasan; snapshot lama tetap
              utuh.
            </DialogDescription>
          </DialogHeader>
          <TariffForm
            key={tariffId}
            amount={amount}
            setAmount={setAmount}
            onDirtyChange={setTariffDirty}
            disabled={!canEdit}
            save={(reason) =>
              props
                .execute({
                  type: "master.tariff",
                  id: tariffId,
                  amount: Number(amount),
                  reason,
                })
                .then((ok) => {
                  if (ok) {
                    setTariffOpen(false)
                    setTariffDirty(false)
                    setMessage("Perubahan tarif tersimpan beserta alasan.")
                  }
                  return ok
                })
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
function TariffForm({
  amount,
  setAmount,
  disabled,
  save,
  onDirtyChange,
}: {
  amount: string
  setAmount: (v: string) => void
  disabled: boolean
  save: (reason: string) => Promise<boolean>
  onDirtyChange: (dirty: boolean) => void
}) {
  const [reason, setReason] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  function validate() {
    return {
      amount:
        Number.isInteger(Number(amount)) &&
        Number(amount) > 0 &&
        Number(amount) <= 100_000_000
          ? ""
          : "Masukkan Rupiah bulat positif, maksimal 100.000.000.",
      reason: reason.trim() ? "" : "Jelaskan alasan perubahan tarif.",
    }
  }
  return (
    <form
      className="page-stack"
      noValidate
      onChange={() => onDirtyChange(true)}
      onSubmit={(e) => {
        e.preventDefault()
        const check = validate()
        setErrors(check)
        if (!Object.values(check).some(Boolean)) void save(reason)
      }}
    >
      <FormField
        id="tariff-amount"
        label="Tarif baru (Rp)"
        required
        error={errors.amount}
      >
        <Input
          id="tariff-amount"
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setErrors({ ...errors, amount: validate().amount })}
          required
        />
      </FormField>
      <FormField
        id="tariff-reason"
        label="Alasan perubahan"
        required
        error={errors.reason}
      >
        <Textarea
          id="tariff-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setErrors({ ...errors, reason: validate().reason })}
          required
        />
      </FormField>
      <Button disabled={disabled}>Konfirmasi perubahan tarif</Button>
    </form>
  )
}
function OperationalReport(props: WorkspaceProps & { dashboard?: boolean }) {
  const stats = operationalSummary(props.data)
  function download() {
    const rows = [
      "DOKUMEN SIMULASI — LAPORAN OPERASIONAL",
      props.data.master.hospital,
      "Kunjungan\tAntrean\tStatus\tTagihan\tSaldo dibayar",
      ...props.data.visits.map(
        (v) =>
          `${v.id}\t${v.queue}\t${v.status}\t${billSummary(v).total}\t${billSummary(v).paid}`
      ),
    ].join("\n")
    const url = URL.createObjectURL(
      new Blob([rows], { type: "text/plain;charset=utf-8" })
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "SIMRS-DOKUMEN-SIMULASI-operasional.txt"
    a.click()
    URL.revokeObjectURL(url)
  }
  const financial = props.principal.capabilities.includes("billing.read")
  return (
    <div className="page-stack">
      <div className="core-metrics">
        {[
          ["Pasien terdaftar", stats.patients, "Identitas pasien unik"],
          ["Kunjungan", stats.visits, "Seluruh kunjungan tercatat"],
          ["Antrean menunggu", stats.waiting, "Menunggu atau dipanggil"],
          ["Pelayanan selesai", stats.completed, "Kunjungan berstatus Selesai"],
        ].map(([label, value, description]) => (
          <Panel key={String(label)} title={String(label)}>
            <strong className="text-3xl">{value}</strong>
            <p className="text-muted-foreground">{description}</p>
          </Panel>
        ))}
      </div>
      {financial && (
        <Panel
          title="Ringkasan transaksi dummy"
          action={
            !props.dashboard && (
              <Button variant="outline" onClick={download}>
                Unduh laporan operasional
              </Button>
            )
          }
        >
          <dl className="detail-grid">
            <div>
              <dt>Tagihan aktif</dt>
              <dd>{rupiah(stats.charges)}</dd>
            </div>
            <div>
              <dt>Saldo pembayaran setelah refund</dt>
              <dd>{rupiah(stats.received)}</dd>
            </div>
            <div>
              <dt>Sisa tagihan</dt>
              <dd>{rupiah(stats.outstanding)}</dd>
            </div>
            <div>
              <dt>Dibatalkan / tidak datang</dt>
              <dd>{stats.cancelled} kunjungan</dd>
            </div>
          </dl>
        </Panel>
      )}
      <Queue {...props} readOnly />
      <Notice title="Definisi laporan">
        Angka berasal dari transaksi pada lingkungan yang sedang dibuka.
        Pembayaran merupakan saldo deposit dan pelunasan dikurangi refund, bukan
        pendapatan rumah sakit produksi.
      </Notice>
    </div>
  )
}
