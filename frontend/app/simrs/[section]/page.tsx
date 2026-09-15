import { notFound } from "next/navigation"
import { CoreArea } from "@/components/simrs/core-area"
import { coreModules, type CoreModule } from "@/lib/core/navigation"
import { pageAllowed } from "@/lib/server/page-access"
import { EmptyState } from "@/components/platform/shared"
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!(section in coreModules)) notFound()
  if (!(await pageAllowed(`simrs/${section}`)))
    return (
      <EmptyState
        title="Akses tidak diizinkan"
        description="Modul tidak tersedia untuk akun atau peran Anda pada sesi aktif."
      />
    )
  return <CoreArea module={section as CoreModule} />
}
