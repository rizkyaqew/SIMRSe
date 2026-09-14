import { ActionLink, EmptyState } from "@/components/simrs/ui"
export default function NotFound() {
  return (
    <EmptyState
      title="Halaman tidak ditemukan"
      description="Alamat halaman tidak tersedia di SIMRS-e Fase 1. Gunakan menu navigasi untuk melanjutkan."
      action={<ActionLink href="/">Kembali ke beranda</ActionLink>}
    />
  )
}
