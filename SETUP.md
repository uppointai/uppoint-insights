# Supabase Setup Instructions

## Quick Start

1. **Create `.env.local` file** in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the "Project URL" → `VITE_SUPABASE_URL`
   - Copy the "anon public" key → `VITE_SUPABASE_ANON_KEY`

3. **Table Names (Optional - defaults provided):**
   - Analytics table: `chat_analytics_yash_test` (default)
   - Feedback table: `chat_feedback` (default)
   - You can override these by adding to `.env.local`:
     ```env
     VITE_ANALYTICS_TABLE_NAME=your_analytics_table_name
     VITE_FEEDBACK_TABLE_NAME=your_feedback_table_name
     ```
   - Make sure both tables exist in your Supabase database

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database Table Structures

### Analytics Table (`chat_analytics_yash_test` by default)

Your Supabase analytics table should have the following columns:

- `session_id` (text)
- `timestamp` (timestamp)
- `hour_of_day` (integer)
- `day_of_week` (integer)
- `is_business_hours` (boolean)
- `user_message` (text, nullable)
- `user_message_length` (integer)
- `detected_language` (text)
- `message_intent` (text)
- `bot_response` (text)
- `bot_response_length` (integer)
- `interaction_type` (text)
- `workflow_status` (text)
- `tool_used` (text, nullable)
- `tool_count` (integer)
- `tools_used` (text/json, nullable)
- `search_term` (text, nullable)
- `products_found` (integer)
- `products_available` (integer)
- `product_category` (text, nullable)
- `price_min` (numeric, nullable)
- `price_max` (numeric, nullable)
- `has_error` (boolean)
- `error_type` (text, nullable)
- `total_tokens` (integer)
- `prompt_tokens` (integer)
- `completion_tokens` (integer)
- `cached_tokens` (integer)
- `cache_hit_rate` (numeric)
- `model_name` (text)
- `estimated_cost_usd` (numeric)
- `interaction_successful` (boolean)
- `has_price_info` (boolean)
- `has_availability_info` (boolean)
- `response_quality` (integer)
- `responsetimestamp` (bigint/numeric) - Used to join with feedback table

### Feedback Table (`chat_feedback` by default)

Your Supabase feedback table should have the following columns:

- `sessionId` or `session_id` (text) - Session identifier (matches `session_id` in analytics table)
- `responsetimestamp` (bigint/numeric) - Response timestamp (matches `responsetimestamp` in analytics table)
- `feedback` (text) - Either `thumbs_up` or `thumbs_down`
- `comment` (text, nullable) - Optional user comment
- `created_at` (timestamp) - When the feedback was created

**Note:** The feedback table joins with the analytics table using `session_id` and `responsetimestamp` to show which response received the feedback.

## Row Level Security (RLS)

For production, consider enabling Row Level Security:

1. Go to Authentication → Policies in Supabase
2. Create a policy for SELECT operations on `chat_analytics_yash_test`
3. Example policy (for public read access):
   ```sql
   CREATE POLICY "Allow public read access" 
   ON chat_analytics_yash_test 
   FOR SELECT 
   USING (true);
   ```

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the root directory
- Check that variable names start with `VITE_`
- Restart the dev server after adding environment variables

### "Failed to fetch conversations" error
- Verify your Supabase URL and anon key are correct
- Check that the table names match (defaults: `chat_analytics_yash_test` and `chat_feedback`)
- Ensure RLS policies allow read access (or disable RLS for testing)
- For feedback page, make sure both tables exist and have the correct column names

### Data not loading
- Check browser console for errors
- Verify your table has data
- Check network tab to see if API calls are being made

## Features

✅ Real-time data from Supabase
✅ Automatic caching with React Query
✅ Loading states
✅ Error handling
✅ Pagination support
✅ Search functionality
✅ Responsive design
✅ Feedback page with analytics integration
✅ Configurable table names via environment variables

## Next Steps

- Add date range filtering
- Enable real-time subscriptions for live updates
- Add data export functionality
- Implement advanced filtering options

