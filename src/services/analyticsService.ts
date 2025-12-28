import { supabase } from '@/lib/supabase';
import { ConversationRow, ParsedConversationRow, parseConversationRow } from '@/types/supabase';

const TABLE_NAME = 'chat_analytics_yash_test';

// Fetch all conversations with optional filters
export interface ConversationFilters {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  language?: string;
  intent?: string;
  searchTerm?: string;
}

export const fetchConversations = async (
  filters: ConversationFilters = {}
): Promise<{ data: ParsedConversationRow[]; count: number }> => {
  let query = supabase
    .from(TABLE_NAME)
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false });

  // Apply filters
  if (filters.startDate) {
    query = query.gte('timestamp', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('timestamp', filters.endDate);
  }
  if (filters.language) {
    query = query.eq('detected_language', filters.language);
  }
  if (filters.intent) {
    query = query.eq('message_intent', filters.intent);
  }
  if (filters.searchTerm) {
    const searchPattern = `%${filters.searchTerm}%`;
    query = query.or(
      `user_message.ilike.${searchPattern},bot_response.ilike.${searchPattern}`
    );
  }

  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return {
    data: (data || []).map(parseConversationRow),
    count: count || 0,
  };
};

// Fetch metrics (aggregated data)
export interface Metrics {
  totalConversations: number;
  avgResponseTime: number;
  totalTimeSaved: number; // Sum of all response_time values
  toolUsageRate: number;
  fallbackRate: number;
  previousPeriod?: {
    totalConversations: number;
    avgResponseTime: number;
    totalTimeSaved: number;
    toolUsageRate: number;
    fallbackRate: number;
  };
}

