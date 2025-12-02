// Force rebuild with corrected API key
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Add CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await request.body;

    // Get country from Vercel's cf-ipcountry header
    const country = request.headers['cf-ipcountry'] || 'Unknown';
    const userAgent = request.headers['user-agent'] || 'Unknown';

    // Insert into Supabase
    const { error } = await supabase.from('click_tracking').insert([
      {
        link_type: data.linkType,
        country,
        user_agent: userAgent,
        platform: data.platform,
        timestamp: new Date().toISOString(),
        deep_link: data.deepLink,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return response
        .status(500)
        .json({ error: error.message });
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Track click error:', errorMessage);
    return response.status(500).json({ error: errorMessage });
  }
}
