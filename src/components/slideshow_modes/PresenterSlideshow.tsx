// src/components/slideshow_modes/PresenterSlideshow.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  hideUI?: boolean;
}

const DISPLAY_DURATION = 5000; // 5 seconds per photo

export default function PresenterSlideshow({ photos, hideUI = false }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentPhotoIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % photos.length;
        setDirection(1);
        return nextIndex;
      });
      
      // Reset transitioning state after animation completes
      setTimeout(() => setIsTransitioning(false), 1000);
    }, DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, [photos.length]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isTransitioning) return;

    if (event.key === 'ArrowLeft') {
      setDirection(-1);
      setCurrentPhotoIndex(prev => 
        prev === 0 ? photos.length - 1 : prev - 1
      );
    } else if (event.key === 'ArrowRight') {
      setDirection(1);
      setCurrentPhotoIndex(prev => 
        (prev + 1) % photos.length
      );
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length, isTransitioning]);

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">No photos available</p>
      </div>
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {!hideUI && photos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setDirection(index > currentPhotoIndex ? 1 : -1);
                  setCurrentPhotoIndex(index);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentPhotoIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={photos[currentPhotoIndex].id}
          className="absolute inset-0 flex items-center justify-center p-4"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          <img
            src={photos[currentPhotoIndex].src}
            alt="Event photo"
            className="max-w-full max-h-full object-contain"
            style={{ 
              filter: !hideUI ? 'drop-shadow(0 0 20px rgba(0,0,0,0.3))' : 'none'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {!hideUI && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}