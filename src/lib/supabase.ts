import { createClient } from '@supabase/supabase-js';
import { createPostgRESTClient, type PostgRESTClient } from './postgrest';
import { getPostgRESTUrl, isUsingPostgREST } from './config';

// Determine which backend to use
const postgrestUrl = getPostgRESTUrl();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Type that works with both clients (they share the same query interface)
type DatabaseClient = ReturnType<typeof createClient> | PostgRESTClient;

let client: DatabaseClient;

if (postgrestUrl) {
  // Use PostgREST
  console.log('Using PostgREST backend:', postgrestUrl);
  client = createPostgRESTClient(postgrestUrl);
} else if (supabaseUrl && supabaseAnonKey) {
  // Use Supabase
  console.log('Using Supabase backend');
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  throw new Error(
    'Missing database configuration. Set either VITE_POSTGREST_URL or both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

export const supabase = client;
export { isUsingPostgREST };

