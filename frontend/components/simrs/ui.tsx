"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Search01Icon,
  ArrowLeft01Icon,
  File01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

export function Icon({
  icon,
  ...props
}: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon"> & {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={20}
      strokeWidth={1.7}
      aria-hidden="true"
      {...props}
    />
  )
}
export function Status({ children }: { children: string }) {
  const tone =
    /Aktif|berjalan|Berjalan|Dipublikasikan|Selesai|Dinilai|Lunas/.test(
      children
    )
      ? "success"
      : /Menunggu|Uji|Dijeda|Draft/.test(children)
        ? "warning"
        : /Terkunci|Ditutup|Terlambat|Dikembalikan/.test(children)
          ? "danger"
          : "neutral"
  return (
    <Badge variant="secondary" className={`status status-${tone}`}>
      <span className="status-dot" />
      {children}
    </Badge>
  )
}
export function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      nativeButton={false}
      role="link"
      render={<Link href={href} />}
    >
      {children}
      <Icon icon={ArrowRight01Icon} data-icon="inline-end" />
    </Button>
  )
}
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
export function Notice({
  title,
  children,
  danger = false,
}: {
  title: string
  children?: React.ReactNode
  danger?: boolean
}) {
  return (
    <Alert variant={danger ? "destructive" : "default"} className="notice">
      <Icon icon={HelpCircleIcon} />
      <AlertTitle>{title}</AlertTitle>
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  )
}
export function EmptyState({
  title = "Belum ada data",
  description,
  action,
}: {
  title?: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon={File01Icon} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action}
    </Empty>
  )
}
export function SelectControl({
  label,
  options,
  ...props
}: Omit<React.ComponentProps<typeof NativeSelect>, "children"> & {
  label: string
  options: (string | { value: string; label: string })[]
}) {
  return (
    <NativeSelect aria-label={label} {...props}>
      {options.map((option) => (
        <NativeSelectOption
          key={typeof option === "string" ? option : option.value}
          value={typeof option === "string" ? option : option.value}
        >
          {typeof option === "string" ? option : option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
export function FormField({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      {children}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
export function Confirm({
  open,
  onClose,
  title,
  description,
  onConfirm,
  label = "Konfirmasi",
  requireReason = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  onConfirm: (reason: string) => void | boolean | Promise<void | boolean>
  label?: string
  requireReason?: boolean
}) {
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setReason("")
          onClose()
        }
      }}
    >
      <DialogContent className="simrs-ui">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {requireReason && (
          <FormField id="confirm-reason" label="Alasan tindakan" required>
            <Input
              id="confirm-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tuliskan alasan untuk audit aktivitas"
            />
          </FormField>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={saving || (requireReason && !reason.trim())}
            onClick={async () => {
              setSaving(true)
              let result: void | boolean
              try {
                result = await onConfirm(reason)
              } finally {
                setSaving(false)
              }
              if (result === false) return
              setReason("")
              onClose()
            }}
          >
            {saving ? "Memproses…" : label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    const navigate = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a[href]")
      if (
        link &&
        !window.confirm("Perubahan belum disimpan. Tinggalkan halaman ini?")
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener("beforeunload", unload)
    document.addEventListener("click", navigate, true)
    return () => {
      window.removeEventListener("beforeunload", unload)
      document.removeEventListener("click", navigate, true)
    }
  }, [dirty])
}
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  search,
  placeholder = "Cari data...",
  filters,
}: {
  rows: T[]
  columns: { label: string; render: (row: T) => React.ReactNode }[]
  search: (row: T) => string
  placeholder?: string
  filters?: React.ReactNode
}) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(5)
  const filtered = rows.filter((row) =>
    search(row).toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id"))
  )
  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const current = Math.min(page, pages)
  return (
    <div className="table-area">
      <div className="table-tools">
        <div className="search-input">
          <Icon icon={Search01Icon} />
          <Input
            aria-label={placeholder}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
        </div>
        {filters}
      </div>
      {filtered.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.label}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice((current - 1) * size, current * size).map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.label}>{col.render(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title={query ? "Data tidak ditemukan" : "Belum ada data"}
          description={
            query
              ? "Coba kata kunci lain atau hapus filter pencarian."
              : "Data akan muncul setelah proses yang terkait diselesaikan."
          }
          action={
            query && (
              <Button variant="outline" onClick={() => setQuery("")}>
                Hapus pencarian
              </Button>
            )
          }
        />
      )}
      <div className="pagination">
        <span>
          {filtered.length
            ? `${(current - 1) * size + 1}–${Math.min(current * size, filtered.length)}`
            : "0"}{" "}
          dari {filtered.length} data
        </span>
        <div className="flex items-center gap-2">
          <SelectControl
            label="Data per halaman"
            options={["5", "10", "20"]}
            value={String(size)}
            onChange={(e) => {
              setSize(Number(e.target.value))
              setPage(1)
            }}
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Halaman sebelumnya"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <Icon icon={ArrowLeft01Icon} />
          </Button>
          <span aria-live="polite">
            {current} / {pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Halaman berikutnya"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <Icon icon={ArrowRight01Icon} />
          </Button>
        </div>
      </div>
    </div>
  )
}
