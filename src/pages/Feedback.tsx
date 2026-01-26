import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDateRange } from '@/contexts/DateRangeContext';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchFeedback, fetchFeedbackStats, type FeedbackWithAnalytics } from '@/services/feedbackService';

const Feedback = () => {
  const { startDate, endDate } = useDateRange();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'thumbs_up' | 'thumbs_down'>('all');
  const itemsPerPage = 10;

  const { data: feedbackData, isLoading, error } = useQuery({
    queryKey: ['feedback', { startDate, endDate, searchTerm, feedbackFilter, currentPage }],
    queryFn: () =>
      fetchFeedback({
        startDate,
        endDate,
        searchTerm: searchTerm || undefined,
        feedback: feedbackFilter !== 'all' ? feedbackFilter : undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      }),
    staleTime: 30000,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['feedback-stats', { startDate, endDate }],
    queryFn: () => fetchFeedbackStats(startDate, endDate),
    staleTime: 30000,
  });

  const feedback = feedbackData?.data || [];
  const totalCount = feedbackData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading || isLoadingStats) {
    return (
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          <div className="data-table">
            <div className="p-4 md:p-6 border-b border-border">
              <LoadingSkeleton className="h-8 w-64" />
            </div>
            <LoadingSkeleton className="h-[600px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          <div className="data-table p-4 md:p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fehler beim Laden</h3>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten'}
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Feedback</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Benutzerfeedback zu Chat-Antworten
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1.5">
            {totalCount} {totalCount === 1 ? 'Feedback' : 'Feedbacks'}
          </Badge>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              title="Gesamt Feedback"
              value={stats.total}
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <StatCard
              title="👍 Positiv"
              value={stats.thumbsUp}
              percentage={stats.thumbsUpPercentage}
              icon={<ThumbsUp className="w-5 h-5" />}
              variant="success"
            />
            <StatCard
              title="👎 Negativ"
              value={stats.thumbsDown}
              percentage={stats.thumbsDownPercentage}
              icon={<ThumbsDown className="w-5 h-5" />}
              variant="destructive"
            />
            <StatCard
              title="Zufriedenheit"
              value={stats.thumbsUpPercentage}
              suffix="%"
              icon={<ThumbsUp className="w-5 h-5" />}
              variant="success"
            />
          </div>
        )}

        {/* Filters */}
        <div className="data-table p-4 md:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Session ID oder Kommentar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFeedbackFilter('all');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-4 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
                  feedbackFilter === 'all'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card hover:bg-card-hover text-foreground'
                )}
              >
                Alle
              </button>
              <button
                onClick={() => {
                  setFeedbackFilter('thumbs_up');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-4 py-2 text-sm rounded-lg transition-colors min-h-[44px] flex items-center gap-2',
                  feedbackFilter === 'thumbs_up'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-card hover:bg-card-hover text-foreground'
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                Positiv
              </button>
              <button
                onClick={() => {
                  setFeedbackFilter('thumbs_down');
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-4 py-2 text-sm rounded-lg transition-colors min-h-[44px] flex items-center gap-2',
                  feedbackFilter === 'thumbs_down'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-card hover:bg-card-hover text-foreground'
                )}
              >
                <ThumbsDown className="w-4 h-4" />
                Negativ
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="data-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Feedback</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Session ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Response Timestamp</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Kommentar</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Erstellt am</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {feedback.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Kein Feedback gefunden
                    </td>
                  </tr>
                ) : (
                  feedback.map((item, index) => (
                    <FeedbackRow
                      key={`${item.sessionId}-${item.responsetimestamp}-${index}`}
                      item={item}
                      expanded={expandedRow === `${item.sessionId}-${item.responsetimestamp}`}
                      onToggle={() => {
                        const key = `${item.sessionId}-${item.responsetimestamp}`;
                        setExpandedRow(expandedRow === key ? null : key);
                      }}
                      formatDate={formatDate}
                      formatTimestamp={formatTimestamp}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-xs md:text-sm text-muted-foreground">
                Zeige {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} von {totalCount} Feedbacks
                {totalPages > 1 && ` (Seite ${currentPage} von ${totalPages})`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className={cn(
                    'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px] flex items-center gap-2',
                    (currentPage === 1 || isLoading)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-card hover:bg-card-hover text-foreground'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Zurück
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className={cn(
                    'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px] flex items-center gap-2',
                    (currentPage === totalPages || isLoading)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-card hover:bg-card-hover text-foreground'
                  )}
                >
                  Weiter
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

interface FeedbackRowProps {
  item: FeedbackWithAnalytics;
  expanded: boolean;
  onToggle: () => void;
  formatDate: (date: string) => string;
  formatTimestamp: (timestamp: number) => string;
}

function FeedbackRow({ item, expanded, onToggle, formatDate, formatTimestamp }: FeedbackRowProps) {
  const isPositive = item.feedback === 'thumbs_up';

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="p-4">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <ThumbsUp className="w-5 h-5 text-green-500" />
            ) : (
              <ThumbsDown className="w-5 h-5 text-red-500" />
            )}
            <Badge
              variant={isPositive ? 'default' : 'destructive'}
              className={isPositive ? 'bg-green-500/20 text-green-500' : ''}
            >
              {isPositive ? 'Positiv' : 'Negativ'}
            </Badge>
          </div>
        </td>
        <td className="p-4">
          <div className="font-mono text-xs text-foreground">
            {item.sessionId.substring(0, 8)}...
          </div>
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatTimestamp(item.responsetimestamp)}
        </td>
        <td className="p-4">
          <div className="max-w-xs truncate text-sm text-muted-foreground">
            {item.comment || '-'}
          </div>
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatDate(item.created_at)}
        </td>
        <td className="p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-muted rounded"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </td>
      </tr>
      {expanded && item.analytics && (
        <tr>
          <td colSpan={6} className="p-4 bg-muted/30">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm mb-2">Zugehörige Chat-Daten:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">User Message:</span>
                  <p className="mt-1 font-medium">{item.analytics.user_message || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bot Response:</span>
                  <p className="mt-1 font-medium">{item.analytics.bot_response || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sprache:</span>
                  <p className="mt-1 font-medium">{item.analytics.detected_language || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Intent:</span>
                  <p className="mt-1 font-medium">{item.analytics.message_intent || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Workflow Status:</span>
                  <p className="mt-1 font-medium">{item.analytics.workflow_status || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tool Used:</span>
                  <p className="mt-1 font-medium">{item.analytics.tool_used || 'none'}</p>
                </div>
                {item.analytics.has_error && (
                  <div>
                    <span className="text-muted-foreground">Error Type:</span>
                    <p className="mt-1 font-medium text-destructive">
                      {item.analytics.error_type || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  percentage?: number;
  suffix?: string;
  variant?: 'default' | 'success' | 'destructive';
}

function StatCard({ title, value, icon, percentage, suffix = '', variant = 'default' }: StatCardProps) {
  const variantClasses = {
    default: 'bg-accent/10 text-accent',
    success: 'bg-green-500/10 text-green-500',
    destructive: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs md:text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn('w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0', variantClasses[variant])}>
          {icon}
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-foreground">
        {value.toLocaleString('de-DE')}{suffix}
        {percentage !== undefined && (
          <span className="text-sm text-muted-foreground ml-2">({percentage}%)</span>
        )}
      </div>
    </div>
  );
}

export default Feedback;

