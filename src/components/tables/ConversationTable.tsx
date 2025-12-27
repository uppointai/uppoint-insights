import { useState, useMemo, Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Wrench,
  Globe,
  Clock,
  Search,
  Tag,
  DollarSign,
  Package,
} from 'lucide-react';
import { useConversationsWithPagination } from '@/hooks/useAnalytics';
import type { ParsedConversationRow } from '@/services/analyticsService';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export const ConversationTable = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [previousConversations, setPreviousConversations] = useState<ParsedConversationRow[]>([]);
  const itemsPerPage = 10;

  // Fetch conversations with pagination
  const { data, isLoading, error } = useConversationsWithPagination({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    searchTerm: searchTerm || undefined,
  });

  const conversations = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Keep previous conversations visible while loading new page
  useEffect(() => {
    if (conversations.length > 0 && !isLoading) {
      setPreviousConversations(conversations);
    }
  }, [conversations, isLoading]);

  // Use previous conversations if current is empty and loading
  const displayConversations = isLoading && conversations.length === 0 
    ? previousConversations 
    : conversations;

  // Client-side filtering for search (if needed as fallback)
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return displayConversations;
    return displayConversations.filter(
      (conv) =>
        (conv.user_message?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        conv.bot_response.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayConversations, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Show loading skeleton on initial load
  if (isLoading && currentPage === 1 && displayConversations.length === 0) {
    return (
      <div className="data-table">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">
                Letzte Konversationen
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">Laden...</p>
            </div>
          </div>
        </div>
        <LoadingSkeleton className="h-[400px]" />
      </div>
    );
  }

  if (error) {
    console.error('ConversationTable error:', error);
    return (
      <div className="data-table">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">
                Letzte Konversationen
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">Fehler beim Laden</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground space-y-2">
          <p>Fehler beim Laden der Konversationen.</p>
          <p className="text-xs">
            {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </p>
          <p className="text-xs mt-4">
            Bitte überprüfen Sie:
            <br />• Supabase Credentials in .env.local
            <br />• Tabelle "chat_analytics_yash_test" existiert
            <br />• Browser-Konsole (F12) für Details
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="data-table"
    >
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              Letzte Konversationen
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {totalCount.toLocaleString('de-DE')} Einträge
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Trigger refetch with new search term
                  setCurrentPage(1);
                }
              }}
              className="pl-10 bg-muted border-border min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border/50 relative">
        {filteredConversations.map((conv, index) => (
          <div
            key={`mobile-${conv.session_id}-${index}`}
            className={cn(
              "p-4 touch-manipulation transition-all duration-300",
              isLoading && conversations.length === 0 && "opacity-40 pointer-events-none"
            )}
            onClick={() => !isLoading && setExpandedRow(expandedRow === conv.session_id ? null : conv.session_id)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(conv.timestamp)}
              </div>
              {conv.workflow_status === 'fallback' ? (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px]">
                  Fallback
                </Badge>
              ) : conv.has_error ? (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                  Fehler
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
                  Erfolg
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground mb-1">{truncateText(conv.user_message, 60)}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {conv.tool_used && (
                <span className="flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-accent" />
                  {conv.tool_count}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {conv.detected_language.toUpperCase()}
              </span>
              {conv.message_intent && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {conv.message_intent.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <AnimatePresence>
              {expandedRow === conv.session_id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-border/50 space-y-3"
                >
                  <div>
                    <p className="text-xs font-medium text-accent mb-1">Bot-Antwort:</p>
                    <p className="text-sm text-muted-foreground">{conv.bot_response}</p>
                  </div>
                  {(conv.search_term || conv.interaction_type || conv.has_price_info || conv.has_availability_info) && (
                    <div className="space-y-2">
                      {conv.search_term && (
                        <div className="flex items-start gap-2">
                          <Search className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-accent">Suchbegriff:</p>
                            <p className="text-xs text-muted-foreground">{conv.search_term}</p>
                          </div>
                        </div>
                      )}
                      {conv.interaction_type && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-accent" />
                          <div>
                            <p className="text-xs font-medium text-accent">Interaktionstyp:</p>
                            <p className="text-xs text-muted-foreground">{conv.interaction_type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        {conv.has_price_info && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
                            <DollarSign className="w-2.5 h-2.5 mr-1" />
                            Preisinfo
                          </Badge>
                        )}
                        {conv.has_availability_info && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
                            <Package className="w-2.5 h-2.5 mr-1" />
                            Verfügbarkeit
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {/* Loading overlay for mobile */}
        {isLoading && conversations.length === 0 && displayConversations.length > 0 && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-2 bg-card/90 rounded-lg px-4 py-3 border border-border">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Laden...</span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto relative">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Zeit</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Nachricht</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Intent</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Tools</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Info</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="relative">
            {filteredConversations.map((conv, index) => (
                <Fragment key={`fragment-${conv.session_id}-${index}`}>
                  <tr
                    key={`row-${conv.session_id}-${index}`}
                    className={cn(
                      'border-b border-border/50 hover:bg-card-hover transition-all duration-300 cursor-pointer',
                      expandedRow === conv.session_id && 'bg-card-hover',
                      isLoading && conversations.length === 0 && 'opacity-40 pointer-events-none'
                    )}
                    onClick={() => !isLoading && setExpandedRow(expandedRow === conv.session_id ? null : conv.session_id)}
                  >
                <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">{formatDate(conv.timestamp)}</td>
                <td className="py-4 px-6 text-sm text-foreground">{truncateText(conv.user_message)}</td>
                <td className="py-4 px-6">
                  {conv.message_intent ? (
                    <Badge variant="outline" className="text-xs">
                      {conv.message_intent.replace(/_/g, ' ')}
                    </Badge>
                  ) : '—'}
                </td>
                <td className="py-4 px-6">
                  {conv.tool_used ? (
                    <span className="flex items-center gap-1 text-sm"><Wrench className="w-3 h-3 text-accent" />{conv.tool_count}</span>
                  ) : '—'}
                </td>
                <td className="py-4 px-6">
                  {conv.workflow_status === 'fallback' ? (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Fallback</Badge>
                  ) : conv.has_error ? (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Fehler</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">Erfolg</Badge>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    {conv.has_price_info && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] px-1.5" title="Preisinfo verfügbar">
                        <DollarSign className="w-3 h-3" />
                      </Badge>
                    )}
                    {conv.has_availability_info && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] px-1.5" title="Verfügbarkeitsinfo verfügbar">
                        <Package className="w-3 h-3" />
                      </Badge>
                    )}
                    {!conv.has_price_info && !conv.has_availability_info && '—'}
                  </div>
                </td>
                <td className="py-4 px-6">{expandedRow === conv.session_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</td>
              </tr>
              {expandedRow === conv.session_id && (
                <tr key={`expanded-${conv.session_id}-${index}`} className="bg-card-hover">
                  <td colSpan={7} className="py-4 px-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-accent mb-1">Bot-Antwort:</p>
                        <p className="text-sm text-muted-foreground">{conv.bot_response}</p>
                      </div>
                      {(conv.search_term || conv.interaction_type) && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                          {conv.search_term && (
                            <div>
                              <p className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                                <Search className="w-3 h-3" />
                                Suchbegriff:
                              </p>
                              <p className="text-xs text-muted-foreground">{conv.search_term}</p>
                            </div>
                          )}
                          {conv.interaction_type && (
                            <div>
                              <p className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Interaktionstyp:
                              </p>
                              <p className="text-xs text-muted-foreground">{conv.interaction_type.replace(/_/g, ' ')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
                </Fragment>
              ))}
          </tbody>
        </table>
        {/* Loading overlay wrapper for better positioning */}
        {isLoading && conversations.length === 0 && displayConversations.length > 0 && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-2 bg-card/90 rounded-lg px-4 py-3 border border-border shadow-lg">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Laden...</span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-xs md:text-sm text-muted-foreground">
          Seite {currentPage} von {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              setExpandedRow(null); // Close expanded row when changing page
            }}
            disabled={currentPage === 1 || isLoading}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
              (currentPage === 1 || isLoading) ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card hover:bg-card-hover text-foreground'
            )}
          >
            Zurück
          </button>
          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              setExpandedRow(null); // Close expanded row when changing page
            }}
            disabled={currentPage === totalPages || isLoading}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
              (currentPage === totalPages || isLoading) ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card hover:bg-card-hover text-foreground'
            )}
          >
            Weiter
          </button>
        </div>
      </div>
    </motion.div>
  );
};
