# Troubleshooting Guide

## "Error loading data" - Common Issues & Solutions

### 1. Check Browser Console (F12)
Open your browser's Developer Tools (F12) and check:
- **Console tab** - Look for error messages
- **Network tab** - Check if API calls are failing

### 2. Verify Environment Variables

**Check if .env.local exists and has correct values:**

1. Open `.env.local` in the project root
2. It should look like this:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Important:** 
   - Values should NOT have quotes around them
   - Values should NOT have spaces
   - Make sure there are no typos

4. **Restart the dev server** after changing .env.local:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### 3. Verify Supabase Table

1. Go to Supabase Dashboard → **Table Editor**
2. Check if table exists: `chat_analytics_yash_test`
3. **Table name must match exactly** (case-sensitive)
4. Make sure the table has at least some data

### 4. Check Row Level Security (RLS)

If RLS is enabled, you need to create a policy:

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Select table: `chat_analytics_yash_test`
3. Click **"New Policy"**
4. Choose **"For full customization"**
5. Use this SQL:
   ```sql
   CREATE POLICY "Allow public read access" 
   ON chat_analytics_yash_test 
   FOR SELECT 
   USING (true);
   ```

**OR** temporarily disable RLS for testing:
1. Go to **Table Editor** → Select your table
2. Click **"..."** menu → **"Disable RLS"**

### 5. Test Supabase Connection

Open browser console (F12) and you should see:
```
🔍 Supabase Connection Debug
  URL: https://xxxxx...
  Key: eyJhbGciOiJIUzI1...
  Table: chat_analytics_yash_test
  ✅ Environment variables found
```

If you see ❌, your .env.local is not set up correctly.

### 6. Common Error Messages

#### "Missing Supabase environment variables"
- **Solution:** Check .env.local file exists and has correct variable names
- Variable names must start with `VITE_`
- Restart dev server after changes

#### "Failed to fetch conversations: new row violates row-level security policy"
- **Solution:** Disable RLS or create a SELECT policy (see #4 above)

#### "relation 'chat_analytics_yash_test' does not exist"
- **Solution:** Check table name is exactly `chat_analytics_yash_test`
- Check you're connected to the correct Supabase project

#### "Invalid API key"
- **Solution:** Verify your anon key is correct
- Make sure you're using the "anon public" key, not the "service_role" key

### 7. Quick Test

Test your Supabase connection directly:

1. Open browser console (F12)
2. Run this in the console:
   ```javascript
   // Check if env vars are loaded
   console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

If both show `undefined`, your .env.local is not being loaded.

### 8. Still Not Working?

1. **Double-check credentials:**
   - Go to Supabase Dashboard → Settings → API
   - Copy URL and key again
   - Make sure no extra spaces or characters

2. **Check network:**
   - Open Network tab in DevTools
   - Look for failed requests to `*.supabase.co`
   - Check error status codes

3. **Verify table structure:**
   - Make sure all required columns exist
   - Check data types match expected format

4. **Try a simple test query:**
   - In Supabase Dashboard → SQL Editor
   - Run: `SELECT COUNT(*) FROM chat_analytics_yash_test;`
   - Should return a number

### Need More Help?

Check the browser console for specific error messages and share them for more targeted help.

