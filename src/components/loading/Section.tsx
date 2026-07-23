import { ReactNode } from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';

interface SectionProps {
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  onRetry?: () => void;
  sectionName: string;
  emptyState?: ReactNode;
  isEmpty?: boolean;
  skeleton?: ReactNode;
  className?: string;
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Section({
  children,
  loading = false,
  error = null,
  success = null,
  onRetry,
  sectionName,
  emptyState,
  isEmpty = false,
  skeleton,
  className = '',
}: SectionProps) {
  const defaultSkeleton = !skeleton ? <SectionSkeleton /> : skeleton;

  return (
    <ErrorBoundary sectionName={sectionName}>
      <div className={`section-wrapper ${className}`}>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            {onRetry && (
              <button onClick={onRetry} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shrink-0">
                Retry
              </button>
            )}
          </div>
        )}

        {success && !error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {loading ? (
          defaultSkeleton
        ) : isEmpty && emptyState ? (
          emptyState
        ) : (
          children
        )}
      </div>
    </ErrorBoundary>
  );
}
