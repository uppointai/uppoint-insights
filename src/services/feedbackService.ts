import { supabase } from '@/lib/supabase';
import { getAnalyticsTableName, getFeedbackTableName } from '@/lib/config';
import { ParsedConversationRow, parseConversationRow } from '@/types/supabase';

export interface FeedbackRow {
  sessionId: string;
  responsetimestamp: number;
  feedback: string;
  comment: string | null;
  created_at: string;
  username: string | null;
}

export interface FeedbackWithAnalytics extends FeedbackRow {
  analytics?: ParsedConversationRow;
}

export interface FeedbackFilters {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  feedback?: 'thumbs_up' | 'thumbs_down';
  searchTerm?: string;
}

// Fetch feedback with joined analytics data
export const fetchFeedback = async (
  filters: FeedbackFilters = {}
): Promise<{ data: FeedbackWithAnalytics[]; count: number }> => {
  const feedbackTableName = getFeedbackTableName();
  const analyticsTableName = getAnalyticsTableName();

  // Build feedback query
  // Use created_at as the date column (Supabase typically uses snake_case)
  const dateColumn = 'created_at';
  
  let feedbackQuery = supabase
    .from(feedbackTableName)
    .select('*', { count: 'exact' })
    .order(dateColumn, { ascending: false });

  // Apply filters
  if (filters.startDate) {
    feedbackQuery = feedbackQuery.gte(dateColumn, filters.startDate);
  }
  if (filters.endDate) {
    feedbackQuery = feedbackQuery.lte(dateColumn, filters.endDate);
  }
  if (filters.feedback) {
    feedbackQuery = feedbackQuery.eq('feedback', filters.feedback);
  }
  if (filters.searchTerm) {
    const searchPattern = `%${filters.searchTerm}%`;
    // Handle both camelCase and snake_case column names in search
    // Try sessionId first, fallback to session_id if needed
    feedbackQuery = feedbackQuery.or(
      `comment.ilike.${searchPattern},sessionId.ilike.${searchPattern}`
    );
  }

  // Apply pagination
  if (filters.limit) {
    feedbackQuery = feedbackQuery.limit(filters.limit);
  }
  if (filters.offset) {
    feedbackQuery = feedbackQuery.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
  }

  const { data: feedbackData, error: feedbackError, count } = await feedbackQuery;

  if (feedbackError) {
    console.error('❌ Feedback query error:', feedbackError);
    throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);
  }

  if (!feedbackData || feedbackData.length === 0) {
    return { data: [], count: count || 0 };
  }

  // Map feedback data to our interface
  // Handle both camelCase (sessionId) and snake_case (session_id) column names
  const feedbackRows: FeedbackRow[] = feedbackData.map((row: any) => {
    const username = row.username || row.user_name;
    // Convert empty string to null for consistent handling
    return {
      sessionId: row.sessionId || row.session_id,
      responsetimestamp: row.responsetimestamp || row.response_timestamp,
      feedback: row.feedback,
      comment: row.comment,
      created_at: row.created_at || row.createdAt,
      username: username && username.trim() !== '' ? username : null,
    };
  });

  // Fetch corresponding analytics data for each feedback
  // We need to match by session_id and responsetimestamp
  const feedbackWithAnalytics: FeedbackWithAnalytics[] = [];

  for (const feedback of feedbackRows) {
    // Find the matching analytics row
    // Match by session_id (analytics) = sessionId (feedback) and responsetimestamp (both)
    // Convert responsetimestamp to number to ensure type matching
    const responsetimestampNum = typeof feedback.responsetimestamp === 'string' 
      ? parseInt(feedback.responsetimestamp, 10) 
      : feedback.responsetimestamp;

    const { data: analyticsData, error: analyticsError } = await supabase
      .from(analyticsTableName)
      .select('*')
      .eq('session_id', feedback.sessionId)
      .eq('responsetimestamp', responsetimestampNum)
      .limit(1);

    if (analyticsError) {
      console.warn(`Failed to fetch analytics for feedback ${feedback.sessionId}:`, analyticsError);
    }

    const analytics = analyticsData && analyticsData.length > 0
      ? parseConversationRow(analyticsData[0])
      : undefined;

    feedbackWithAnalytics.push({
      ...feedback,
      analytics,
    });
  }

  return {
    data: feedbackWithAnalytics,
    count: count || 0,
  };
};

// Fetch feedback statistics
export interface FeedbackStats {
  total: number;
  thumbsUp: number;
  thumbsDown: number;
  thumbsUpPercentage: number;
  thumbsDownPercentage: number;
}

export const fetchFeedbackStats = async (
  startDate?: string,
  endDate?: string
): Promise<FeedbackStats> => {
  const feedbackTableName = getFeedbackTableName();

  let query = supabase.from(feedbackTableName).select('feedback');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch feedback stats: ${error.message}`);
  }

  const total = data?.length || 0;
  const thumbsUp = data?.filter((row) => row.feedback === 'thumbs_up').length || 0;
  const thumbsDown = data?.filter((row) => row.feedback === 'thumbs_down').length || 0;

  return {
    total,
    thumbsUp,
    thumbsDown,
    thumbsUpPercentage: total > 0 ? Math.round((thumbsUp / total) * 100) : 0,
    thumbsDownPercentage: total > 0 ? Math.round((thumbsDown / total) * 100) : 0,
  };
};

