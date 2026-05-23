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

export function ProductRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}
