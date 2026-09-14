import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ModulePage } from "@/components/simrs/module-page"
import { moduleInfo } from "@/lib/simrs/navigation"
import Loading from "../loading"

export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  if (!moduleInfo[module] && !["login", "bantuan"].includes(module)) notFound()
  return (
    <Suspense fallback={<Loading />}>
      <ModulePage module={module} />
    </Suspense>
  )
}
