import React from 'react';
import { HistoryItem } from '../types';
import { Music, Facebook, Youtube, Globe, Share2, Eye, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { copyToClipboard } from '../services/linkUtils';

interface Props {
  item: HistoryItem;
  onOpen: (item: HistoryItem) => void;
}

const HistoryCard: React.FC<Props> = ({ item, onOpen }) => {
  const [copied, setCopied] = React.useState<'link' | null>(null);

  const handleCopyShareLink = async () => {
    // FIX: Thay vì lấy window.location.origin (có thể là link dài loằng ngoằng của Vercel deploy),
    // ta ép cứng dùng domain chính thức (ngắn đẹp) để link chia sẻ luôn chuyên nghiệp.
    const domain = 'https://deep-linker-nine.vercel.app';
    
    // Tạo link đầy đủ
    const shareUrl = `${domain}/?link=${encodeURIComponent(item.deepLinkUrl)}`;
    
    await copyToClipboard(shareUrl);
    setCopied('link');
    
    // Hiện thông báo để người dùng biết chắc chắn đã copy link chuẩn
    alert(`Đã copy link chuẩn:\n\n${shareUrl}`);

    setTimeout(() => setCopied(null), 3000);
  };

  const getIcon = () => {
    switch (item.platform) {
      case 'spotify': return <Music className="w-5 h-5 text-green-400" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      default: return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const timeString = new Date(item.timestamp).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });

  return (
    <div className="bg-[#1e1e1e] p-4 rounded-xl mb-3 border border-gray-800 hover:border-gray-600 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
            {item.name}
          </h3>
        </div>
        <span className="text-xs text-gray-500">{timeString}</span>
      </div>

      <div 
        className="block bg-black/30 p-2 rounded text-xs text-gray-400 font-mono mb-3 w-full overflow-hidden select-all"
      >
        <p className="truncate">
          {item.deepLinkUrl}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onOpen(item)}
          className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-full flex items-center justify-center gap-2 text-sm transition-colors"
          title="Xem thử giao diện người dùng (Test nội bộ)"
        >
          <Eye size={16} />
          Test
        </button>
        
        <button
          onClick={handleCopyShareLink}
          className={`flex-1 rounded-full flex items-center justify-center gap-2 text-sm transition-all font-bold shadow-lg ${
            copied === 'link' 
              ? 'bg-green-600 text-white shadow-green-900/20' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/30'
          } py-2`}
          title="Bấm để lấy link gửi cho người khác"
        >
          {copied === 'link' ? (
            <>
              <CheckCircle2 size={16} />
              Đã chép!
            </>
          ) : (
            <>
              <LinkIcon size={16} />
              COPY LINK ĐỂ SHARE
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;