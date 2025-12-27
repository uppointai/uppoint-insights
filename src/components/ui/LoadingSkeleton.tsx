import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className, style }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-muted/50',
      className
    )}
    style={style}
  />
);

// Generic loading skeleton component
export const LoadingSkeleton = ({ className, style }: SkeletonProps) => (
  <Skeleton className={className} style={style} />
);

export const MetricCardSkeleton = () => (
  <div className="metric-card">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-20 mb-3" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const ChartSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn('chart-container', className)}>
    <div className="mb-6">
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-3 w-48" />
    </div>
    <div className="h-[200px] md:h-[300px] flex items-end gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${Math.random() * 60 + 40}%` }}
        />
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="data-table">
    <div className="p-4 md:p-6 border-b border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>
    </div>
    <div className="p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0">
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
