// Configuration for table names - can be overridden via environment variables
export const getAnalyticsTableName = (): string => {
  return import.meta.env.VITE_ANALYTICS_TABLE_NAME || 'chat_analytics_yash_test';
};

// PostgREST URL configuration
export const getPostgRESTUrl = (): string | undefined => {
  return import.meta.env.VITE_POSTGREST_URL;
};

// Check if using PostgREST (instead of Supabase)
export const isUsingPostgREST = (): boolean => {
  return !!import.meta.env.VITE_POSTGREST_URL;
};

export const getFeedbackTableName = (): string => {
  return import.meta.env.VITE_FEEDBACK_TABLE_NAME || 'chat_feedback';
};

