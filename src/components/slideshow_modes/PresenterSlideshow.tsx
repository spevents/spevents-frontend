// src/components/slideshow_modes/PresenterSlideshow.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  hideUI?: boolean;
}

const DISPLAY_DURATION = 5000; // 5 seconds per set
const PHOTOS_PER_SET = 3;

export default function PresenterSlideshow({ photos, hideUI = false }: Props) {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Create sets of 3 photos, wrapping around if needed
  const photoSets = useMemo(() => {
    const sets = [];
    let currentSet = [];
    
    // Helper function to get wrapped index
    const getWrappedPhoto = (index: number) => photos[index % photos.length];
    
    for (let i = 0; i < Math.ceil(photos.length / PHOTOS_PER_SET) * PHOTOS_PER_SET; i++) {
      currentSet.push(getWrappedPhoto(i));
      
      if (currentSet.length === PHOTOS_PER_SET) {
        sets.push(currentSet);
        currentSet = [];
      }
    }
    
    return sets;
  }, [photos]);

  const totalSets = photoSets.length;

  useEffect(() => {
    if (totalSets <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSetIndex(prev => (prev + 1) % totalSets);
      
      // Reset transitioning state after animation completes
      setTimeout(() => setIsTransitioning(false), 1000);
    }, DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, [totalSets]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isTransitioning || totalSets <= 1) return;

    if (event.key === 'ArrowLeft') {
      setCurrentSetIndex(prev => 
        prev === 0 ? totalSets - 1 : prev - 1
      );
    } else if (event.key === 'ArrowRight') {
      setCurrentSetIndex(prev => 
        (prev + 1) % totalSets
      );
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSets, isTransitioning]);

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">No photos available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSetIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="absolute inset-0 flex items-center justify-center p-8"
        >
          <div className="w-full max-w-8xl grid grid-cols-3 gap-8">
            {photoSets[currentSetIndex].map((photo, index) => (
              <motion.div
                key={`${photo.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0">
                  {!hideUI && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <img
                    src={photo.src}
                    alt="Event photo"
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: !hideUI ? 'drop-shadow(0 0 20px rgba(0,0,0,0.3))' : 'none'
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {!hideUI && totalSets > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            {Array.from({ length: totalSets }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setCurrentSetIndex(index);
                  }
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSetIndex 
                    ? 'w-8 h-2 bg-white' 
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {!hideUI && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm">
          Set {currentSetIndex + 1} of {totalSets}
        </div>
      )}
    </div>
  );
}