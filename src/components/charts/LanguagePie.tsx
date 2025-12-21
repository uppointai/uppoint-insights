import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { mockLanguages } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

const COLORS = [
  'hsl(215, 55%, 45%)',
  'hsl(200, 80%, 55%)',
  'hsl(45, 100%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(0, 72%, 55%)',
];

export const LanguagePie = () => {
  const isMobile = useIsMobile();
  
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
      className="chart-container h-full"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Sprachverteilung
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Erkannte Sprachen in Konversationen
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
        <div className="w-full sm:w-1/2 h-[140px] md:h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockLanguages}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 50 : 70}
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

        <div className="w-full sm:w-1/2 space-y-2 md:space-y-3">
          {mockLanguages.map((lang, index) => (
            <motion.div
              key={lang.language}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs md:text-sm text-foreground">{lang.language}</span>
              </div>
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                {lang.percentage}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
