import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ModulePage } from "@/components/simrs/module-page"
import { moduleInfo } from "@/lib/simrs/navigation"
import Loading from "../loading"
import { pageAllowed } from "@/lib/server/page-access"
import { EmptyState } from "@/components/platform/shared"

export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  if (!moduleInfo[module] && !["login", "bantuan"].includes(module)) notFound()
  if (!["login", "bantuan"].includes(module) && !(await pageAllowed(module)))
    return (
      <EmptyState
        title="Akses tidak diizinkan"
        description="Halaman ini tidak tersedia untuk peran akun Anda."
      />
    )
  return (
    <Suspense fallback={<Loading />}>
      <ModulePage module={module} />
    </Suspense>
  )
}
