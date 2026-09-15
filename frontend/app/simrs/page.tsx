import { CoreArea } from "@/components/simrs/core-area"
import { pageAllowed } from "@/lib/server/page-access"
import { EmptyState } from "@/components/platform/shared"
export default async function Page() {
  if (!(await pageAllowed("simrs")))
    return (
      <EmptyState
        title="Akses tidak diizinkan"
        description="Periksa akun dan penugasan Anda."
      />
    )
  return <CoreArea module="ringkasan" />
}
