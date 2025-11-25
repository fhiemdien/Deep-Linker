import React, { useState, useEffect } from 'react';
import { HistoryItem } from './types';
import { convertToDeepLink } from './services/linkUtils';
import { analyzeLinkContent } from './services/geminiService';
import HistoryCard from './components/HistoryCard';
import RedirectLanding from './components/RedirectLanding';
import { Link2, Trash2, Zap, Eye } from 'lucide-react';

const App: React.FC = () => {
  // --- LOGIC KHỞI TẠO (Chạy ngay lập tức để chống nháy) ---
  // Kiểm tra URL ngay khi component vừa được gọi, không đợi useEffect
  const searchParams = new URLSearchParams(window.location.search);
  const linkParam = searchParams.get('link');

  // Routing State: Nếu có link -> Set luôn là 'landing' ngay từ đầu
  const [viewMode, setViewMode] = useState<'creator' | 'landing'>(
    linkParam ? 'landing' : 'creator'
  );
  const [sharedLinkData, setSharedLinkData] = useState<string>(
    linkParam ? decodeURIComponent(linkParam) : ''
  );

  // App State
  const [urlInput, setUrlInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Chỉ load lịch sử nếu đang ở chế độ Admin (Creator)
    if (viewMode === 'creator') {
      const saved = localStorage.getItem('deepLinkHistory');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) { console.error(e); }
      }
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'creator') {
      localStorage.setItem('deepLinkHistory', JSON.stringify(history));
    }
  }, [history, viewMode]);

  // --- CREATOR MODE HANDLERS ---

  const handleCreateDeepLink = async () => {
    if (!urlInput.trim()) return;

    setLoading(true);
    const { deepLink, platform, webUrl, androidPackage, appStoreId } = convertToDeepLink(urlInput);

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      originalUrl: urlInput,
      deepLinkUrl: deepLink,
      webUrl: webUrl,
      name: "Đang phân tích...", 
      timestamp: Date.now(),
      platform: platform,
      androidPackage,
      appStoreId
    };

    setHistory(prev => [newItem, ...prev]);
    setUrlInput('');

    try {
      const analysis = await analyzeLinkContent(urlInput);
      setHistory(prev => prev.map(item => 
        item.id === newItem.id ? { ...item, name: analysis.title } : item
      ));
    } catch (error) {
      setHistory(prev => prev.map(item => 
        item.id === newItem.id ? { ...item, name: "Link mới" } : item
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = (item: HistoryItem) => {
    // INTERNAL PREVIEW: Switch state directly instead of opening new window
    setSharedLinkData(item.deepLinkUrl);
    setViewMode('landing');
  };

  const clearHistory = () => {
    if (confirm('Xóa toàn bộ lịch sử?')) setHistory([]);
  };

  const handleBackToAdmin = () => {
    setViewMode('creator');
    setSharedLinkData('');
    // Xóa query param trên URL để tránh F5 lại bị nhảy vào landing
    window.history.replaceState({}, '', window.location.pathname);
  };

  // --- RENDER ---

  if (viewMode === 'landing') {
    return (
      <>
        {/* Nút quay lại chỉ hiện nếu người dùng chuyển từ Admin sang test, 
            hoặc bạn muốn để backdoor cho chính mình. 
            Nếu là user thật vào từ link chia sẻ, họ thường không để ý nút này. */}
        <button 
          onClick={handleBackToAdmin}
          className="fixed top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-xs hover:bg-black/80 backdrop-blur-md border border-white/20 opacity-30 hover:opacity-100 transition-opacity"
        >
          Admin
        </button>
        <RedirectLanding linkData={sharedLinkData} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center p-4 sm:p-6 max-w-md mx-auto font-sans">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-8 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#1DB954] to-blue-500 p-2 rounded-xl shadow-lg shadow-green-900/20">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Deep Linker Pro v3.0</h1>
        </div>
        <div className="text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded-full">
          Admin
        </div>
      </header>

      {/* Input Section */}
      <div className="w-full bg-[#1e1e1e] p-5 rounded-2xl shadow-xl border border-gray-800 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954] opacity-5 blur-[60px] rounded-full pointer-events-none group-hover:opacity-10 transition-opacity"></div>

        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          Nhập link Spotify/YouTube gốc
        </label>
        
        <div className="relative mb-4">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Ví dụ: https://open.spotify.com/track/..."
            className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-xl py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:border-transparent transition-all placeholder-gray-500"
          />
          <Link2 className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
        </div>

        <button
          onClick={handleCreateDeepLink}
          disabled={!urlInput.trim() || loading}
          className={`w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
            !urlInput.trim() || loading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg shadow-green-900/20'
          }`}
        >
          {loading ? (
            <span className="animate-pulse">Đang xử lý...</span>
          ) : (
            <>
              <Zap size={20} fill="currentColor" />
              Tạo Deep Link
            </>
          )}
        </button>
        
        {window.location.href.startsWith('blob:') && (
           <div className="mt-3 bg-blue-900/30 border border-blue-700/50 p-2 rounded text-[11px] text-blue-400 flex items-start gap-2">
             <Eye size={14} className="mt-0.5 shrink-0" />
             <p>Mẹo: Vì đang ở môi trường Preview, hãy bấm nút "Xem thử" (icon con mắt) ở dưới để test trực tiếp luồng nhảy App.</p>
           </div>
        )}
      </div>

      {/* History Section */}
      <div className="w-full flex-1">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-semibold text-gray-200">Lịch sử Link</h2>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              Xóa
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Chưa có link nào.</p>
          </div>
        ) : (
          <div className="space-y-3 pb-10">
            {history.map((item) => (
              <HistoryCard 
                key={item.id} 
                item={item} 
                onOpen={handleOpenPreview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;