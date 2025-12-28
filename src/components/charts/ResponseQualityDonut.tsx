import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useResponseQuality } from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDateRange } from '@/contexts/DateRangeContext';

export const ResponseQualityDonut = () => {
  const isMobile = useIsMobile();
  const { startDate, endDate } = useDateRange();
  const { data: qualityData, isLoading, error } = useResponseQuality(startDate, endDate);
  
  // Filter out zero values to avoid rendering issues
  const filteredData = qualityData?.filter(item => item.value > 0) || [];
  const total = filteredData.length > 0 
    ? filteredData.reduce((acc, item) => acc + item.value, 0) 
    : 0;
  
  // Find successful count by name to be safe (not relying on array order)
  const successfulItem = filteredData.find(item => item.name === 'Erfolgreich');
  const successRate = successfulItem && total > 0
    ? Math.round((successfulItem.value / total) * 100)
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]) {
      const data = payload[0].payload || {};
      const value = payload[0].value ?? data.value ?? 0;
      const name = data.name || 'Unknown';
      const color = data.color || 'hsl(160, 70%, 45%)';
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50">
          <p className="text-sm font-medium lowercase" style={{ color: color }}>
            {name}
          </p>
          <p className="text-sm text-foreground font-semibold">
            {typeof value === 'number' ? value.toLocaleString('de-DE') : value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Erfolgsrate vs. Fehler
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Verteilung von erfolgreichen und fehlerhaften Antworten
          </p>
        </div>
        <LoadingSkeleton className="h-[150px] md:h-[200px]" />
      </div>
    );
  }

  if (error || !qualityData || filteredData.length === 0) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Erfolgsrate vs. Fehler
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Verteilung von erfolgreichen und fehlerhaften Antworten
          </p>
        </div>
        <div className="h-[150px] md:h-[200px] flex items-center justify-center text-muted-foreground">
          {error ? 'Fehler beim Laden der Daten' : 'Keine Daten verfügbar'}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Erfolgsrate vs. Fehler
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Verteilung von erfolgreichen und fehlerhaften Antworten
        </p>
      </div>

      <div className="relative h-[150px] md:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 40 : 60}
              outerRadius={isMobile ? 60 : 80}
              paddingAngle={filteredData.length > 1 ? 3 : 0}
              dataKey="value"
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl md:text-3xl font-bold text-foreground">
            {successRate}%
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">Erfolgsrate</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 md:gap-6 mt-3 md:mt-4 flex-wrap">
        {filteredData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs md:text-sm text-muted-foreground">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
