export function Skeleton({ className = '', ...props }) {
  return (
    <div className={`shimmer rounded-lg ${className}`} {...props} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-gym-800/50 border border-gym-700/30 rounded-2xl p-5 fade-in-up">
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
    <div className="bg-gym-800/50 border border-gym-700/30 rounded-xl p-4 flex items-center gap-3 fade-in-up">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-gym-900">
      <nav className="bg-gym-800/80 border-b border-gym-700/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="h-5 w-36" />
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}
