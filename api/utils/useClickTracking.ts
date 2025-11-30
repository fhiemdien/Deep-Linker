// Helper function to track click events
export const trackClick = async (
  linkType: string,
  platform: string,
  deepLink: string
) => {
  try {
    // Call API route to track click
    await fetch('/api/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkType,
        platform,
        deepLink,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silently fail - don't block user redirect
    console.error('Click tracking failed:', error);
  }
};
