export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-slate-100 flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      <div className="h-10 bg-slate-200 rounded w-full"></div>
      <div className="h-10 bg-slate-200 rounded w-full"></div>
      <div className="h-10 bg-slate-200 rounded w-1/3"></div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-200 rounded-xl w-12 h-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
