import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNgrok } from '../contexts/NgrokContext';

export default function ShowQRCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl, setBaseUrl } = useNgrok();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const isDemoMode = location.pathname.startsWith('/demo');
  const basePrefix = isDemoMode ? '/demo' : '';
  
  const handleUpdateNgrokUrl = () => {
    const newUrl = prompt('Enter your ngrok URL (e.g., https://xxxx-xxx-xx-xxx-xx.ngrok.io)');
    if (newUrl) {
      setIsUpdating(true);
      setBaseUrl(newUrl);
      setTimeout(() => setIsUpdating(false), 1000);
    }
  };

  const handleBack = () => {
    const source = location.state?.from;
    if (isDemoMode) {
      switch (source) {
        case 'venue':
          navigate('/demo');
          break;
        case 'gallery':
          navigate('/demo/gallery');
          break;
        default:
          navigate('/demo');
      }
    } else {
      switch (source) {
        case 'venue':
          navigate('/');
          break;
        case 'gallery':
          navigate('/gallery');
          break;
        default:
          navigate('/');
      }
    }
  };

  const getCameraUrl = () => {
    if (baseUrl) {
      return isDemoMode ? `${baseUrl}/demo/camera` : `${baseUrl}/camera`;
    }
    return '';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-black/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleUpdateNgrokUrl}
          className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-black/30 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>Update URL</span>
        </button>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6">
            Scan to Access Camera
          </h2>
          
          {baseUrl ? (
            <>
              <div className="bg-gray-100 p-4 rounded-xl mb-6">
                <QRCodeSVG
                  value={getCameraUrl()}
                  size={256}
                  level="H"
                  className="w-full h-auto"
                  includeMargin
                />
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 text-center text-sm">
                  Scan this QR code with your mobile device to access the camera interface
                </p>

                <div className="text-xs text-center px-4 py-2 bg-gray-100 rounded-lg break-all">
                  {getCameraUrl()}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Click "Update URL" to set the ngrok URL
            </div>
          )}
        </div>
      </div>
    </div>
  );
}