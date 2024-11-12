import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraInterfaceProps {
  initialMode: 'qr' | 'camera';
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);
  const [photos, setPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getConstraints = (facing: 'environment' | 'user') => ({
    video: { 
      facingMode: facing,
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  });

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

  const startCamera = async (facing?: 'environment' | 'user') => {
    cleanup();
    const currentFacing = facing || facingMode;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getConstraints(currentFacing));
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setFacingMode(currentFacing);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
    }
  };

  const flipCamera = () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(newFacingMode);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || photos.length >= 5) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Flip the image horizontally if using front camera
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
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

      {/* Flip Camera Button */}
      <div className="absolute top-4 right-16 z-10">
        <button
          onClick={flipCamera}
          className="bg-black/20 backdrop-blur-lg p-3 rounded-full text-white"
        >
          <Repeat className="w-6 h-6" />
        </button>
      </div>

      {/* Photo Counter */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full">
        <span className={`text-sm font-medium ${photos.length >= 5 ? 'text-red-500' : 'text-white'}`}>
          {photos.length}/5
        </span>
      </div>

      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />

      {/* Max Photos Warning */}
      <AnimatePresence>
        {photos.length >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm"
          >
            Maximum photos reached
          </motion.div>
        )}
      </AnimatePresence>

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
            disabled={photos.length >= 5}
            className={`bg-white w-20 h-20 rounded-full transform transition hover:scale-105 relative 
              ${photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
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