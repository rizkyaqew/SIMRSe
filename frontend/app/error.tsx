"use client"
import { Button } from "@/components/ui/button"
import { Notice } from "@/components/simrs/ui"
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-stack">
      <Notice title="Halaman belum dapat ditampilkan" danger>
        Terjadi kesalahan saat memuat halaman. Coba kembali atau buka beranda.
      </Notice>
      <div>
        <Button onClick={reset}>Coba lagi</Button>
      </div>
    </div>
  )
}
