import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the Supabase table name from environment variables.
 * Falls back to 'chat_analytics_yash_test' if not configured.
 */
export function getTableName(): string {
  return import.meta.env.VITE_SUPABASE_TABLE_NAME || 'chat_analytics_yash_test';
}