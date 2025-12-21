import { MessageSquare, Clock, Zap, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/metrics/MetricCard';
import { ConversationVolumeChart } from '@/components/charts/ConversationVolumeChart';
import { PeakHoursHeatmap } from '@/components/charts/PeakHoursHeatmap';
import { ResponseQualityDonut } from '@/components/charts/ResponseQualityDonut';
import { ToolUsageBar } from '@/components/charts/ToolUsageBar';
import { LanguagePie } from '@/components/charts/LanguagePie';
import { ConversationTable } from '@/components/tables/ConversationTable';
import { mockMetrics } from '@/data/mockData';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Key Metrics - 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <MetricCard
            title="Gesamte Konversationen"
            metric={mockMetrics.totalConversations}
            icon={<MessageSquare className="w-5 h-5" />}
            delay={0}
          />
          <MetricCard
            title="Ø Antwortzeit"
            metric={mockMetrics.avgResponseTime}
            icon={<Clock className="w-5 h-5" />}
            format="time"
            invertTrend
            delay={0.1}
          />
          <MetricCard
            title="Tool-Nutzungsrate"
            metric={mockMetrics.toolUsageRate}
            icon={<Zap className="w-5 h-5" />}
            format="percentage"
            delay={0.2}
          />
          <MetricCard
            title="Fallback-Rate"
            metric={mockMetrics.fallbackRate}
            icon={<AlertTriangle className="w-5 h-5" />}
            format="percentage"
            invertTrend
            delay={0.3}
          />
        </div>

        {/* Charts Row 1 - Stack on mobile/tablet, 2 col on desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <ConversationVolumeChart />
          <PeakHoursHeatmap />
        </div>

        {/* Charts Row 2 - 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <ResponseQualityDonut />
          <ToolUsageBar />
          <div className="md:col-span-2 xl:col-span-1">
            <LanguagePie />
          </div>
        </div>

        {/* Conversation Table */}
        <ConversationTable />

        {/* Footer */}
        <footer className="text-center py-4 md:py-6 border-t border-border">
          <p className="text-xs md:text-sm text-muted-foreground">
            Powered by{' '}
            <span className="text-accent font-semibold">Uppoint AI</span>
          </p>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Index;
