// File: src/pages/Camera.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraInterface } from '../components';

export default function CameraPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    };

    setIsMobile(checkMobile());
    if (!checkMobile()) navigate('/qr');
  }, [navigate]);

  if (!isMobile) return null;

  return (
    <div className="min-h-screen bg-black">
      <CameraInterface initialMode="camera" />
    </div>
  );
}