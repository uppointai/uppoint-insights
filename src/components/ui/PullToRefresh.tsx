import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 10 || isRefreshing;

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
      style={{ 
        transform: `translateY(${pullDistance - 40}px)`,
        transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center',
          progress >= 1 && 'border-accent'
        )}
      >
        <motion.div
          animate={{ 
            rotate: isRefreshing ? 360 : progress * 180,
          }}
          transition={isRefreshing ? { 
            duration: 1, 
            repeat: Infinity, 
            ease: 'linear' 
          } : { 
            duration: 0 
          }}
        >
          <RefreshCw 
            className={cn(
              'w-5 h-5 transition-colors',
              progress >= 1 ? 'text-accent' : 'text-muted-foreground'
            )} 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

interface PullToRefreshContainerProps {
  children: ReactNode;
  pullDistance: number;
  isRefreshing: boolean;
  className?: string;
}

export const PullToRefreshContainer = forwardRef<HTMLDivElement, PullToRefreshContainerProps>(
  ({ children, pullDistance, isRefreshing, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative overflow-auto', className)}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.5}px)` : undefined,
          transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <PullToRefreshIndicator 
          pullDistance={pullDistance} 
          isRefreshing={isRefreshing} 
        />
        {children}
      </div>
    );
  }
);

PullToRefreshContainer.displayName = 'PullToRefreshContainer';
