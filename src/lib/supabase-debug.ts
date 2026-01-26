// Debug utility to check Supabase connection
import { getAnalyticsTableName, getFeedbackTableName } from './config';

export const checkSupabaseConnection = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.group('🔍 Supabase Connection Debug');
  console.log('URL:', url ? `${url.substring(0, 20)}...` : '❌ MISSING');
  console.log('Key:', key ? `${key.substring(0, 20)}...` : '❌ MISSING');
  console.log('Analytics Table:', getAnalyticsTableName());
  console.log('Feedback Table:', getFeedbackTableName());
  
  if (!url || !key) {
    console.error('❌ Environment variables are missing!');
    console.log('Make sure .env.local exists with:');
    console.log('VITE_SUPABASE_URL=...');
    console.log('VITE_SUPABASE_ANON_KEY=...');
  } else {
    console.log('✅ Environment variables found');
  }
  console.groupEnd();

  return { url: !!url, key: !!key };
};

