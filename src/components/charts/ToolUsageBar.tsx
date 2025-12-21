import { motion } from 'framer-motion';
import { mockToolUsage } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const ToolUsageBar = () => {
  const maxCount = Math.max(...mockToolUsage.map((t) => t.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="chart-container"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Tool-Nutzung</h3>
        <p className="text-sm text-muted-foreground">
          Häufigkeit und Erfolgsrate der genutzten Tools
        </p>
      </div>

      <div className="space-y-4">
        {mockToolUsage.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {tool.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {tool.count.toLocaleString('de-DE')}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                    tool.successRate >= 95
                      ? 'bg-success/10 text-success'
                      : tool.successRate >= 85
                      ? 'bg-warning/10 text-warning'
                      : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {tool.successRate >= 95 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {tool.successRate}%
                </div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(tool.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
