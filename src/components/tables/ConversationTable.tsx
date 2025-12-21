import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Wrench,
  Globe,
  Clock,
  Search,
} from 'lucide-react';
import { mockConversations } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const ConversationTable = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.bot_response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
              {filteredConversations.length.toLocaleString('de-DE')} Einträge
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-muted border-border min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border/50">
        {paginatedConversations.map((conv) => (
          <div
            key={conv.id}
            className="p-4 touch-manipulation"
            onClick={() => setExpandedRow(expandedRow === conv.id ? null : conv.id)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(conv.timestamp)}
              </div>
              {conv.is_fallback ? (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px]">
                  Fallback
                </Badge>
              ) : conv.tool_error ? (
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            </div>
            <AnimatePresence>
              {expandedRow === conv.id && (
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Zeit</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Nachricht</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Antwort</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Tools</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedConversations.map((conv) => (
              <tr
                key={conv.id}
                className={cn(
                  'border-b border-border/50 hover:bg-card-hover transition-colors cursor-pointer',
                  expandedRow === conv.id && 'bg-card-hover'
                )}
                onClick={() => setExpandedRow(expandedRow === conv.id ? null : conv.id)}
              >
                <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">{formatDate(conv.timestamp)}</td>
                <td className="py-4 px-6 text-sm text-foreground">{truncateText(conv.user_message)}</td>
                <td className="py-4 px-6 text-sm text-muted-foreground">{truncateText(conv.bot_response)}</td>
                <td className="py-4 px-6">
                  {conv.tool_used ? (
                    <span className="flex items-center gap-1 text-sm"><Wrench className="w-3 h-3 text-accent" />{conv.tool_count}</span>
                  ) : '—'}
                </td>
                <td className="py-4 px-6">
                  {conv.is_fallback ? (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Fallback</Badge>
                  ) : conv.tool_error ? (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Fehler</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">Erfolg</Badge>
                  )}
                </td>
                <td className="py-4 px-6">{expandedRow === conv.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-xs md:text-sm text-muted-foreground">
          Seite {currentPage} von {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
              currentPage === 1 ? 'bg-muted text-muted-foreground' : 'bg-card hover:bg-card-hover text-foreground'
            )}
          >
            Zurück
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
              currentPage === totalPages ? 'bg-muted text-muted-foreground' : 'bg-card hover:bg-card-hover text-foreground'
            )}
          >
            Weiter
          </button>
        </div>
      </div>
    </motion.div>
  );
};
