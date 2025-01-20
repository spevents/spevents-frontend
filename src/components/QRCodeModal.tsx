// src/components/QRCodeModal.tsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, RefreshCw, Download, Edit2 } from 'lucide-react';
import { useNgrok } from '../contexts/NgrokContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../contexts/SessionContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const { baseUrl, setBaseUrl } = useNgrok();
  const { sessionCode, setCustomSessionCode } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateNgrokUrl = () => {
    const newUrl = prompt('Enter your ngrok URL (e.g., https://xxxx-xxx-xx-xxx-xx.ngrok.io)');
    if (newUrl) {
      setIsUpdating(true);
      setBaseUrl(newUrl);
      setTimeout(() => setIsUpdating(false), 1000);
    }
  };

  const handleUpdateSessionCode = () => {
    const newCode = prompt('Enter your custom session code (e.g., mshaadi-2025)');
    if (newCode) {
      setCustomSessionCode(newCode);
    }
  };

  const getNgrokUrl = () => {
    return baseUrl ? `${baseUrl}/guest/camera` : '';
  };

  const getLiveUrl = () => {
    return sessionCode ? `https://join.spevents.live/${sessionCode}/guest/camera` : '';
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('event-qr-code');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = (new XMLSerializer()).serializeToString(svg);
      const DOMURL = window.URL || window.webkitURL || window;
      const img = new Image();
      const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
      const url = DOMURL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        DOMURL.revokeObjectURL(url);
        
        const imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `spevents-qr-${sessionCode}.png`;
        downloadLink.href = imgURI;
        downloadLink.click();
      };

      img.src = url;
    }
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
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Access QR Codes</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Testing QR Code */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Testing QR Code</h3>
                {baseUrl ? (
                  <>
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG
                        value={getNgrokUrl()}
                        size={256}
                        level="H"
                        className="w-full h-auto"
                        includeMargin
                      />
                    </div>
                    <div className="text-xs text-center px-4 py-2 bg-white/10 rounded-lg break-all text-white/60">
                      {getNgrokUrl()}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white/60 py-4">
                    Set your ngrok URL to generate testing QR code
                  </div>
                )}
                <button
                  onClick={handleUpdateNgrokUrl}
                  className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span>{baseUrl ? 'Update' : 'Set'} ngrok URL</span>
                </button>
              </div>

              {/* Live Event QR Code */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Live Event QR Code</h3>
                  <button
                    onClick={handleUpdateSessionCode}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                    title="Set custom session code"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                {sessionCode ? (
                  <>
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG
                        id="event-qr-code"
                        value={getLiveUrl()}
                        size={256}
                        level="H"
                        className="w-full h-auto"
                        includeMargin
                      />
                    </div>
                    <div className="text-xs text-center px-4 py-2 bg-white/10 rounded-lg break-all text-white/60">
                      {getLiveUrl()}
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download QR Code</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center text-white/60 py-4">
                    Click the edit icon to set your custom session code
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Current session code: <span className="font-medium text-white">{sessionCode || 'Not set'}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}