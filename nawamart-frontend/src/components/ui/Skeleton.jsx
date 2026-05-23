import clsx from 'clsx'

export default function Skeleton({ className = '' }) {
  return (
    <div className={clsx('animate-pulse bg-border rounded', className)} />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-1" />
      </div>
    </div>
  )
}

export function StoreHeaderSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-4 py-10">
      <Skeleton className="w-20 h-20 rounded-2xl" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
  )
}
