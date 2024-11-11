import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CameraInterfaceProps {
  initialMode: 'qr' | 'camera';
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);
  const [photos, setPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const constraints = {
    video: { 
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  };

  useEffect(() => {
    if (initialMode === 'camera') {
      startCamera();
    }
    return () => cleanup();
  }, [initialMode]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || photos.length >= 5) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    const newPhoto = { id: Date.now(), url: photoUrl };
    setPhotos(prev => [...prev, newPhoto]);
    
    // Save to session storage for PhotoReview
    const sessionPhotos = JSON.parse(sessionStorage.getItem('temp-photos') || '[]');
    sessionPhotos.push(newPhoto);
    sessionStorage.setItem('temp-photos', JSON.stringify(sessionPhotos));
  };

  return (
    <div className="relative h-screen bg-black">
      {/* X Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/gallery')}
          className="bg-black/20 backdrop-blur-lg p-3 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Photo Counter */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full">
        <span className="text-white text-sm font-medium">
          {photos.length}/5
        </span>
      </div>

      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Controls */}
      <div className="absolute bottom-24 inset-x-0 p-8">
        <div className="flex justify-between items-center max-w-lg mx-auto px-6">
          {photos.length > 0 ? (
            <button
              onClick={() => navigate('/review')}
              className="relative bg-white/20 backdrop-blur-lg p-4 rounded-full text-white"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {photos.length}
              </span>
            </button>
          ) : (
            <div className="w-14" />
          )}

          <button
            onClick={capturePhoto}
            className="bg-white w-20 h-20 rounded-full transform transition hover:scale-105 relative"
            disabled={photos.length >= 5}
          >
            <span className="absolute inset-2 rounded-full border-2 border-gray-200" />
          </button>

          <div className="w-14" />
        </div>
      </div>
    </div>
  );
};

export default CameraInterface;