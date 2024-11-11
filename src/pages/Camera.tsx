import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import CameraInterface from '../components/CameraInterface';

interface Photo {
  id: number;
  url: string;
}

const MAX_PHOTOS = 5;

export default function CameraPage() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    };

    setIsMobile(checkMobile());

    // If not mobile, redirect to QR code page
    if (!checkMobile()) {
      navigate('/qr');
    }
  }, [navigate]);

  const handlePhotoCapture = (photoUrl: string) => {
    if (photos.length < MAX_PHOTOS) {
      setPhotos(prev => [...prev, { id: Date.now(), url: photoUrl }]);
      setShowPreview(true);
    }
  };

  const handleSwipeUp = (photoId: number) => {
    // Get the photo that was swiped
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    // Remove it from the local array
    setPhotos(prev => prev.filter(p => p.id !== photoId));

    // Add to gallery storage
    const galleryPhotos = JSON.parse(localStorage.getItem('REMOVED') || '[]') as Photo[];
    galleryPhotos.push(photo);
    localStorage.setItem('REMOVED', JSON.stringify(galleryPhotos));
  };

  if (!isMobile) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-black">
      <CameraInterface 
        initialMode="camera"
        onPhotoCapture={handlePhotoCapture}
      />
      
      {/* Photo Preview Stack */}
      <AnimatePresence>
        {showPreview && photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info: PanInfo) => {
              if (info.offset.y < -50) {
                handleSwipeUp(photo.id);
              }
            }}
          >
            <div className="relative">
              <img 
                src={photo.url} 
                alt="Captured photo" 
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <ArrowUp className="absolute top-2 left-1/2 -translate-x-1/2 text-white animate-bounce" />
              <p className="text-white text-center mt-2">Swipe up to add to gallery</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Counter */}
      <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white">
        {photos.length}/{MAX_PHOTOS}
      </div>
    </div>
  );
}