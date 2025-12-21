import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricData } from '@/data/mockData';

interface MetricCardProps {
  title: string;
  metric: MetricData;
  icon: React.ReactNode;
  suffix?: string;
  format?: 'number' | 'time' | 'percentage';
  invertTrend?: boolean;
  delay?: number;
}

export const MetricCard = ({
  title,
  metric,
  icon,
  suffix = '',
  format = 'number',
  invertTrend = false,
  delay = 0,
}: MetricCardProps) => {
  const formatValue = (value: number) => {
    switch (format) {
      case 'time':
        return `${value}s`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString('de-DE');
    }
  };

  const isPositive = invertTrend
    ? metric.trend === 'down'
    : metric.trend === 'up';

  const TrendIcon = metric.trend === 'up'
    ? TrendingUp
    : metric.trend === 'down'
      ? TrendingDown
      : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="metric-card group touch-manipulation"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <span className="text-xs md:text-sm font-medium text-muted-foreground line-clamp-1">
            {title}
          </span>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="mb-2 md:mb-3">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-2xl md:text-3xl font-bold text-foreground animate-number-up inline-block"
          >
            {formatValue(metric.value)}
          </motion.span>
          {suffix && (
            <span className="text-sm md:text-lg text-muted-foreground ml-1">{suffix}</span>
          )}
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={cn(
              'flex items-center gap-1 text-xs md:text-sm font-medium px-2 py-1 rounded-md',
              isPositive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(metric.percentChange)}%</span>
          </div>
          <span className="text-[10px] md:text-xs text-muted-foreground">
            vs. Vorperiode
          </span>
        </div>
      </div>
    </motion.div>
  );
};
