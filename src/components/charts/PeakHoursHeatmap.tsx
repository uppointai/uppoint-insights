import { motion } from 'framer-motion';
import { useHourlyHeatmap } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDateRange } from '@/contexts/DateRangeContext';

const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export const PeakHoursHeatmap = () => {
  const isMobile = useIsMobile();
  const { startDate, endDate } = useDateRange();
  const { data: heatmapData, isLoading, error } = useHourlyHeatmap(startDate, endDate);
  const maxValue = heatmapData && heatmapData.length > 0 
    ? Math.max(...heatmapData.map((d) => d.value))
    : 0;

  // Show fewer hours on mobile
  const displayHours = isMobile
    ? hours.filter((h) => h % 3 === 0)
    : hours;

  const getHeatmapColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return 'bg-accent';
    if (intensity > 0.6) return 'bg-accent/70';
    if (intensity > 0.4) return 'bg-accent/50';
    if (intensity > 0.2) return 'bg-accent/30';
    return 'bg-accent/10';
  };

  const getValue = (day: number, hour: number) => {
    if (!heatmapData) return 0;
    const item = heatmapData.find((d) => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Spitzenzeiten</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Konversationsverteilung nach Tag und Uhrzeit
          </p>
        </div>
        <LoadingSkeleton className="h-[200px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Spitzenzeiten</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Konversationsverteilung nach Tag und Uhrzeit
          </p>
        </div>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Fehler beim Laden der Daten
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Spitzenzeiten</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Konversationsverteilung nach Tag und Uhrzeit
        </p>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className={cn('min-w-[300px]', !isMobile && 'min-w-[600px]')}>
          {/* Hours Header */}
          <div className="flex gap-0.5 md:gap-1 mb-2 ml-8 md:ml-12">
            {(isMobile ? hours.filter((h) => h % 6 === 0) : hours.filter((h) => h % 3 === 0)).map((hour) => (
              <div
                key={hour}
                className="text-[10px] md:text-xs text-muted-foreground flex-1 text-center"
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-0.5 md:space-y-1">
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1 md:gap-2">
                <span className="w-6 md:w-8 text-[10px] md:text-xs text-muted-foreground text-right">
                  {day}
                </span>
                <div className="flex gap-[1px] md:gap-0.5 flex-1">
                  {displayHours.map((hour) => {
                    const value = getValue(dayIndex, hour);
                    return (
                      <Tooltip key={hour}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: (dayIndex * 24 + hour) * 0.002,
                              type: 'spring',
                              stiffness: 500,
                            }}
                            className={cn(
                              'flex-1 h-4 md:h-6 rounded-[2px] md:rounded-sm cursor-pointer transition-all duration-200',
                              'hover:ring-1 md:hover:ring-2 hover:ring-accent/50 touch-manipulation',
                              getHeatmapColor(value)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {day}, {hour.toString().padStart(2, '0')}:00 Uhr
                          </p>
                          <p className="text-sm font-semibold text-accent">
                            {value} Konversationen
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 md:mt-4 justify-end">
            <span className="text-[10px] md:text-xs text-muted-foreground">Weniger</span>
            <div className="flex gap-0.5">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-accent/10" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-accent/30" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-accent/50" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-accent/70" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-accent" />
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground">Mehr</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
