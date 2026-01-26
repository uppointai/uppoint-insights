// TypeScript types for chat_analytics_yash_test table

export interface ConversationRow {
  session_id: string;
  timestamp: string;
  hour_of_day: number;
  day_of_week: number;
  is_business_hours: boolean;
  user_message: string | null;
  user_message_length: number;
  detected_language: string;
  message_intent: string;
  bot_response: string;
  bot_response_length: number;
  interaction_type: string;
  workflow_status: string;
  tool_used: string | null;
  tool_count: number;
  tools_used: string | null; // JSON array as string
  search_term: string | null;
  products_found: number;
  products_available: number;
  product_category: string | null;
  price_min: number | null;
  price_max: number | null;
  has_error: boolean;
  error_type: string | null;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  cache_hit_rate: number;
  model_name: string;
  estimated_cost_usd: number;
  interaction_successful: boolean;
  has_price_info: boolean;
  has_availability_info: boolean;
  response_quality: number;
  response_time: number | null;
  responsetimestamp: number | null;
}

// Helper type for parsed tools_used
export interface ParsedConversationRow extends Omit<ConversationRow, 'tools_used'> {
  tools_used: string[] | null;
}

// Transform database row to include parsed JSON fields
export const parseConversationRow = (row: ConversationRow): ParsedConversationRow => {
  let toolsUsed: string[] | null = null;
  
  if (row.tools_used) {
    try {
      // Handle both JSON string and already parsed array
      if (typeof row.tools_used === 'string') {
        // Trim and check if it's a valid JSON string
        const trimmed = row.tools_used.trim();
        if (trimmed && trimmed !== 'null' && trimmed !== '') {
          // Check if it starts with [ or { to be valid JSON
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            toolsUsed = JSON.parse(trimmed);
          } else {
            // If it's not valid JSON, treat as single item array
            toolsUsed = [trimmed];
          }
        }
      } else if (Array.isArray(row.tools_used)) {
        toolsUsed = row.tools_used;
      }
    } catch (e) {
      // Silently fail - don't log to avoid console spam
      // If parsing fails, tools_used remains null
    }
  }

  // Normalize has_error to boolean (handle string 'true'/'false' from database)
  const normalizeHasError = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  };

  return {
    ...row,
    tools_used: toolsUsed,
    has_error: normalizeHasError(row.has_error),
  };
};