export const fetchMetrics = async (startDate?: string, endDate?: string): Promise<Metrics> => {
  let query = supabase.from(TABLE_NAME).select('*');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch metrics: ${error.message}`);
  }

  const conversations = (data || []).map(parseConversationRow);
  const total = conversations.length;

  // Calculate current period metrics
  // Count conversations where tool_count > 0 (more reliable than checking tool_used string)
  const toolUsages = conversations.filter((c) => c.tool_count > 0).length;
  const fallbacks = conversations.filter((c) => c.workflow_status === 'fallback').length;
  const errors = conversations.filter((c) => c.has_error).length;

  // Calculate average response time using response_time field from table (convert ms to seconds)
  const responseTimes = conversations
    .map((c) => c.response_time)
    .filter((time): time is number => time !== null && time !== undefined);
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000 // Convert ms to seconds
    : 0;

  // Calculate total time saved (sum of all response_time values, convert ms to seconds)
  const totalTimeSaved = responseTimes.reduce((sum, time) => sum + time, 0) / 1000; // Convert ms to seconds

  // Calculate previous period for comparison (30 days before)
  let previousMetrics: Metrics['previousPeriod'] | undefined;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = start;

    const prevQuery = supabase
      .from(TABLE_NAME)
      .select('*')
      .gte('timestamp', previousStart.toISOString())
      .lt('timestamp', previousEnd.toISOString());

    const { data: prevData } = await prevQuery;
    const prevConversations = (prevData || []).map(parseConversationRow);
    const prevTotal = prevConversations.length;
    // Count conversations where tool_count > 0 (more reliable than checking tool_used string)
    const prevToolUsages = prevConversations.filter((c) => c.tool_count > 0).length;
    const prevFallbacks = prevConversations.filter((c) => c.workflow_status === 'fallback').length;

    const prevResponseTimes = prevConversations
      .map((c) => c.response_time)
      .filter((time): time is number => time !== null && time !== undefined);
    
    const prevAvgResponseTime = prevResponseTimes.length > 0
      ? prevResponseTimes.reduce((sum, time) => sum + time, 0) / prevResponseTimes.length / 1000 // Convert ms to seconds
      : 0;

    const prevTotalTimeSaved = prevResponseTimes.reduce((sum, time) => sum + time, 0) / 1000; // Convert ms to seconds

    previousMetrics = {
      totalConversations: prevTotal,
      avgResponseTime: prevAvgResponseTime,
      totalTimeSaved: prevTotalTimeSaved,
      toolUsageRate: prevTotal > 0 ? Math.round((prevToolUsages / prevTotal) * 100) : 0,
      fallbackRate: prevTotal > 0 ? parseFloat(((prevFallbacks / prevTotal) * 100).toFixed(1)) : 0,
    };
  }

  return {
    totalConversations: total,
    avgResponseTime: parseFloat(avgResponseTime.toFixed(1)),
    totalTimeSaved: parseFloat(totalTimeSaved.toFixed(1)),
    toolUsageRate: total > 0 ? Math.round((toolUsages / total) * 100) : 0,
    fallbackRate: 0, // Keep at 0 as requested - will be implemented later
    previousPeriod: previousMetrics,
  };
};

// Fetch conversation volume data for chart
export interface ConversationVolumeData {
  date: string;
  conversations: number;
}

export const fetchConversationVolume = async (
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<ConversationVolumeData[]> => {
  let query = supabase.from(TABLE_NAME).select('timestamp');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  } else if (!startDate) {
    // Default to last N days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    query = query.gte('timestamp', cutoff.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch conversation volume: ${error.message}`);
  }

  // Group by date
  const volumeMap: Record<string, number> = {};
  (data || []).forEach((row) => {
    const date = new Date(row.timestamp).toISOString().split('T')[0];
    volumeMap[date] = (volumeMap[date] || 0) + 1;
  });

  // Convert to array and sort by date
  return Object.entries(volumeMap)
    .map(([date, conversations]) => ({ date, conversations }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Fetch hourly heatmap data
export interface HourlyData {
  hour: number;
  day: number;
  value: number;
}

export const fetchHourlyHeatmap = async (
  startDate?: string,
  endDate?: string
): Promise<HourlyData[]> => {
  let query = supabase.from(TABLE_NAME).select('timestamp, hour_of_day, day_of_week');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch hourly heatmap: ${error.message}`);
  }

  // Group by hour and day
  const heatmapMap: Record<string, number> = {};
  (data || []).forEach((row) => {
    const key = `${row.day_of_week}-${row.hour_of_day}`;
    heatmapMap[key] = (heatmapMap[key] || 0) + 1;
  });

  // Convert to array format
  const result: HourlyData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      result.push({
        hour,
        day,
        value: heatmapMap[key] || 0,
      });
    }
  }

  return result;
};

// Fetch tool usage data
export interface ToolUsageData {
  name: string;
  count: number;
  successRate: number;
}

export const fetchToolUsage = async (
  startDate?: string,
  endDate?: string
): Promise<ToolUsageData[]> => {
  let query = supabase.from(TABLE_NAME).select('tool_used, has_error, workflow_status');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tool usage: ${error.message}`);
  }

  const toolCounts: Record<string, { count: number; errors: number }> = {};

  (data || []).forEach((row) => {
    if (row.tool_used) {
      if (!toolCounts[row.tool_used]) {
        toolCounts[row.tool_used] = { count: 0, errors: 0 };
      }
      toolCounts[row.tool_used].count++;
      if (row.has_error || row.workflow_status === 'error') {
        toolCounts[row.tool_used].errors++;
      }
    }
  });

  return Object.entries(toolCounts)
    .map(([name, data]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      count: data.count,
      successRate: Math.round(((data.count - data.errors) / data.count) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

// Fetch language distribution
export interface LanguageData {
  language: string;
  count: number;
  percentage: number;
}

export const fetchLanguageDistribution = async (
  startDate?: string,
  endDate?: string
): Promise<LanguageData[]> => {
  let query = supabase.from(TABLE_NAME).select('detected_language');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch language distribution: ${error.message}`);
  }

  const langCounts: Record<string, number> = {};
  (data || []).forEach((row) => {
    langCounts[row.detected_language] = (langCounts[row.detected_language] || 0) + 1;
  });

  const total = (data || []).length;
  const languageNames: Record<string, string> = {
    de: 'Deutsch',
    en: 'Englisch',
    fr: 'Französisch',
    es: 'Spanisch',
    it: 'Italienisch',
  };

  return Object.entries(langCounts)
    .map(([lang, count]) => ({
      language: languageNames[lang] || lang,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

// Fetch response quality data
export interface ResponseQualityData {
  name: string;
  value: number;
  color: string;
}

export const fetchResponseQuality = async (
  startDate?: string,
  endDate?: string
): Promise<ResponseQualityData[]> => {
  let query = supabase.from(TABLE_NAME).select('workflow_status, has_error');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch response quality: ${error.message}`);
  }

  const conversations = data || [];
  const total = conversations.length;
  
  // Match the table display logic exactly (priority order):
  // 1. Error: has_error=true OR workflow_status='error' (highest priority)
  // 2. Fallback: workflow_status='fallback' (but not if it's an error)
  // 3. Successful: workflow_status='success' AND has_error=false
  
  // Normalize has_error to boolean (handle string 'true'/'false' from database)
  const normalizeHasError = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  };
  
  // Normalize workflow_status (trim whitespace, lowercase for comparison)
  const normalizeWorkflowStatus = (value: any): string => {
    if (typeof value === 'string') return value.trim().toLowerCase();
    return String(value).trim().toLowerCase();
  };
  
  // Errors: has_error=true OR workflow_status='error' (using has_error flag as primary indicator)
  const errors = conversations.filter((c) => {
    const hasError = normalizeHasError(c.has_error);
    const status = normalizeWorkflowStatus(c.workflow_status);
    return hasError || status === 'error';
  }).length;
  
  // Fallback: workflow_status='fallback' AND not an error
  const fallback = conversations.filter((c) => {
    const hasError = normalizeHasError(c.has_error);
    const status = normalizeWorkflowStatus(c.workflow_status);
    return status === 'fallback' && !hasError;
  }).length;
  
  // Successful: workflow_status='success' AND has_error=false
  // Also include any other conversations that don't have errors and aren't fallback
  const successful = conversations.filter((c) => {
    const hasError = normalizeHasError(c.has_error);
    const status = normalizeWorkflowStatus(c.workflow_status);
    // Count as successful if: (status is 'success' OR status is not 'fallback'/'error') AND no error
    return !hasError && status !== 'fallback' && status !== 'error';
  }).length;

  // Build result array, only including non-zero values to avoid rendering issues
  const result: ResponseQualityData[] = [];
  
  if (successful > 0) {
    result.push({ name: 'Erfolgreich', value: successful, color: 'hsl(160, 70%, 45%)' });
  }
  if (fallback > 0) {
    result.push({ name: 'Fallback', value: fallback, color: 'hsl(45, 100%, 60%)' });
  }
  if (errors > 0) {
    result.push({ name: 'Fehler', value: errors, color: 'hsl(0, 72%, 55%)' });
  }

  // Ensure we always have at least one category (even if all are 0)
  if (result.length === 0 && total > 0) {
    result.push({ name: 'Erfolgreich', value: total, color: 'hsl(160, 70%, 45%)' });
  }

  return result;
};

// Fetch intent distribution data
export interface IntentData {
  intent: string;
  count: number;
  percentage: number;
}

export const fetchIntentDistribution = async (
  startDate?: string,
  endDate?: string
): Promise<IntentData[]> => {
  let query = supabase.from(TABLE_NAME).select('message_intent');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch intent distribution: ${error.message}`);
  }

  const intentCounts: Record<string, number> = {};
  (data || []).forEach((row) => {
    const intent = row.message_intent || 'Unknown';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });

  const total = (data || []).length;

  return Object.entries(intentCounts)
    .map(([intent, count]) => ({
      intent,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

// Fetch popular search terms
export interface SearchTermData {
  term: string;
  count: number;
}

export const fetchPopularSearchTerms = async (
  startDate?: string,
  endDate?: string,
  limit: number = 20
): Promise<SearchTermData[]> => {
  let query = supabase.from(TABLE_NAME).select('search_term');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch popular search terms: ${error.message}`);
  }

  const termCounts: Record<string, number> = {};
  (data || [])
    .filter((row) => row.search_term && row.search_term.trim() !== '')
    .forEach((row) => {
      const term = row.search_term!.trim();
      termCounts[term] = (termCounts[term] || 0) + 1;
    });

  return Object.entries(termCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Fetch error types breakdown
export interface ErrorTypeData {
  type: string;
  count: number;
  percentage: number;
}

export const fetchErrorTypes = async (
  startDate?: string,
  endDate?: string
): Promise<ErrorTypeData[]> => {
  let query = supabase.from(TABLE_NAME).select('error_type, has_error');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch error types: ${error.message}`);
  }

  const errorTypeCounts: Record<string, number> = {};
  let totalErrors = 0;

  // Normalize has_error to boolean (handle string 'true'/'false' from database)
  const normalizeHasError = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  };

  (data || []).forEach((row) => {
    // Only count rows with actual errors (normalize boolean)
    const hasError = normalizeHasError(row.has_error);
    if (hasError) {
      totalErrors++;
      const errorType = row.error_type && row.error_type.trim() !== '' 
        ? row.error_type.trim() 
        : 'Unknown Error';
      errorTypeCounts[errorType] = (errorTypeCounts[errorType] || 0) + 1;
    }
  });

  return Object.entries(errorTypeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

// Fetch price and availability info coverage
export interface InfoCoverageData {
  priceInfoCoverage: number; // percentage
  availabilityInfoCoverage: number; // percentage
  totalWithPriceInfo: number;
  totalWithAvailabilityInfo: number;
  totalConversations: number;
}

export const fetchInfoCoverage = async (
  startDate?: string,
  endDate?: string
): Promise<InfoCoverageData> => {
  let query = supabase.from(TABLE_NAME).select('has_price_info, has_availability_info');

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch info coverage: ${error.message}`);
  }

  const conversations = data || [];
  const total = conversations.length;

  const totalWithPriceInfo = conversations.filter((c) => c.has_price_info === true).length;
  const totalWithAvailabilityInfo = conversations.filter((c) => c.has_availability_info === true).length;

  return {
    priceInfoCoverage: total > 0 ? Math.round((totalWithPriceInfo / total) * 100) : 0,
    availabilityInfoCoverage: total > 0 ? Math.round((totalWithAvailabilityInfo / total) * 100) : 0,
    totalWithPriceInfo,
    totalWithAvailabilityInfo,
    totalConversations: total,
  };
};

