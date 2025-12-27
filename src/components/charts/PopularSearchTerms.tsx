import { motion } from 'framer-motion';
import { usePopularSearchTerms } from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDateRange } from '@/contexts/DateRangeContext';
import { Search } from 'lucide-react';

interface PopularSearchTermsProps {
  limit?: number;
}

export const PopularSearchTerms = ({ limit = 5 }: PopularSearchTermsProps) => {
  const isMobile = useIsMobile();
  const { startDate, endDate } = useDateRange();
  const { data: searchTermsData, isLoading, error } = usePopularSearchTerms(startDate, endDate, limit);

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Beliebte Suchbegriffe
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Top {limit} am häufigsten gesuchte Begriffe
          </p>
        </div>
        <LoadingSkeleton className="h-[300px]" />
      </div>
    );
  }

  if (error || !searchTermsData || searchTermsData.length === 0) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Beliebte Suchbegriffe
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Top {limit} am häufigsten gesuchte Begriffe
          </p>
        </div>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          {error ? 'Fehler beim Laden der Daten' : 'Keine Suchbegriffe verfügbar'}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...searchTermsData.map((item) => item.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Beliebte Suchbegriffe
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Top 15 am häufigsten gesuchte Begriffe
        </p>
      </div>

      <div className="space-y-2 md:space-y-3">
        {searchTermsData.map((item, index) => (
          <motion.div
            key={item.term}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="group touch-manipulation"
          >
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search className="w-3 h-3 md:w-4 md:h-4 text-accent flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium text-foreground truncate">
                  {item.term}
                </span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground ml-2 flex-shrink-0">
                {item.count.toLocaleString('de-DE')}
              </span>
            </div>
            <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

