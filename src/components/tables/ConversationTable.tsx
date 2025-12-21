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
      year: 'numeric',
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
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Letzte Konversationen
            </h3>
            <p className="text-sm text-muted-foreground">
              {filteredConversations.length.toLocaleString('de-DE')} Einträge
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-muted border-border"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Zeit
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nachricht
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Antwort
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tools
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sprache
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedConversations.map((conv) => (
              <motion.tr
                key={conv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'border-b border-border/50 hover:bg-card-hover transition-colors cursor-pointer',
                  expandedRow === conv.id && 'bg-card-hover'
                )}
                onClick={() =>
                  setExpandedRow(expandedRow === conv.id ? null : conv.id)
                }
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(conv.timestamp)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-foreground">
                    {truncateText(conv.user_message)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-muted-foreground">
                    {truncateText(conv.bot_response)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {conv.tool_used ? (
                    <div className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-accent" />
                      <span className="text-sm text-foreground">
                        {conv.tool_count}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-foreground uppercase">
                      {conv.detected_language}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {conv.is_fallback ? (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      Fallback
                    </Badge>
                  ) : conv.tool_error ? (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      Fehler
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Erfolg
                    </Badge>
                  )}
                </td>
                <td className="py-4 px-6">
                  {expandedRow === conv.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Expanded Row Details */}
        <AnimatePresence>
          {expandedRow && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border bg-muted/30 p-6"
            >
              {(() => {
                const conv = paginatedConversations.find(
                  (c) => c.id === expandedRow
                );
                if (!conv) return null;
                return (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        Nutzernachricht
                      </h4>
                      <p className="text-sm text-muted-foreground bg-card p-4 rounded-lg">
                        {conv.user_message}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-info" />
                        Bot-Antwort
                      </h4>
                      <p className="text-sm text-muted-foreground bg-card p-4 rounded-lg">
                        {conv.bot_response}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-4 mt-2">
                      {conv.tool_used && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="w-4 h-4 text-accent" />
                          <span className="text-muted-foreground">Tool:</span>
                          <span className="text-foreground">{conv.tool_used}</span>
                        </div>
                      )}
                      {conv.search_term && (
                        <div className="flex items-center gap-2 text-sm">
                          <Search className="w-4 h-4 text-info" />
                          <span className="text-muted-foreground">Suchbegriff:</span>
                          <span className="text-foreground">{conv.search_term}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Seite {currentPage} von {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              currentPage === 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-card hover:bg-card-hover text-foreground'
            )}
          >
            Zurück
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              currentPage === totalPages
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-card hover:bg-card-hover text-foreground'
            )}
          >
            Weiter
          </button>
        </div>
      </div>
    </motion.div>
  );
};