// Fetch sessions grouped by session_id
export interface SessionMetrics {
  session_id: string;
  total_chats: number;
  first_message_timestamp: string;
  last_message_timestamp: string;
  total_duration_seconds: number;
  avg_response_time_seconds: number;
  languages: string[];
  has_errors: boolean;
  error_count: number;
  tool_usage_count: number;
}

export interface SessionFilters {
  startDate?: string;
  endDate?: string;
  minChats?: number; // Minimum number of chats per session (default: 3)
}

export const fetchSessions = async (
  filters: SessionFilters = {}
): Promise<{ data: SessionMetrics[]; count: number }> => {
  let query = supabase.from(TABLE_NAME).select('*');

  if (filters.startDate) {
    query = query.gte('timestamp', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('timestamp', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  const conversations = (data || []).map(parseConversationRow);
  
  // Group by session_id
  const sessionMap: Record<string, ParsedConversationRow[]> = {};
  conversations.forEach((conv) => {
    if (!sessionMap[conv.session_id]) {
      sessionMap[conv.session_id] = [];
    }
    sessionMap[conv.session_id].push(conv);
  });

  // Calculate metrics for each session
  const sessions: SessionMetrics[] = [];
  const minChats = filters.minChats ?? 3;

  Object.entries(sessionMap).forEach(([sessionId, sessionConversations]) => {
    // Filter out sessions with less than minChats
    if (sessionConversations.length < minChats) {
      return;
    }

    // Sort by timestamp
    sessionConversations.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstTimestamp = sessionConversations[0].timestamp;
    const lastTimestamp = sessionConversations[sessionConversations.length - 1].timestamp;
    
    // Calculate total duration
    const totalDurationMs = new Date(lastTimestamp).getTime() - new Date(firstTimestamp).getTime();
    const totalDurationSeconds = totalDurationMs / 1000;

    // Calculate average response time
    const responseTimes = sessionConversations
      .map((c) => c.response_time)
      .filter((time): time is number => time !== null && time !== undefined);
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000 // Convert ms to seconds
      : 0;

    // Get unique languages
    const languages = [...new Set(sessionConversations.map((c) => c.detected_language))];

    // Count errors and tool usage
    const errorCount = sessionConversations.filter((c) => c.has_error).length;
    const toolUsageCount = sessionConversations.filter((c) => c.tool_count > 0).length;

    sessions.push({
      session_id: sessionId,
      total_chats: sessionConversations.length,
      first_message_timestamp: firstTimestamp,
      last_message_timestamp: lastTimestamp,
      total_duration_seconds: totalDurationSeconds,
      avg_response_time_seconds: avgResponseTime,
      languages,
      has_errors: errorCount > 0,
      error_count: errorCount,
      tool_usage_count: toolUsageCount,
    });
  });

  // Sort by last message timestamp (most recent first)
  sessions.sort((a, b) => 
    new Date(b.last_message_timestamp).getTime() - new Date(a.last_message_timestamp).getTime()
  );

  return {
    data: sessions,
    count: sessions.length,
  };
};

// Fetch detailed conversations for a specific session
export interface SessionDetail {
  session_id: string;
  conversations: ParsedConversationRow[];
  metrics: SessionMetrics;
}

export const fetchSessionDetails = async (sessionId: string): Promise<SessionDetail> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch session details: ${error.message}`);
  }

  const conversations = (data || []).map(parseConversationRow);

  if (conversations.length === 0) {
    throw new Error(`No conversations found for session: ${sessionId}`);
  }

  // Calculate session metrics (same logic as fetchSessions)
  conversations.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstTimestamp = conversations[0].timestamp;
  const lastTimestamp = conversations[conversations.length - 1].timestamp;
  
  const totalDurationMs = new Date(lastTimestamp).getTime() - new Date(firstTimestamp).getTime();
  const totalDurationSeconds = totalDurationMs / 1000;

  const responseTimes = conversations
    .map((c) => c.response_time)
    .filter((time): time is number => time !== null && time !== undefined);
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000
    : 0;

  const languages = [...new Set(conversations.map((c) => c.detected_language))];
  const errorCount = conversations.filter((c) => c.has_error).length;
  const toolUsageCount = conversations.filter((c) => c.tool_count > 0).length;

  const metrics: SessionMetrics = {
    session_id: sessionId,
    total_chats: conversations.length,
    first_message_timestamp: firstTimestamp,
    last_message_timestamp: lastTimestamp,
    total_duration_seconds: totalDurationSeconds,
    avg_response_time_seconds: avgResponseTime,
    languages,
    has_errors: errorCount > 0,
    error_count: errorCount,
    tool_usage_count: toolUsageCount,
  };

  return {
    session_id: sessionId,
    conversations,
    metrics,
  };
};

