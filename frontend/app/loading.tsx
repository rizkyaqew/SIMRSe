import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() {
  return (
    <div className="page-stack" role="status" aria-label="Memuat halaman">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-40 w-full" />
      <span className="sr-only">Memuat data simulasi...</span>
    </div>
  )
}
