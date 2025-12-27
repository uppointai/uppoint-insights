import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useErrorTypes } from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDateRange } from '@/contexts/DateRangeContext';

const COLORS = [
  'hsl(0, 72%, 55%)',
  'hsl(25, 95%, 53%)',
  'hsl(45, 100%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(200, 80%, 55%)',
  'hsl(215, 55%, 45%)',
];

export const ErrorTypesBreakdown = () => {
  const isMobile = useIsMobile();
  const { startDate, endDate } = useDateRange();
  const { data: errorTypesData, isLoading, error } = useErrorTypes(startDate, endDate);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]) {
      const data = payload[0].payload || {};
      const count = payload[0].value ?? data.value ?? data.count ?? 0;
      const type = data.name ?? data.type ?? 'Unknown';
      const percentage = data.percentage ?? 0;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50">
          <p className="text-sm font-medium text-foreground">{type}</p>
          <p className="text-sm text-accent font-semibold">
            {typeof count === 'number' ? count.toLocaleString('de-DE') : count} Fehler
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {typeof percentage === 'number' ? percentage : 0}% aller Fehler
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
            Fehlertypen
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Aufschlüsselung der Fehlertypen
          </p>
        </div>
        <LoadingSkeleton className="h-[200px] md:h-[250px]" />
      </div>
    );
  }

  if (error || !errorTypesData || errorTypesData.length === 0) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Fehlertypen
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Aufschlüsselung der Fehlertypen
          </p>
        </div>
        <div className="h-[200px] md:h-[250px] flex items-center justify-center text-muted-foreground">
          {error ? 'Fehler beim Laden der Daten' : 'Keine Fehlerdaten verfügbar'}
        </div>
      </div>
    );
  }

  const chartData = errorTypesData.map((item) => ({
    name: item.type,
    value: item.count,
    percentage: item.percentage,
    type: item.type, // Keep original type for tooltip
    count: item.count, // Keep original count for tooltip
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Fehlertypen
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Aufschlüsselung der Fehlertypen
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
        <div className="w-full sm:w-1/2 h-[180px] md:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 60 : 80}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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
        </div>

        <div className="w-full sm:w-1/2 space-y-2 md:space-y-3">
          {errorTypesData.map((item, index) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between touch-manipulation"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs md:text-sm text-foreground truncate">{item.type}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  {item.count}
                </span>
                <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

