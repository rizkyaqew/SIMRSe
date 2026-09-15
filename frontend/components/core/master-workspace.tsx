"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import {
  Confirm,
  DataTable,
  FormField,
  Notice,
  Panel,
  SelectControl,
  Status,
  useUnsavedChanges,
} from "@/components/platform/shared"
import {
  masterCategories,
  type MasterInput,
  type MasterRow,
} from "@/lib/core/types"
import { validateMaster } from "@/lib/core/master"
import { rupiah } from "@/lib/platform/format"
import type { WorkspaceProps } from "./workspace"

const blank: MasterInput = {
  category: "Unit & poli",
  name: "",
  detail: "",
  status: "Aktif",
}
export function MasterWorkspace(props: WorkspaceProps) {
  const [category, setCategory] = useState("Semua kategori")
  const [edit, setEdit] = useState<MasterInput | "hospital" | null>(null)
  const [message, setMessage] = useState("")
  const [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false)
  const canEdit =
    !props.locked &&
    !props.pending &&
    props.principal.capabilities.includes("master.write")
  useUnsavedChanges(dirty)
  function openRow(row: MasterRow) {
    const service = props.data.master.services.find((s) => s.id === row.id)
    setDirty(false)
    setEdit({
      ...row,
      category: row.category as MasterInput["category"],
      status: row.status as MasterInput["status"],
      ...(service ? { amount: service.amount } : {}),
    })
  }
  function close() {
    if (dirty) setDiscard(true)
    else setEdit(null)
  }
  return (
    <div className="page-stack">
      {message && <Notice title={message} />}
      <Notice title="Master terhubung ke formulir pelayanan">
        Poli, penjamin, layanan, diagnosis, dan tindakan aktif menjadi pilihan
        pada formulir operasional. Data Nonaktif tetap tercatat sebagai riwayat.
      </Notice>
      <Panel
        title={props.data.master.hospital}
        description="Seluruh katalog menggunakan data sintetis. Keterangan SDM/jadwal, ruang/bed, stok dan supplier merupakan data referensi dasar."
        action={
          <div className="row-actions">
            <Button
              variant="outline"
              disabled={!canEdit}
              onClick={() => {
                setDirty(false)
                setEdit("hospital")
              }}
            >
              Ubah identitas RS
            </Button>
            <Button
              disabled={!canEdit}
              onClick={() => {
                setDirty(false)
                setEdit({
                  ...blank,
                  category:
                    category === "Semua kategori"
                      ? blank.category
                      : (category as MasterInput["category"]),
                })
              }}
            >
              Tambah data master
            </Button>
          </div>
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
              options={["Semua kategori", ...masterCategories]}
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
            {
              label: "Aksi",
              render: (r) => (
                <Button
                  variant="outline"
                  disabled={!canEdit}
                  onClick={() => openRow(r)}
                >
                  Ubah data
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      <Panel
        title="Pilihan formulir yang terintegrasi"
        description="Pilihan aktif untuk pendaftaran, rekam medis, dan billing pada data awal berikutnya."
      >
        <dl className="detail-grid">
          <div>
            <dt>Poli tujuan</dt>
            <dd>{props.data.master.units.join(", ")}</dd>
          </div>
          <div>
            <dt>Penjamin</dt>
            <dd>{props.data.master.payers.join(", ")}</dd>
          </div>
          <div>
            <dt>Diagnosis</dt>
            <dd>{props.data.master.diagnoses.map((d) => d.name).join(", ")}</dd>
          </div>
        </dl>
        <DataTable
          rows={props.data.master.services}
          search={(s) => s.name}
          columns={[
            { label: "Layanan / tindakan", render: (s) => s.name },
            { label: "Tarif", render: (s) => rupiah(s.amount) },
            {
              label: "Status",
              render: (s) => <Status>{s.active ? "Aktif" : "Nonaktif"}</Status>,
            },
            {
              label: "Aksi",
              render: (s) => (
                <Button
                  variant="outline"
                  disabled={!canEdit}
                  onClick={() => {
                    const row = props.data.master.rows.find(
                      (r) => r.id === s.id
                    )
                    if (row) openRow(row)
                  }}
                >
                  Ubah layanan / tarif
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      <Dialog
        open={edit !== null}
        onOpenChange={(open) => {
          if (!open && !props.pending) close()
        }}
      >
        <DialogContent className="simrs-ui wide-dialog">
          <DialogHeader>
            <DialogTitle>
              {edit === "hospital"
                ? "Identitas rumah sakit sintetis"
                : edit?.id
                  ? "Ubah data master"
                  : "Tambah data master"}
            </DialogTitle>
            <DialogDescription>
              Perubahan tersimpan dengan alasan dan audit. Kode data lama
              dipertahankan; nonaktif tidak menghapus riwayat.
            </DialogDescription>
          </DialogHeader>
          {edit && (
            <MasterEditor
              key={edit === "hospital" ? "hospital" : (edit.id ?? "new")}
              initial={edit}
              hospital={props.data.master.hospital}
              disabled={!canEdit}
              onDirty={() => setDirty(true)}
              save={async (command) => {
                const ok = await props.execute(command)
                if (ok) {
                  setDirty(false)
                  setEdit(null)
                  setMessage(
                    "Master tersimpan. Pilihan formulir dan tarif untuk data awal baru sudah diperbarui."
                  )
                }
                return ok
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Confirm
        open={discard}
        onClose={() => setDiscard(false)}
        title="Abaikan perubahan master?"
        description="Isian yang belum disimpan akan dibuang. Data tersimpan tetap tersedia."
        onConfirm={() => {
          setDirty(false)
          setEdit(null)
        }}
      />
    </div>
  )
}
function MasterEditor({
  initial,
  hospital,
  disabled,
  onDirty,
  save,
}: {
  initial: MasterInput | "hospital"
  hospital: string
  disabled: boolean
  onDirty: () => void
  save: WorkspaceProps["execute"]
}) {
  const [form, setForm] = useState<MasterInput>(
    initial === "hospital" ? { ...blank, name: hospital } : initial
  )
  const [reason, setReason] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({})
  const charged = ["Layanan & tarif", "Tindakan"].includes(form.category)
  function update(key: keyof MasterInput, value: string | number) {
    setForm({ ...form, [key]: value })
    onDirty()
    setErrors({ ...errors, [key]: "" })
  }
  function validate() {
    const check =
      initial === "hospital"
        ? {
            ...(!form.name.trim() ||
            form.name.length < 3 ||
            form.name.length > 120
              ? { name: "Isi nama rumah sakit sepanjang 3–120 karakter." }
              : {}),
          }
        : validateMaster(form)
    if (!reason.trim() || reason.length > 4000)
      check.reason = "Isi alasan/keterangan, maksimal 4000 karakter."
    return check
  }
  const blur = (key: string) =>
    setErrors({ ...errors, [key]: validate()[key] ?? "" })
  return (
    <form
      noValidate
      className="page-stack"
      onSubmit={async (e) => {
        e.preventDefault()
        const check = validate()
        setErrors(check)
        if (Object.values(check).some(Boolean)) return
        await save(
          initial === "hospital"
            ? { type: "master.hospital", name: form.name, reason }
            : { type: "master.save", data: form, reason }
        )
      }}
    >
      {Object.values(errors).some(Boolean) && (
        <Notice danger title="Periksa formulir master">
          {Object.values(errors).filter(Boolean).join(" ")}
        </Notice>
      )}
      <FieldGroup className="form-grid">
        {initial !== "hospital" && (
          <FormField
            id="master-category"
            label="Kategori data"
            required
            error={errors.category}
          >
            <SelectControl
              id="master-category"
              label="Kategori data"
              options={[...masterCategories]}
              value={form.category}
              disabled={disabled || !!form.id}
              onChange={(e) => update("category", e.target.value)}
            />
          </FormField>
        )}
        <FormField
          id="master-name"
          label={
            initial === "hospital"
              ? "Nama rumah sakit sintetis"
              : "Nama data sintetis"
          }
          required
          error={errors.name}
        >
          <Input
            id="master-name"
            value={form.name}
            disabled={disabled}
            aria-invalid={!!errors.name}
            maxLength={120}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => blur("name")}
          />
        </FormField>
        {initial !== "hospital" && (
          <>
            <FormField
              id="master-detail"
              label="Keterangan / rincian"
              required
              error={errors.detail}
            >
              <Textarea
                id="master-detail"
                value={form.detail}
                disabled={disabled}
                aria-invalid={!!errors.detail}
                maxLength={4000}
                onChange={(e) => update("detail", e.target.value)}
                onBlur={() => blur("detail")}
              />
            </FormField>
            <FormField
              id="master-status"
              label="Status data"
              required
              error={errors.status}
            >
              <SelectControl
                id="master-status"
                label="Status data"
                options={["Aktif", "Nonaktif"]}
                value={form.status}
                disabled={disabled}
                onChange={(e) => update("status", e.target.value)}
              />
            </FormField>
            {charged && (
              <FormField
                id="master-amount"
                label="Tarif (Rp)"
                required
                error={errors.amount}
              >
                <Input
                  id="master-amount"
                  type="number"
                  min={1}
                  max={100000000}
                  step={1}
                  value={form.amount ?? ""}
                  disabled={disabled}
                  aria-invalid={!!errors.amount}
                  onChange={(e) => update("amount", Number(e.target.value))}
                  onBlur={() => blur("amount")}
                />
              </FormField>
            )}
          </>
        )}
        <FormField
          id="master-reason"
          label="Alasan / tujuan perubahan"
          required
          error={errors.reason}
        >
          <Textarea
            id="master-reason"
            value={reason}
            disabled={disabled}
            maxLength={4000}
            aria-invalid={!!errors.reason}
            onChange={(e) => {
              setReason(e.target.value)
              setErrors({ ...errors, reason: "" })
              onDirty()
            }}
            onBlur={() => blur("reason")}
          />
        </FormField>
      </FieldGroup>
      <div className="form-actions">
        <Button disabled={disabled} type="submit">
          Simpan master
        </Button>
      </div>
    </form>
  )
}
