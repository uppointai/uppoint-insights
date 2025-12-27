import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIntentDistribution } from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDateRange } from '@/contexts/DateRangeContext';

export const IntentDistribution = () => {
  const isMobile = useIsMobile();
  const { startDate, endDate } = useDateRange();
  const { data: intentData, isLoading, error } = useIntentDistribution(startDate, endDate);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg z-50 backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-accent font-semibold">
            {payload[0].value.toLocaleString('de-DE')} Konversationen
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {payload[0].payload.percentage}% aller Konversationen
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
            Intent-Verteilung
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Verteilung der Nachrichten-Intents
          </p>
        </div>
        <LoadingSkeleton className="h-[200px] md:h-[300px]" />
      </div>
    );
  }

  if (error || !intentData || intentData.length === 0) {
    return (
      <div className="chart-container">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Intent-Verteilung
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Verteilung der Nachrichten-Intents
          </p>
        </div>
        <div className="h-[200px] md:h-[300px] flex items-center justify-center text-muted-foreground">
          {error ? 'Fehler beim Laden der Daten' : 'Keine Daten verfügbar'}
        </div>
      </div>
    );
  }

  // Format intent names for better display
  const formatIntent = (intent: string) => {
    return intent
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const chartData = intentData.map((item) => ({
    ...item,
    intent: formatIntent(item.intent),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Intent-Verteilung
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Verteilung der Nachrichten-Intents
        </p>
      </div>

      <div className="h-[200px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ left: isMobile ? -20 : 0, right: 10, top: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(215, 25%, 18%)"
              vertical={false}
            />
            <XAxis
              dataKey="intent"
              stroke="hsl(210, 15%, 55%)"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              angle={isMobile ? -45 : -30}
              textAnchor="end"
              height={isMobile ? 60 : 80}
            />
            <YAxis
              stroke="hsl(210, 15%, 55%)"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 30 : 50}
            />
            <Tooltip 
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Bar
              dataKey="count"
              fill="hsl(215, 55%, 45%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

