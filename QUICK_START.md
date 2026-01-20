# Quick Start Guide - Step by Step

## Step 1: Add Your Supabase Credentials

1. Open the `.env.local` file in the root directory
2. Go to your Supabase project: https://supabase.com/dashboard
3. Select your project
4. Go to **Settings** → **API**
5. Copy the following:
   - **Project URL** → Paste it as `VITE_SUPABASE_URL`
   - **anon public** key → Paste it as `VITE_SUPABASE_ANON_KEY`

Your `.env.local` should look like this:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_TABLE_NAME=chat_analytics_yash_test
```

**Note:** `VITE_SUPABASE_TABLE_NAME` is optional. If not set, it defaults to `chat_analytics_yash_test`.

## Step 2: Verify Your Table Exists

1. In Supabase dashboard, go to **Table Editor**
2. Make sure you have a table with the name specified in `VITE_SUPABASE_TABLE_NAME` (or `chat_analytics_yash_test` if not set)
3. The table should have data (at least a few rows to test)

## Step 3: Install Dependencies (if not already done)

Open terminal in the project directory and run:
```bash
npm install
```

## Step 4: Start the Development Server

Run this command:
```bash
npm run dev
```

## Step 5: Open in Browser

1. Wait for the server to start (you'll see a message like "Local: http://localhost:5173/")
2. Open your browser
3. Go to: **http://localhost:5173/**

## Step 6: Verify It's Working

You should see:
- ✅ Dashboard loads without errors
- ✅ Metrics cards show numbers (or loading states)
- ✅ Charts display data
- ✅ Conversation table shows your data

## Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution:**
- Check that `.env.local` exists in the root directory
- Verify the variable names start with `VITE_`
- Restart the dev server after changing `.env.local`

### Error: "Failed to fetch conversations"
**Solution:**
- Verify your Supabase URL and key are correct
- Check browser console (F12) for detailed error
- Make sure table name matches `VITE_SUPABASE_TABLE_NAME` in `.env.local` (or `chat_analytics_yash_test` if not set)
- Check if Row Level Security (RLS) is enabled - you may need to disable it or create a policy

### No Data Showing
**Solution:**
- Check if your table has data
- Open browser DevTools (F12) → Network tab → Check API calls
- Look for errors in the Console tab

### Server Won't Start
**Solution:**
- Make sure port 5173 is not in use
- Try: `npm run dev -- --port 3000` to use a different port
- Check if Node.js is installed: `node --version`

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for linting errors
npm run lint
```

## Next Steps After Setup

Once everything is working:
- ✅ Your dashboard is connected to Supabase
- ✅ Data updates automatically
- ✅ All charts show real data
- ✅ You can search and filter conversations

Enjoy your analytics dashboard! 🎉

