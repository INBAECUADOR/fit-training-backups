export function Skeleton({ className = '', ...props }) {
  return (
    <div className={`animate-pulse bg-gym-700/50 rounded-lg ${className}`} {...props} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-gym-800/50 border border-gym-700/30 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-8 w-full mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="bg-gym-800/50 border border-gym-700/30 rounded-xl p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  )
}
