import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSessions, useSessionDetails } from '@/hooks/useAnalytics';
import { useDateRange } from '@/contexts/DateRangeContext';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { SessionDetailModal } from '@/components/sessions/SessionDetailModal';
import { 
  MessageSquare, 
  Clock, 
  Timer, 
  AlertCircle,
  CheckCircle2,
  Globe,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionMetrics } from '@/services/analyticsService';

const Conversations = () => {
  const { startDate, endDate } = useDateRange();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data: sessionsData, isLoading, error } = useSessions({
    startDate,
    endDate,
    minChats: 3, // Filter sessions with less than 3 chats
  });

  const { data: sessionDetail, isLoading: isLoadingDetail, error: detailError } = useSessionDetails(selectedSessionId);

  const allSessions = sessionsData?.data || [];
  const totalSessions = sessionsData?.count || 0;

  // Client-side pagination
  const totalPages = Math.ceil(totalSessions / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sessions = allSessions.slice(startIndex, endIndex);

  // Calculate summary metrics for ALL sessions (not just current page)
  const summaryMetrics = useMemo(() => {
    if (allSessions.length === 0) {
      return {
        totalSessions: 0,
        totalChats: 0,
        avgSessionDuration: 0,
        avgResponseTime: 0,
        sessionsWithErrors: 0,
      };
    }

    const totalChats = allSessions.reduce((sum, s) => sum + s.total_chats, 0);
    const totalDuration = allSessions.reduce((sum, s) => sum + s.total_duration_seconds, 0);
    const totalResponseTime = allSessions.reduce((sum, s) => sum + s.avg_response_time_seconds, 0);
    const sessionsWithErrors = allSessions.filter((s) => s.has_errors).length;

    return {
      totalSessions: allSessions.length,
      totalChats,
      avgSessionDuration: totalDuration / allSessions.length,
      avgResponseTime: totalResponseTime / allSessions.length,
      sessionsWithErrors,
    };
  }, [allSessions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(1)}s`;
  };

  if (isLoading) {
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Konversationen</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Gruppiert nach Session-ID (nur Sessions mit ≥3 Chats)
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1.5">
            {totalSessions} {totalSessions === 1 ? 'Session' : 'Sessions'}
          </Badge>
        </div>

        {/* Session Metrics Summary */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <SummaryCard
              title="Sessions"
              value={summaryMetrics.totalSessions}
              icon={<Users className="w-5 h-5" />}
            />
            <SummaryCard
              title="Gesamt Chats"
              value={summaryMetrics.totalChats}
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <SummaryCard
              title="Ø Session-Dauer"
              value={summaryMetrics.avgSessionDuration}
              format="duration"
              icon={<Timer className="w-5 h-5" />}
            />
            <SummaryCard
              title="Ø Antwortzeit"
              value={summaryMetrics.avgResponseTime}
              format="time"
              icon={<Clock className="w-5 h-5" />}
            />
          </div>
        )}

        {/* Sessions Table */}
        <div className="data-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Session ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Anzahl Chats</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Startzeit</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Endzeit</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Dauer</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Ø Antwortzeit</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Sprachen</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {allSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Keine Sessions gefunden (Sessions mit weniger als 3 Chats werden ausgeblendet)
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <SessionRow key={session.session_id} session={session} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalSessions > itemsPerPage && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-xs md:text-sm text-muted-foreground">
                Zeige {startIndex + 1}-{Math.min(endIndex, totalSessions)} von {totalSessions} Sessions
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

        {/* Session Detail Modal */}
        <SessionDetailModal
          sessionId={selectedSessionId}
          open={!!selectedSessionId}
          onOpenChange={(open) => {
            if (!open) setSelectedSessionId(null);
          }}
          sessionDetail={sessionDetail}
          isLoading={isLoadingDetail}
          error={detailError as Error | null}
        />
      </div>
    </DashboardLayout>
  );

  function SessionRow({ session }: { session: SessionMetrics }) {
    const handleRowClick = () => {
      setSelectedSessionId(session.session_id);
    };

    return (
      <tr
        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={handleRowClick}
      >
        <td className="p-4">
          <div className="font-mono text-xs text-foreground">
            {session.session_id.substring(0, 8)}...
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{session.total_chats}</span>
          </div>
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatDate(session.first_message_timestamp)}
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatDate(session.last_message_timestamp)}
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formatDuration(session.total_duration_seconds)}</span>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formatTime(session.avg_response_time_seconds)}</span>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-1 flex-wrap">
            <Globe className="w-4 h-4 text-muted-foreground" />
            {session.languages.map((lang, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            {session.has_errors ? (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{session.error_count} Fehler</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">OK</span>
              </>
            )}
            {session.tool_usage_count > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-muted-foreground">{session.tool_usage_count}</span>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  }
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  format?: 'number' | 'time' | 'duration';
}

function SummaryCard({ title, value, icon, format = 'number' }: SummaryCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'time':
        return val < 1 ? `${Math.round(val * 1000)}ms` : `${val.toFixed(1)}s`;
      case 'duration':
        if (val < 60) return `${Math.round(val)}s`;
        const minutes = Math.floor(val / 60);
        const seconds = Math.round(val % 60);
        if (minutes < 60) return `${minutes}m ${seconds}s`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
      default:
        return val.toLocaleString('de-DE');
    }
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs md:text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-foreground">
        {formatValue(value)}
      </div>
    </div>
  );
}

export default Conversations;

