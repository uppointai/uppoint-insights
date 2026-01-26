# UpPoint Insights - Chat Analytics Dashboard

A comprehensive analytics dashboard for visualizing chat conversation data, metrics, and user feedback from Supabase.

## Features

- 📊 Real-time analytics dashboard with key metrics
- 💬 Conversation history and session details
- 📈 Interactive charts and visualizations
- 👍 User feedback integration
- 🔍 Advanced filtering and search capabilities
- ⚡ Fast data loading with React Query caching
- 📱 Responsive design

## Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI framework
- **React Router** - Client-side routing
- **Supabase** - Backend database and API
- **TanStack Query** - Data fetching and caching
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

## Quick Start

### Prerequisites

- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase project with the required database tables

### Installation

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd uppoint-insights
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **Optional:** Override default table names:
   ```env
   VITE_ANALYTICS_TABLE_NAME=your_analytics_table_name
   VITE_FEEDBACK_TABLE_NAME=your_feedback_table_name
   ```

4. **Get your Supabase credentials:**
   - Go to your [Supabase project dashboard](https://supabase.com/dashboard)
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** → `VITE_SUPABASE_URL`
   - Copy the **anon public** key → `VITE_SUPABASE_ANON_KEY`

5. **Start the development server:**
   ```sh
   npm run dev
   ```

6. **Open in browser:**
   Navigate to `http://localhost:5173/`

## Database Setup

This application requires two Supabase tables:

### Analytics Table (default: `chat_analytics_yash_test`)

The analytics table should include the following columns:

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
- `response_time` (numeric, nullable) - Response time in milliseconds
- `responsetimestamp` (bigint/numeric, nullable) - Used to join with feedback table

### Feedback Table (default: `chat_feedback`)

The feedback table should include:

- `sessionId` or `session_id` (text) - Session identifier
- `responsetimestamp` (bigint/numeric) - Response timestamp (for joining with analytics)
- `feedback` (text) - Either `thumbs_up` or `thumbs_down`
- `comment` (text, nullable) - Optional user comment
- `created_at` (timestamp) - When the feedback was created

**Note:** The feedback table joins with the analytics table using `session_id` and `responsetimestamp`.

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SUPABASE_URL` | Yes | - | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | - | Your Supabase anon public key |
| `VITE_ANALYTICS_TABLE_NAME` | No | `chat_analytics_yash_test` | Analytics table name |
| `VITE_FEEDBACK_TABLE_NAME` | No | `chat_feedback` | Feedback table name |

### Row Level Security (RLS)

For production, configure Row Level Security policies in Supabase:

1. Go to **Authentication** → **Policies** in Supabase
2. Create a policy for SELECT operations on your analytics table
3. Example policy (for public read access):
   ```sql
   CREATE POLICY "Allow public read access" 
   ON chat_analytics_yash_test 
   FOR SELECT 
   USING (true);
   ```

## Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[QUICK_START.md](./QUICK_START.md)** - Step-by-step quick start guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables" error**
- Ensure `.env.local` exists in the root directory
- Verify variable names start with `VITE_`
- Restart the dev server after changing `.env.local`

**"Failed to fetch conversations" error**
- Verify your Supabase URL and anon key are correct
- Check that table names match your database
- Ensure RLS policies allow read access (or disable RLS for testing)

For more troubleshooting help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Deployment

### Using Lovable

If this project is connected to Lovable:
1. Open your [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)
2. Click **Share** → **Publish**

### Custom Domain

To connect a custom domain:
1. Navigate to **Project** > **Settings** > **Domains**
2. Click **Connect Domain**
3. Follow the setup instructions

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## License

This project is private and proprietary.
