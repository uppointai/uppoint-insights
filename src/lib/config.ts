// Configuration for table names - can be overridden via environment variables
export const getAnalyticsTableName = (): string => {
  return import.meta.env.VITE_ANALYTICS_TABLE_NAME || 'chat_analytics_yash_test';
};

export const getFeedbackTableName = (): string => {
  return import.meta.env.VITE_FEEDBACK_TABLE_NAME || 'chat_feedback';
};

