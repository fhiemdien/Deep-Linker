import { HistoryItem } from '../types';

interface DeepLinkResult {
  deepLink: string;
  platform: HistoryItem['platform'];
  webUrl: string;
  androidPackage?: string;
  appStoreId?: string;
}

export const convertToDeepLink = (url: string): DeepLinkResult => {
  const trimmed = url.trim();
  let webUrl = trimmed;

  // --- SPOTIFY ---
  // Handle raw Spotify URI (spotify:track:123)
  if (trimmed.startsWith('spotify:')) {
    const parts = trimmed.split(':');
    if (parts.length === 3) {
      // Convert to web url for fallback: https://open.spotify.com/track/123
      webUrl = `https://open.spotify.com/${parts[1]}/${parts[2]}`;
      return {
        deepLink: trimmed, // e.g. spotify:track:123
        platform: 'spotify',
        webUrl: webUrl,
        androidPackage: 'com.spotify.music',
        appStoreId: '324684580'
      };
    }
  }

  // Handle Spotify Web URL
  if (trimmed.includes('spotify.com')) {
    try {
      const urlObj = new URL(trimmed);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        const type = pathParts[0]; // track, album, playlist
        const id = pathParts[1];
        return { 
          deepLink: `spotify:${type}:${id}`, 
          platform: 'spotify',
          webUrl: trimmed,
          androidPackage: 'com.spotify.music',
          appStoreId: '324684580'
        };
      }
    } catch (e) { console.error(e); }
  }

  // --- YOUTUBE ---
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return { 
      deepLink: `vnd.youtube://${trimmed}`, 
      platform: 'youtube',
      webUrl: trimmed,
      androidPackage: 'com.google.android.youtube',
      appStoreId: '544007664'
    };
  }

  // --- FACEBOOK ---
  if (trimmed.includes('facebook.com')) {
    return { 
      deepLink: `fb://facewebmodal/f?href=${encodeURIComponent(trimmed)}`, 
      platform: 'facebook',
      webUrl: trimmed,
      androidPackage: 'com.facebook.katana',
      appStoreId: '284882215'
    };
  }

  // Default
  return { 
    deepLink: trimmed, 
    platform: 'web', 
    webUrl: trimmed 
  };
};

export const getAndroidIntent = (rawScheme: string, packageId: string, fallbackUrl: string) => {
  // rawScheme is like: spotify:track:123
  // Android Intent Format:
  // intent://<host>/<path>#Intent;scheme=<scheme>;package=<package_name>;S.browser_fallback_url=<encoded_url>;end

  let scheme = 'https'; // default
  let path = '';
  
  if (rawScheme.includes(':')) {
    const parts = rawScheme.split(':');
    scheme = parts[0]; // spotify
    
    // For Spotify: spotify:track:123 -> host=track, path=123 implies intent://track/123...
    // But safely we can just pass the whole thing in some intent formats, but standard chrome intent is specific.
    // Let's use the standard "scheme" based intent which is safest.
    
    // If input is spotify:track:123
    // We want: intent://track/123#Intent;scheme=spotify;...
    
    if (parts.length >= 3) {
        // parts[1] is track, parts[2] is id
        path = `//${parts[1]}/${parts[2]}`;
    }
  }

  // Construct the intent string
  // Note: encoded fallback url is crucial for the "Stay in browser" flow if app isn't installed.
  return `intent:${path}#Intent;scheme=${scheme};package=${packageId};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};
