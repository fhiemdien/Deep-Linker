import React from 'react';
import { HistoryItem } from '../types';
import { ExternalLink, Copy, Music, Facebook, Youtube, Globe, Smartphone, Share2, Eye } from 'lucide-react';
import { copyToClipboard } from '../services/linkUtils';

interface Props {
  item: HistoryItem;
  onOpen: (item: HistoryItem) => void;
}

const HistoryCard: React.FC<Props> = ({ item, onOpen }) => {
  const [copied, setCopied] = React.useState<'raw' | null>(null);

  const handleCopyRaw = async () => {
    await copyToClipboard(item.deepLinkUrl);
    setCopied('raw');
    setTimeout(() => setCopied(null), 2000);
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
    <div className="bg-[#1e1e1e] p-4 rounded-xl mb-3 border border-gray-800 hover:border-gray-600 transition-colors">
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
        onClick={() => onOpen(item)}
        className="block bg-black/30 p-2 rounded text-xs text-blue-400 hover:text-blue-300 hover:underline font-mono mb-3 cursor-pointer transition-colors w-full overflow-hidden"
      >
        <p className="truncate">
          {item.deepLinkUrl}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onOpen(item)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-3 rounded-full flex items-center justify-center gap-2 text-sm transition-transform active:scale-95 shadow-lg shadow-purple-900/30"
          title="Xem giao diện người dùng sẽ thấy"
        >
          <Eye size={16} />
          Xem thử (Test)
        </button>
        
        <button
          onClick={handleCopyRaw}
          className={`px-4 rounded-full flex items-center justify-center gap-2 text-sm transition-colors font-medium ${
            copied === 'raw' ? 'bg-gray-600 text-white' : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-400 hover:text-white'
          }`}
          title="Sao chép URI"
        >
          <Copy size={16} />
          {copied === 'raw' ? 'Đã chép' : 'Copy URI'}
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;