// File: src/pages/Camera.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraInterface } from '../components';
import { X } from 'lucide-react';

export default function CameraPage(): JSX.Element {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    };

    setIsMobile(checkMobile());

    if (!checkMobile()) navigate('/camera');
  }, [navigate]);

  // Early return with JSX instead of navigation
  if (!isMobile) {
    navigate('/');
    return <></>;  // Return empty fragment instead of navigation result
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Back Button */}
      <button
        onClick={() => navigate('/guest')}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/20 backdrop-blur-sm 
          text-white hover:bg-black/30 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <CameraInterface initialMode="camera" />
    </div>
  );
}