export interface HistoryItem {
  id: string;
  originalUrl: string;
  deepLinkUrl: string; // The scheme (e.g. spotify://)
  webUrl: string;      // The http fallback (e.g. https://open.spotify.com)
  name: string;
  timestamp: number;
  platform: 'spotify' | 'facebook' | 'youtube' | 'web' | 'unknown';
  appStoreId?: string; // iOS App Store ID
  androidPackage?: string; // Android Package Name
}

export interface LinkAnalysisResult {
  title: string;
}