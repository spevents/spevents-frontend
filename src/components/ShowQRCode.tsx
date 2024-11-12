import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft } from 'lucide-react';

export default function ShowQRCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = window.location.origin;
  const cameraUrl = `${origin}/camera`;

  const handleBack = () => {
    // Check the source of navigation
    const source = location.state?.from;
    switch (source) {
      case 'venue':
        navigate('/');
        break;
      case 'gallery':
        navigate('/');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-black/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* QR Code Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6">
            Scan to Access Camera
          </h2>
          
          <div className="bg-gray-100 p-4 rounded-xl mb-6">
            <QRCodeSVG
              value={cameraUrl}
              size={256}
              level="H"
              className="w-full h-auto"
              includeMargin
            />
          </div>
          
          <p className="text-gray-600 text-center text-sm">
            Scan this QR code with your mobile device to access the camera interface
          </p>
        </div>
      </div>
    </div>
  );
}