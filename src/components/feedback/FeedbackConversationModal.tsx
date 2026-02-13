import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Clock,
  Timer,
  AlertCircle,
  CheckCircle2,
  Globe,
  Zap,
  Copy,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionDetail } from '@/services/analyticsService';
import { Button } from '@/components/ui/button';

interface FeedbackConversationModalProps {
  sessionId: string | null;
  responseTimestamp: number | null;
  feedbackType: 'thumbs_up' | 'thumbs_down' | null;
  comment: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionDetail: SessionDetail | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const FeedbackConversationModal = ({
  sessionId,
  responseTimestamp,
  feedbackType,
  comment,
  open,
  onOpenChange,
  sessionDetail,
  isLoading,
  error,
}: FeedbackConversationModalProps) => {
  const highlightedMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted message when conversation loads
  useEffect(() => {
    if (sessionDetail && open && responseTimestamp && highlightedMessageRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        highlightedMessageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [sessionDetail, open, responseTimestamp]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return formatDate(dateString);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  // Check if a conversation's responsetimestamp matches the feedback timestamp
  const isHighlightedMessage = (conv: { responsetimestamp: number | null }) => {
    if (!responseTimestamp || !conv.responsetimestamp) return false;
    // Compare timestamps (they should match exactly, but allow small tolerance for timestamp conversion)
    return Math.abs(conv.responsetimestamp - responseTimestamp) < 1000; // 1 second tolerance
  };

  const handleCopySession = () => {
    if (!sessionDetail) return;
    const text = sessionDetail.conversations
      .map((conv) => {
        return `User: ${conv.user_message || '(keine Nachricht)'}\nBot: ${conv.bot_response}\n---`;
      })
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDownloadSession = () => {
    if (!sessionDetail) return;
    const data = {
      session_id: sessionDetail.session_id,
      metrics: sessionDetail.metrics,
      conversations: sessionDetail.conversations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionDetail.session_id.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton className="h-8 w-64 mb-4" />
            <LoadingSkeleton className="h-[400px]" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fehler beim Laden</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        ) : sessionDetail ? (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl mb-2">
                    Vollständige Konversation
                  </DialogTitle>
                  {comment && comment.trim() !== '' && (
                    <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kommentar</span>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{comment}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="font-mono text-xs">{sessionDetail.session_id}</div>
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {formatDuration(sessionDetail.metrics.total_duration_seconds)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Ø {formatTime(sessionDetail.metrics.avg_response_time_seconds)}
                    </div>
                    {sessionDetail.metrics.has_errors && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {sessionDetail.metrics.error_count} Fehler
                      </div>
                    )}
                    {sessionDetail.metrics.tool_usage_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {sessionDetail.metrics.tool_usage_count} Tools
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {sessionDetail.metrics.languages.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySession}
                    className="h-8"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Kopieren
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSession}
                    className="h-8"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {sessionDetail.conversations.map((conv, index) => {
                const isHighlighted = isHighlightedMessage(conv);
                
                return (
                  <div key={index} className="space-y-2">
                    {/* User Message */}
                    {conv.user_message && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] md:max-w-[70%]">
                          <div className="bg-accent/10 rounded-2xl rounded-tr-sm px-4 py-3">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {conv.user_message}
                            </p>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1 px-2">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(conv.timestamp)}
                            </span>
                            {conv.message_intent && (
                              <Badge variant="outline" className="text-xs">
                                {conv.message_intent.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bot Response */}
                    <div className="flex justify-start">
                      <div 
                        className="max-w-[80%] md:max-w-[70%]"
                        ref={isHighlighted ? highlightedMessageRef : null}
                      >
                        <div
                          className={cn(
                            'rounded-2xl rounded-tl-sm px-4 py-3 transition-all',
                            isHighlighted && feedbackType
                              ? feedbackType === 'thumbs_up'
                                ? 'bg-green-500/20 border-2 border-green-500 shadow-lg ring-2 ring-green-500/30'
                                : 'bg-red-500/20 border-2 border-red-500 shadow-lg ring-2 ring-red-500/30'
                              : conv.has_error
                              ? 'bg-destructive/10 border border-destructive/20'
                              : 'bg-muted'
                          )}
                        >
                          {isHighlighted && feedbackType && (
                            <div className={cn(
                              "mb-2 flex items-center gap-1 text-xs font-semibold",
                              feedbackType === 'thumbs_up' 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-red-600 dark:text-red-400"
                            )}>
                              <AlertCircle className="w-3 h-3" />
                              {feedbackType === 'thumbs_up' 
                                ? 'This answer received positive feedback.'
                                : 'This answer received negative feedback.'}
                            </div>
                          )}
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {conv.bot_response}
                          </p>
                          {conv.has_error && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="w-3 h-3" />
                              {conv.error_type || 'Fehler'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-2">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(conv.timestamp)}
                          </span>
                          {conv.tool_used && (
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              <Zap className="w-3 h-3 mr-1" />
                              {conv.tool_used.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {conv.workflow_status === 'fallback' && (
                            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                              Fallback
                            </Badge>
                          )}
                          {!conv.has_error && conv.workflow_status !== 'fallback' && (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
