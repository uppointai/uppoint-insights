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

export const ConversationVolumeChart = () => {
  const data = mockConversationVolume.map((item) => ({
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Konversationsvolumen
        </h3>
        <p className="text-sm text-muted-foreground">
          Anzahl der Konversationen über Zeit
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(80, 100%, 62%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(80, 100%, 62%)" stopOpacity={0} />
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
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(210, 15%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString('de-DE')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="conversations"
              stroke="hsl(80, 100%, 62%)"
              strokeWidth={2}
              fill="url(#colorConversations)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
