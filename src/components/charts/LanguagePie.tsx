import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { mockLanguages } from '@/data/mockData';

const COLORS = [
  'hsl(80, 100%, 62%)',
  'hsl(200, 80%, 55%)',
  'hsl(45, 100%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(0, 72%, 55%)',
];

export const LanguagePie = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.language}</p>
          <p className="text-sm text-accent font-semibold">
            {data.count.toLocaleString('de-DE')} ({data.percentage}%)
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
      transition={{ duration: 0.5, delay: 0.6 }}
      className="chart-container"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Sprachverteilung
        </h3>
        <p className="text-sm text-muted-foreground">
          Erkannte Sprachen in Konversationen
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-1/2 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockLanguages}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="count"
                strokeWidth={0}
              >
                {mockLanguages.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 space-y-3">
          {mockLanguages.map((lang, index) => (
            <motion.div
              key={lang.language}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-foreground">{lang.language}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang.percentage}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
