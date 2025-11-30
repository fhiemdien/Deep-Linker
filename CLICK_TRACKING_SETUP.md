# Click Tracking Setup Guide

Tao đã implement click tracking system cho mày để measure quốc gia nào, bao nhiêu người click vào deep link.

## Overview

Hệ thống này track mỗi lần user click vào button redirect (Spotify, Apple Music, YouTube, v.v.) và lưu:
- Country code (từ IP address)
- Browser/Device info
- Platform (spotify, apple_music, youtube)
- Timestamp
- Deep link URL

## Components Tạo

### 1. **API Route** (`/api/track-click.ts`)
- Receive POST request khi user click button
- Extract country từ Cloudflare header (`cf-ipcountry`)
- Save data vào Supabase
- Don't block redirect (async call)

### 2. **Utility Function** (`/api/utils/useClickTracking.ts`)
- `trackClick()` function để call API
- Silently fail nếu API error (không block user)

### 3. **Environment Config** (`.env.example`)
- Template cho Supabase credentials
- Instructions để setup

## Setup Steps

### Step 1: Setup Supabase

1. Go to https://supabase.com
2. Sign up or login
3. Create new project
4. Go to Project Settings > API
5. Copy `Project URL` và `anon public key`
6. Create table `click_tracking` với columns:

```sql
CREATE TABLE click_tracking (
  id BIGSERIAL PRIMARY KEY,
  link_type TEXT NOT NULL,
  country TEXT,
  user_agent TEXT,
  platform TEXT,
  timestamp TIMESTAMPTZ,
  deep_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for queries
CREATE INDEX idx_country ON click_tracking(country);
CREATE INDEX idx_link_type ON click_tracking(link_type);
CREATE INDEX idx_timestamp ON click_tracking(timestamp);
```

### Step 2: Setup Environment Variables

1. Rename `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

### Step 3: Update RedirectLanding.tsx

Import `trackClick` vào button onClick handler:

```tsx
import { trackClick } from '@/api/utils/useClickTracking';

// Inside component, before redirect:
const handleRedirect = async () => {
  // Track click (fire & forget)
  trackClick('spotify', 'web', deepLinkUrl);
  
  // Redirect user
  window.location.href = deepLinkUrl;
};
```

### Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 5: Deploy to Vercel

1. Push code to GitHub
2. Vercel auto-deploys
3. Add environment variables in Vercel Dashboard:
   - Project Settings > Environment Variables
   - Add NEXT_PUBLIC_SUPABASE_URL
   - Add NEXT_PUBLIC_SUPABASE_ANON_KEY

## View Analytics

### Option 1: Supabase Dashboard
- Go to https://app.supabase.com
- Click on `click_tracking` table
- View all clicks with country, platform, timestamp

### Option 2: Create Queries

Get clicks by country:
```sql
SELECT country, COUNT(*) as click_count
FROM click_tracking
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY country
ORDER BY click_count DESC;
```

Get clicks by platform:
```sql
SELECT platform, COUNT(*) as click_count
FROM click_tracking
GROUP BY platform;
```

Get clicks per day:
```sql
SELECT DATE(timestamp) as day, COUNT(*) as clicks
FROM click_tracking
GROUP BY DATE(timestamp)
ORDER BY day DESC;
```

### Option 3: Build Custom Dashboard
Create `/components/ClickTrackingDashboard.tsx` để visualize stats.

## Testing

1. Go to https://music-link-share.vercel.app
2. Create deep link
3. Click button
4. Check Supabase table - should see new row

## Troubleshooting

**Clicks not appearing?**
- Check Supabase credentials in .env.local
- Check browser console for errors
- Check Supabase table permissions

**Country showing as "Unknown"?**
- Cloudflare header `cf-ipcountry` only works on Vercel with Cloudflare
- For local testing, set fake country in code

**API errors?**
- Check Supabase project status
- Verify table name is exactly `click_tracking`
- Check column names match API code

## Next Steps

1. ✅ Implement analytics dashboard component
2. ✅ Add real-time stats updates (optional: use Supabase realtime)
3. ✅ Export data to CSV for reporting
4. ✅ Setup alerts for anomalies
