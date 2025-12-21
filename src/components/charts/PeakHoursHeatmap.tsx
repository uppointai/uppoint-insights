import { motion } from 'framer-motion';
import { mockHourlyHeatmap } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export const PeakHoursHeatmap = () => {
  const maxValue = Math.max(...mockHourlyHeatmap.map((d) => d.value));

  const getHeatmapColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return 'bg-accent';
    if (intensity > 0.6) return 'bg-accent/70';
    if (intensity > 0.4) return 'bg-accent/50';
    if (intensity > 0.2) return 'bg-accent/30';
    return 'bg-accent/10';
  };

  const getValue = (day: number, hour: number) => {
    const item = mockHourlyHeatmap.find((d) => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="chart-container"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Spitzenzeiten</h3>
        <p className="text-sm text-muted-foreground">
          Konversationsverteilung nach Tag und Uhrzeit
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hours Header */}
          <div className="flex gap-1 mb-2 ml-12">
            {hours.filter((h) => h % 3 === 0).map((hour) => (
              <div
                key={hour}
                className="text-xs text-muted-foreground"
                style={{ width: '36px', textAlign: 'center' }}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-1">
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-8 text-xs text-muted-foreground text-right">
                  {day}
                </span>
                <div className="flex gap-0.5">
                  {hours.map((hour) => {
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
                              'w-3 h-6 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-accent/50',
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
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs text-muted-foreground">Weniger</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-accent/10" />
              <div className="w-3 h-3 rounded-sm bg-accent/30" />
              <div className="w-3 h-3 rounded-sm bg-accent/50" />
              <div className="w-3 h-3 rounded-sm bg-accent/70" />
              <div className="w-3 h-3 rounded-sm bg-accent" />
            </div>
            <span className="text-xs text-muted-foreground">Mehr</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
