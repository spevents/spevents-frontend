// src/components/QRCodeModal.tsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, RefreshCw } from 'lucide-react';
import { useNgrok } from '../contexts/NgrokContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../contexts/SessionContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const { baseUrl, setBaseUrl } = useNgrok();
  const { sessionCode } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleUpdateNgrokUrl = () => {
    const newUrl = prompt('Enter your ngrok URL (e.g., https://xxxx-xxx-xx-xxx-xx.ngrok.io)');
    if (newUrl) {
      setIsUpdating(true);
      setBaseUrl(newUrl);
      setTimeout(() => setIsUpdating(false), 1000);
    }
  };

  const getCameraUrl = () => {
    if (isDevelopment) {
      return baseUrl ? `${baseUrl}/camera` : '';
    }
    return `https://join.spevents.live/${sessionCode}/guest/camera`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Scan to Access Camera</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              {(!isDevelopment || baseUrl) && (
                <>
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={getCameraUrl()}
                      size={256}
                      level="H"
                      className="w-full h-auto"
                      includeMargin
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-white/60 text-center text-sm">
                      Scan this QR code with your mobile device to access the camera interface
                    </p>

                    <div className="text-xs text-center px-4 py-2 bg-white/10 rounded-lg break-all text-white/60">
                      {getCameraUrl()}
                    </div>
                  </div>
                </>
              )}

              {isDevelopment && (
                <>
                  {!baseUrl && (
                    <div className="text-center text-white/60">
                      Click "Update URL" to set the ngrok URL
                    </div>
                  )}

                  <button
                    onClick={handleUpdateNgrokUrl}
                    className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
                    <span>Update URL</span>
                  </button>

                  <div className="text-xs text-center text-white/40">
                    Development Mode - Using ngrok URL
                  </div>
                </>
              )}

              {!isDevelopment && (
                <div className="text-xs text-center text-white/40">
                  Production Mode - Using spevents.live
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}