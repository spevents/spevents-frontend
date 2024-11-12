// File: src/layouts/MainLayout.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, QrCode } from 'lucide-react';
import { Scene } from '../components';

export function MainLayout() {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    // Navigate to QR code page with state indicating we came from venue
    navigate('/qr', { state: { from: 'venue' } });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="absolute top-0 w-full z-10 bg-black/20 backdrop-blur-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">Spevents</span>
            </Link>
            <div className="flex items-center space-x-4">
              {[
                { key: 'qr', Icon: QrCode, action: handleCameraClick },
                { key: 'gallery', to: '/gallery', Icon: ImageIcon }
              ].map(({ key, Icon, to, action }) => (
                action ? (
                  <button
                    key={key}
                    onClick={action}
                    className="text-white hover:text-gray-200"
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                ) : (
                  <Link
                    key={key}
                    to={to!}
                    className="text-white hover:text-gray-200"
                  >
                    <Icon className="w-6 h-6" />
                  </Link>
                )
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="h-screen">
        <Scene />
      </main>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        Hover over photos to see details • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}