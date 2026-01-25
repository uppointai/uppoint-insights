import { useEffect } from 'react';
import { MessageSquare, Clock, Zap, AlertTriangle, Timer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/metrics/MetricCard';
import { ConversationVolumeChart } from '@/components/charts/ConversationVolumeChart';
import { PeakHoursHeatmap } from '@/components/charts/PeakHoursHeatmap';
import { ResponseQualityDonut } from '@/components/charts/ResponseQualityDonut';
import { ToolUsageBar } from '@/components/charts/ToolUsageBar';
import { LanguagePie } from '@/components/charts/LanguagePie';
import { IntentDistribution } from '@/components/charts/IntentDistribution';
import { PopularSearchTerms } from '@/components/charts/PopularSearchTerms';
import { ErrorTypesBreakdown } from '@/components/charts/ErrorTypesBreakdown';
import { ConversationTable } from '@/components/tables/ConversationTable';
import { useMetrics } from '@/hooks/useAnalytics';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { checkSupabaseConnection } from '@/lib/supabase-debug';
import { useDateRange } from '@/contexts/DateRangeContext';

const Index = () => {
  const { startDate, endDate } = useDateRange();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useMetrics(startDate, endDate);

  // Debug Supabase connection on mount
  useEffect(() => {
    checkSupabaseConnection();
    if (metricsError) {
      console.error('Metrics error:', metricsError);
    }
  }, [metricsError]);

  // Transform metrics to match MetricCard format
  const totalConversations = metrics
    ? (() => {
        const percentChange = metrics.previousPeriod && metrics.previousPeriod.totalConversations > 0
          ? Math.round(
              ((metrics.totalConversations - metrics.previousPeriod.totalConversations) /
                metrics.previousPeriod.totalConversations) *
                100
            )
          : 0;
        const trend = percentChange === 0 
          ? 'neutral' 
          : (metrics.previousPeriod
              ? (metrics.totalConversations > metrics.previousPeriod.totalConversations ? 'up' : 'down')
              : 'neutral');
        return {
          value: metrics.totalConversations,
          previousValue: metrics.previousPeriod?.totalConversations || metrics.totalConversations,
          trend,
          percentChange,
        };
      })()
    : null;

  const avgResponseTime = metrics
    ? (() => {
        const percentChange = metrics.previousPeriod && metrics.previousPeriod.avgResponseTime > 0
          ? Math.round(
              ((metrics.previousPeriod.avgResponseTime - metrics.avgResponseTime) /
                metrics.previousPeriod.avgResponseTime) *
                100
            )
          : 0;
        const trend = percentChange === 0
          ? 'neutral'
          : (metrics.previousPeriod
              ? (metrics.avgResponseTime < metrics.previousPeriod.avgResponseTime ? 'up' : 'down')
              : 'neutral');
        return {
          value: metrics.avgResponseTime,
          previousValue: metrics.previousPeriod?.avgResponseTime || metrics.avgResponseTime,
          trend,
          percentChange,
        };
      })()
    : null;

  const toolUsageRate = metrics
    ? (() => {
        const percentChange = metrics.previousPeriod && metrics.previousPeriod.toolUsageRate > 0
          ? Math.round(
              ((metrics.toolUsageRate - metrics.previousPeriod.toolUsageRate) /
                metrics.previousPeriod.toolUsageRate) *
                100
            )
          : 0;
        const trend = percentChange === 0
          ? 'neutral'
          : (metrics.previousPeriod
              ? (metrics.toolUsageRate > metrics.previousPeriod.toolUsageRate ? 'up' : 'down')
              : 'neutral');
        return {
          value: metrics.toolUsageRate,
          previousValue: metrics.previousPeriod?.toolUsageRate || metrics.toolUsageRate,
          trend,
          percentChange,
        };
      })()
    : null;

  const fallbackRate = metrics
    ? (() => {
        const percentChange = metrics.previousPeriod && metrics.previousPeriod.fallbackRate > 0
          ? Math.round(
              ((metrics.previousPeriod.fallbackRate - metrics.fallbackRate) /
                metrics.previousPeriod.fallbackRate) *
                100
            )
          : 0;
        const trend = percentChange === 0
          ? 'neutral'
          : (metrics.previousPeriod
              ? (metrics.fallbackRate < metrics.previousPeriod.fallbackRate ? 'up' : 'down')
              : 'neutral');
        return {
          value: metrics.fallbackRate,
          previousValue: metrics.previousPeriod?.fallbackRate || metrics.fallbackRate,
          trend,
          percentChange,
        };
      })()
    : null;

  const totalTimeSaved = metrics
    ? (() => {
        const percentChange = metrics.previousPeriod && metrics.previousPeriod.totalTimeSaved > 0
          ? Math.round(
              ((metrics.totalTimeSaved - metrics.previousPeriod.totalTimeSaved) /
                metrics.previousPeriod.totalTimeSaved) *
                100
            )
          : 0;
        const trend = percentChange === 0
          ? 'neutral'
          : (metrics.previousPeriod
              ? (metrics.totalTimeSaved > metrics.previousPeriod.totalTimeSaved ? 'up' : 'down')
              : 'neutral');
        return {
          value: metrics.totalTimeSaved,
          previousValue: metrics.previousPeriod?.totalTimeSaved || metrics.totalTimeSaved,
          trend,
          percentChange,
        };
      })()
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Key Metrics - 1 col mobile, 2 col tablet, 5 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
          {metricsLoading ? (
            <>
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-24" />
            </>
          ) : (
            <>
              {totalConversations && (
                <MetricCard
                  title="Gesamte Konversationen"
                  metric={totalConversations}
                  icon={<MessageSquare className="w-5 h-5" />}
                  delay={0}
                />
              )}
              {avgResponseTime && (
                <MetricCard
                  title="Ø Antwortzeit"
                  metric={avgResponseTime}
                  icon={<Clock className="w-5 h-5" />}
                  format="time"
                  invertTrend
                  delay={0.1}
                />
              )}
              {totalTimeSaved && (
                <MetricCard
                  title="Gesparte Zeit"
                  metric={totalTimeSaved}
                  icon={<Timer className="w-5 h-5" />}
                  format="duration"
                  delay={0.15}
                />
              )}
              {toolUsageRate && (
                <MetricCard
                  title="Tool-Nutzungsrate"
                  metric={toolUsageRate}
                  icon={<Zap className="w-5 h-5" />}
                  format="percentage"
                  delay={0.2}
                />
              )}
              {fallbackRate && (
                <MetricCard
                  title="Fallback-Rate"
                  metric={fallbackRate}
                  icon={<AlertTriangle className="w-5 h-5" />}
                  format="percentage"
                  invertTrend
                  delay={0.3}
                />
              )}
            </>
          )}
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

        {/* New Charts Row 3 - Intent, Search Terms, Error Types */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <IntentDistribution />
          <PopularSearchTerms limit={5} />
        </div>

        {/* Error Types Chart */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <ErrorTypesBreakdown />
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
