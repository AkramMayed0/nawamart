import clsx from 'clsx'

export default function Skeleton({ className = '', variant = 'pulse' }) {
  return (
    <div
      className={clsx(
        'bg-border rounded relative overflow-hidden',
        variant === 'pulse' && 'animate-pulse',
        variant === 'shimmer' && 'bg-border',
        className,
      )}
    >
      {variant === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full shimmer-slide">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </div>
      )}
    </div>
  )
}

export function CardSkeleton({ lines = 3, variant = 'pulse' }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <Skeleton className="w-full h-40 rounded-none" variant={variant} />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" variant={variant} />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} variant={variant} />
        ))}
      </div>
    </div>
  )
}

export function ProductCardSkeleton({ variant = 'pulse' }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <Skeleton className="w-full aspect-square rounded-none" variant={variant} />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" variant={variant} />
        <Skeleton className="h-3 w-1/2" variant={variant} />
        <Skeleton className="h-5 w-1/3 mt-1" variant={variant} />
      </div>
    </div>
  )
}

export function StoreHeaderSkeleton({ variant = 'pulse' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Skeleton className={`w-20 h-20 rounded-2xl ${variant === 'shimmer' ? '' : 'animate-pulse'}`} variant={variant} />
      <Skeleton className="h-6 w-48" variant={variant} />
      <Skeleton className="h-4 w-72" variant={variant} />
    </div>
  )
}

export function ProductRowSkeleton({ variant = 'pulse' }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" variant={variant} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" variant={variant} />
        <Skeleton className="h-3 w-1/4" variant={variant} />
      </div>
      <Skeleton className="h-4 w-16" variant={variant} />
      <Skeleton className="h-4 w-12" variant={variant} />
      <Skeleton className="h-8 w-20 rounded-lg" variant={variant} />
    </div>
  )
}
