import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockConversationVolume } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

export const ConversationVolumeChart = () => {
  const isMobile = useIsMobile();
  
  // Show fewer data points on mobile for better readability
  const data = mockConversationVolume
    .filter((_, index) => !isMobile || index % 2 === 0)
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      }),
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-accent font-semibold">
            {payload[0].value.toLocaleString('de-DE')} Konversationen
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="chart-container"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Konversationsvolumen
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Anzahl der Konversationen über Zeit
        </p>
      </div>

      <div className="h-[200px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: isMobile ? -20 : 0, right: 0 }}>
            <defs>
              <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(215, 55%, 45%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(215, 55%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(215, 25%, 18%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(210, 15%, 55%)"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              interval={isMobile ? 2 : 'preserveStartEnd'}
            />
            <YAxis
              stroke="hsl(210, 15%, 55%)"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => isMobile ? `${Math.round(value / 1000)}k` : value.toLocaleString('de-DE')}
              width={isMobile ? 30 : 50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="conversations"
              stroke="hsl(215, 55%, 45%)"
              strokeWidth={2}
              fill="url(#colorConversations)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
