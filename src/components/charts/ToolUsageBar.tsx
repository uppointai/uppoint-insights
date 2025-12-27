import { motion } from 'framer-motion';
import { useToolUsage } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDateRange } from '@/contexts/DateRangeContext';

export const ToolUsageBar = () => {
  const isMobile = useIsMobile();
  const { startDate, endDate } = useDateRange();
  const { data: toolUsageData, isLoading, error } = useToolUsage(startDate, endDate);
  const maxCount = toolUsageData && toolUsageData.length > 0
    ? Math.max(...toolUsageData.map((t) => t.count))
    : 0;
  
  // Show fewer tools on mobile
  const displayTools = toolUsageData
    ? (isMobile ? toolUsageData.slice(0, 5) : toolUsageData)
    : [];

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Tool-Nutzung</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Häufigkeit und Erfolgsrate der genutzten Tools
          </p>
        </div>
        <LoadingSkeleton className="h-[200px]" />
      </div>
    );
  }

  if (error || !toolUsageData || toolUsageData.length === 0) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Tool-Nutzung</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Häufigkeit und Erfolgsrate der genutzten Tools
          </p>
        </div>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          {error ? 'Fehler beim Laden der Daten' : 'Keine Daten verfügbar'}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Tool-Nutzung</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Häufigkeit und Erfolgsrate der genutzten Tools
        </p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {displayTools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="group touch-manipulation"
          >
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <span className="text-xs md:text-sm font-medium text-foreground truncate max-w-[120px] md:max-w-none">
                {tool.name}
              </span>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs md:text-sm text-muted-foreground">
                  {tool.count.toLocaleString('de-DE')}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full',
                    tool.successRate >= 95
                      ? 'bg-success/10 text-success'
                      : tool.successRate >= 85
                      ? 'bg-warning/10 text-warning'
                      : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {tool.successRate >= 95 ? (
                    <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  ) : (
                    <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  )}
                  {tool.successRate}%
                </div>
              </div>
            </div>
            <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(tool.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
