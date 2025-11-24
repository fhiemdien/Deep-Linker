import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeepLinkModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm">
      <style>
        {`
          @keyframes modalPop {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-modal-pop {
            animation: modalPop 0.2s ease-out forwards;
          }
        `}
      </style>
      <div className="bg-white rounded-lg p-6 w-full max-w-[340px] shadow-2xl animate-modal-pop">
        <h3 className="text-[17px] font-bold text-gray-900 mb-3 leading-snug">
          Bạn đang rời khỏi ứng dụng của chúng tôi
        </h3>
        <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
          Trang web mà bạn xem đang cố gắng mở một ứng dụng bên ngoài. Bạn có muốn tiếp tục không?
        </p>
        <div className="flex justify-end gap-6 font-semibold text-[14px]">
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-black hover:bg-gray-100 px-3 py-2 rounded transition-colors uppercase tracking-wide"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="text-gray-900 hover:text-black hover:bg-gray-100 px-3 py-2 rounded transition-colors uppercase tracking-wide"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeepLinkModal;