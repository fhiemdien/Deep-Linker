import React, { useState, useEffect } from 'react';
import { getAndroidIntent } from '../services/linkUtils';
import { Music, Play, ExternalLink, ShieldAlert, Loader2, Youtube } from 'lucide-react';

interface Props {
  linkData: string; // The raw shared link (e.g., spotify:track:...)
}

const RedirectLanding: React.FC<Props> = ({ linkData }) => {
  const [metadata, setMetadata] = useState<{ title: string; subtitle: string; icon: 'spotify' | 'youtube' }>({
    title: 'Đang mở ứng dụng...',
    subtitle: 'Vui lòng chờ giây lát',
    icon: 'spotify'
  });
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Parse the link data to display metadata
  useEffect(() => {
    let title = "Đang mở ứng dụng...";
    let subtitle = "Đang chuyển hướng...";
    let icon: 'spotify' | 'youtube' = 'spotify';

    if (linkData.includes('spotify')) {
      title = "Spotify Music";
      icon = 'spotify';
      if (linkData.includes('track')) subtitle = "Bài hát";
      if (linkData.includes('playlist')) subtitle = "Playlist";
      if (linkData.includes('album')) subtitle = "Album";
    } else if (linkData.includes('youtube') || linkData.includes('youtu.be')) {
      title = "YouTube";
      subtitle = "Xem video";
      icon = 'youtube';
    }

    setMetadata({ title, subtitle, icon });
  }, [linkData]);

  const handleSmartRedirect = () => {
    setIsRedirecting(true);
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    let targetUrl = linkData;
    let fallbackUrl = 'https://open.spotify.com'; // Default fallback

    // --- Logic xác định Fallback URL (Trang web dự phòng) ---
    if (linkData.startsWith('spotify:')) {
       // spotify:track:123 -> https://open.spotify.com/track/123
       const parts = linkData.split(':');
       if (parts.length === 3) {
         fallbackUrl = `https://open.spotify.com/${parts[1]}/${parts[2]}`;
       }
    } else if (linkData.startsWith('vnd.youtube://')) {
       // vnd.youtube://https://youtube.com... -> https://youtube.com...
       fallbackUrl = linkData.replace('vnd.youtube://', '');
       // Nếu trên Android/iOS thì targetUrl giữ nguyên scheme vnd.youtube
       // Fallback là link http
    }

    if (isAndroid) {
      // Android Intent Logic
      if (linkData.includes('spotify')) {
         targetUrl = getAndroidIntent(linkData, 'com.spotify.music', fallbackUrl);
      } else if (linkData.includes('youtube')) {
         // Với Youtube trên Android, thường chỉ cần link http là nó tự gợi ý mở app, 
         // hoặc dùng intent với package youtube
         targetUrl = `intent://ViewIntent#Intent;scheme=http;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
         // Tuy nhiên đơn giản nhất là dùng lại link web gốc nếu scheme vnd.youtube fail, 
         // nhưng ở đây ta cứ thử redirect thẳng.
         // Fallback an toàn nhất cho youtube android là để trình duyệt tự xử lý link https
         if (linkData.startsWith('vnd.youtube://')) {
             // Remove scheme riêng để trả về link https gốc, Android hiện đại tự bắt link này
             targetUrl = fallbackUrl;
         }
      }
      window.location.href = targetUrl;
    } else if (isIOS) {
      // iOS Logic: Try scheme, fallback to web
      const start = Date.now();
      
      // Use anchor click simulation
      const a = document.createElement('a');
      a.href = linkData; // e.g., spotify:track:123
      a.click();

      // Fallback timeout
      setTimeout(() => {
        if (Date.now() - start < 2500 && !document.hidden) {
          window.location.href = fallbackUrl;
        }
      }, 2000);
    } else {
      // Desktop / Other -> Mở web
      window.location.href = fallbackUrl;
    }
  };

  // Auto-redirect effect
  useEffect(() => {
    // Wait a brief moment to let the UI render and look professional, then trigger
    const timer = setTimeout(() => {
      handleSmartRedirect();
    }, 800);

    return () => clearTimeout(timer);
  }, [linkData]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0"></div>
      
      {metadata.icon === 'spotify' ? (
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1DB954] opacity-10 blur-[100px] rounded-full"></div>
      ) : (
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600 opacity-10 blur-[100px] rounded-full"></div>
      )}

      <div className="z-10 w-full max-w-sm flex flex-col items-center animate-fade-in-up">
        {/* Icon Placeholder */}
        <div className={`w-64 h-64 bg-gray-800 rounded-lg shadow-2xl mb-8 flex items-center justify-center border border-gray-700 relative group overflow-hidden`}>
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
           
           {metadata.icon === 'spotify' ? (
             <Music className="w-24 h-24 text-gray-500 group-hover:text-[#1DB954] transition-colors duration-500" />
           ) : (
             <Youtube className="w-24 h-24 text-gray-500 group-hover:text-red-500 transition-colors duration-500" />
           )}

           <div className="absolute bottom-4 left-4">
             <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider text-black ${metadata.icon === 'spotify' ? 'bg-[#1DB954]' : 'bg-white'}`}>
               App Only
             </span>
           </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-bold text-white mb-2 text-center">{metadata.title}</h1>
        <p className="text-gray-400 mb-8 text-center flex items-center gap-2 justify-center">
           {isRedirecting && <Loader2 className="w-3 h-3 animate-spin" />}
           {metadata.subtitle}
        </p>

        {/* Action Button */}
        <button
          onClick={handleSmartRedirect}
          className={`w-full active:scale-95 transition-all text-black font-bold text-lg py-4 px-8 rounded-full flex items-center justify-between shadow-lg group ${
            metadata.icon === 'spotify' 
              ? 'bg-[#1DB954] hover:bg-[#1ed760] shadow-green-900/30' 
              : 'bg-white hover:bg-gray-200 shadow-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-black/20 p-1.5 rounded-full">
               {metadata.icon === 'spotify' ? (
                 <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" className="w-6 h-6" />
               ) : (
                 <Play className="w-6 h-6 fill-black text-black" />
               )}
            </div>
            <span>{metadata.icon === 'spotify' ? 'Play on Spotify' : 'Watch on YouTube'}</span>
          </div>
          <ExternalLink className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-xs text-gray-600 max-w-[250px] text-center">
          Nếu ứng dụng không tự động mở, vui lòng nhấn nút ở trên.
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RedirectLanding;