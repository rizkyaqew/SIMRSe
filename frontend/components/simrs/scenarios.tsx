"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Add01Icon, File01Icon, Clock01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup } from "@/components/ui/field"
import { useDemo } from "./provider"
import { PageHeading } from "./dashboard"
import {
  Confirm,
  EmptyState,
  FormField,
  Icon,
  Notice,
  Panel,
  SelectControl,
  Status,
  useUnsavedChanges,
} from "./ui"
import { academic } from "@/lib/simrs/data"
import type { Scenario } from "@/lib/simrs/types"

export function Scenarios({ archive = false }: { archive?: boolean }) {
  const { state, dispatch } = useDemo()
  const params = useSearchParams()
  const [editing, setEditing] = useState<Scenario | "new" | null>(
    params.get("buat") === "1" ? "new" : null
  )
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("Semua status")
  const rows = state.scenarios.filter(
    (s) =>
      (archive ? s.status === "Diarsipkan" : s.status !== "Diarsipkan") &&
      (filter === "Semua status" || s.status === filter) &&
      `${s.title} ${s.id}`.toLowerCase().includes(query.toLowerCase())
  )
  if (editing)
    return (
      <ScenarioEditor
        key={editing === "new" ? "new" : editing.id}
        scenario={editing === "new" ? undefined : editing}
        onClose={() => setEditing(null)}
        onSave={async (scenario) => {
          const ok = await dispatch({ type: "scenario", scenario })
          if (ok) setEditing(null)
          return ok
        }}
      />
    )
  return (
    <div className="page-stack">
      <PageHeading
        title={archive ? "Arsip skenario" : "Skenario praktikum"}
        description="Rancang pengalaman belajar dari alur administrasi rumah sakit."
        action={
          !archive && (
            <Button onClick={() => setEditing("new")}>
              <Icon icon={Add01Icon} />
              Buat skenario
            </Button>
          )
        }
      />
      <Panel
        title={archive ? "Skenario diarsipkan" : "Katalog skenario"}
        description={`${academic.semester} ${academic.year} · ${academic.course}`}
      >
        <div className="page-stack">
          <div className="table-tools">
            <Input
              aria-label="Cari skenario"
              className="max-w-sm"
              placeholder="Cari nama atau kode skenario..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SelectControl
              label="Status skenario"
              options={["Semua status", "Draft", "Uji Coba", "Dipublikasikan"]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="module-card-grid">
            {rows.map((s) => (
              <Panel key={s.id} title={s.title}>
                <div className="scenario-card">
                  <div className="scenario-visual">
                    <Icon icon={File01Icon} />
                    <Status>{s.status}</Status>
                  </div>
                  <p>{s.objective}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon icon={Clock01Icon} />
                    <span>
                      {s.duration} menit · {s.classroom}
                    </span>
                  </div>
                  <div className="form-actions">
                    <small>{s.id} · v1</small>
                    <Button variant="outline" onClick={() => setEditing(s)}>
                      {s.status === "Dipublikasikan"
                        ? "Lihat skenario"
                        : "Edit skenario"}
                    </Button>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
          {!rows.length && (
            <EmptyState
              title="Skenario belum tersedia"
              description={
                archive
                  ? "Skenario yang diarsipkan akan tampil di sini."
                  : "Sesuaikan pencarian atau buat skenario untuk kelas Anda."
              }
            />
          )}
        </div>
      </Panel>
    </div>
  )
}
function ScenarioEditor({
  scenario,
  onSave,
  onClose,
}: {
  scenario?: Scenario
  onSave: (scenario: Scenario) => Promise<boolean>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: scenario?.title ?? "",
    objective: scenario?.objective ?? "",
    context: scenario?.context ?? "",
    period: academic.year,
    semester: academic.semester,
    course: academic.course,
    classroom: academic.classroom,
    group: academic.group,
    duration: String(scenario?.duration ?? 60),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const [publish, setPublish] = useState(false)
  const locked =
    scenario?.status === "Dipublikasikan" || scenario?.status === "Diarsipkan"
  useUnsavedChanges(dirty)
  const update = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value })
    setDirty(true)
  }
  function validate() {
    const result: Record<string, string> = {}
    if (!form.title.trim()) result.title = "Isi nama skenario."
    if (form.objective.trim().length < 15)
      result.objective = "Jelaskan tujuan pembelajaran minimal 15 karakter."
    if (form.context.trim().length < 20)
      result.context = "Jelaskan konteks kasus minimal 20 karakter."
    if (
      !Number.isInteger(Number(form.duration)) ||
      Number(form.duration) < 5 ||
      Number(form.duration) > 240
    )
      result.duration = "Durasi harus 5–240 menit."
    setErrors(result)
    return Object.keys(result).length === 0
  }
  async function save(status: Scenario["status"]) {
    if (!validate() || locked) return false
    const ok = await onSave({
      ...form,
      id: scenario?.id ?? `SK-${Date.now()}`,
      duration: Number(form.duration),
      status,
    })
    if (ok) setDirty(false)
    return ok
  }
  return (
    <div className="page-stack">
      <PageHeading
        title={
          locked
            ? "Detail skenario praktikum"
            : scenario
              ? "Edit skenario praktikum"
              : "Buat skenario praktikum"
        }
        description="Tentukan konteks, tujuan, dan kondisi awal sebelum menyiapkan sesi."
        action={
          <Button
            variant="outline"
            onClick={() => {
              if (
                !dirty ||
                window.confirm("Perubahan belum disimpan. Kembali ke katalog?")
              )
                onClose()
            }}
          >
            Kembali ke katalog
          </Button>
        }
      />
      {locked && (
        <Notice title="Skenario terkunci">
          Skenario sudah dipublikasikan. Data tetap dapat dibaca agar penugasan
          peserta konsisten.
        </Notice>
      )}
      <div className="workspace-grid">
        <Panel
          title="Informasi dan tujuan pembelajaran"
          description="Kolom bertanda * wajib diisi."
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              save("Draft")
            }}
          >
            {Object.keys(errors).length > 0 && (
              <div className="mb-5">
                <Notice title="Periksa kembali formulir" danger>
                  Lengkapi kolom yang ditandai sebelum menyimpan skenario.
                </Notice>
              </div>
            )}
            <FieldGroup className="form-grid">
              {(
                [
                  ["period", "Tahun ajaran"],
                  ["semester", "Semester"],
                  ["course", "Mata kuliah"],
                  ["classroom", "Kelas"],
                  ["group", "Kelompok / mahasiswa"],
                ] as const
              ).map(([key, label]) => (
                <FormField key={key} id={key} label={label} required>
                  <SelectControl
                    id={key}
                    label={label}
                    value={form[key]}
                    options={[form[key]]}
                    disabled={locked}
                  />
                </FormField>
              ))}
              <FormField
                id="duration"
                label="Batas waktu (menit)"
                required
                error={errors.duration}
              >
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={240}
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                  onBlur={validate}
                  disabled={locked}
                  aria-invalid={!!errors.duration}
                  aria-describedby={
                    errors.duration ? "duration-error" : undefined
                  }
                />
              </FormField>
              <div className="form-full">
                <FormField
                  id="title"
                  label="Nama skenario"
                  required
                  error={errors.title}
                >
                  <Input
                    id="title"
                    value={form.title}
                    placeholder="Contoh: Alur pelayanan rawat jalan"
                    onChange={(e) => update("title", e.target.value)}
                    onBlur={validate}
                    disabled={locked}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                </FormField>
              </div>
              {(
                [
                  ["objective", "Tujuan pembelajaran"],
                  ["context", "Konteks kasus dan kondisi awal"],
                ] as const
              ).map(([key, label]) => (
                <div className="form-full" key={key}>
                  <FormField
                    id={key}
                    label={label}
                    required
                    error={errors[key]}
                  >
                    <Textarea
                      id={key}
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      onBlur={validate}
                      disabled={locked}
                      aria-invalid={!!errors[key]}
                      aria-describedby={
                        errors[key] ? `${key}-error` : undefined
                      }
                    />
                  </FormField>
                </div>
              ))}
            </FieldGroup>
            {!locked && (
              <div className="form-actions">
                <small>
                  {dirty
                    ? "Perubahan belum disimpan"
                    : "Data skenario simulasi"}
                </small>
                <Button type="submit" variant="outline">
                  Simpan draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => save("Uji Coba")}
                >
                  Simpan untuk uji coba
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (validate()) setPublish(true)
                  }}
                >
                  Publikasikan
                </Button>
              </div>
            )}
          </form>
        </Panel>
        <div className="page-stack">
          <Panel title="Ringkasan skenario">
            <dl className="summary-list">
              <div>
                <dt>Periode pembelajaran</dt>
                <dd>
                  {form.semester} {form.period}
                </dd>
              </div>
              <div>
                <dt>Kelas dan kelompok</dt>
                <dd>
                  {form.classroom} · {form.group}
                </dd>
              </div>
              <div>
                <dt>Durasi</dt>
                <dd>{form.duration} menit</dd>
              </div>
              <div>
                <dt>Data awal</dt>
                <dd>Pasien sintetis dan master Fase 1</dd>
              </div>
            </dl>
          </Panel>
          <Notice title="Dari tujuan menjadi pengalaman">
            Skenario menentukan kasus. Sesi menghubungkan skenario dengan
            jadwal, peserta, dan pembagian peran.
          </Notice>
        </div>
      </div>
      <Confirm
        open={publish}
        onClose={() => setPublish(false)}
        title="Publikasikan skenario?"
        description="Skenario dapat dipilih untuk sesi praktikum. Isi skenario akan terkunci agar penugasan peserta tidak berubah. Tindakan ini dicatat dalam audit demo."
        label="Ya, publikasikan"
        onConfirm={() => save("Dipublikasikan")}
      />
    </div>
  )
}
