// src/components/slideshow_modes/ModelSlideshow.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scene from '../../components/Scene';

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  hideUI?: boolean;
}

export default function ModelSlideshow({ photos, hideUI = false }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">No photos available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0">
        <Scene />
      </div>

      <AnimatePresence mode="wait">
        {!hideUI && (
          <motion.div
            key={currentPhotoIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96"
          >
            <div className="w-full h-full p-4">
              <img
                src={photos[currentPhotoIndex].src}
                alt="Event photo"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}