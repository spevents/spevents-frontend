import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
}

interface MiniPresenterSlideshowProps {
  photos: Photo[];
  deletingPhotoId: number | null;
  onDeletePhoto?: (photo: Photo) => void;
}

const DISPLAY_DURATION = 5000; // 5 seconds per set
const PHOTOS_PER_SET = 3;
const TRANSITION_DURATION = 500;

export default function MiniPresenterSlideshow({ 
  photos, 
  deletingPhotoId, 
  onDeletePhoto 
}: MiniPresenterSlideshowProps) {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Create sets of 3 photos
  const photoSets = useMemo(() => {
    const sets = [];
    for (let i = 0; i < photos.length; i += PHOTOS_PER_SET) {
      sets.push(photos.slice(i, Math.min(i + PHOTOS_PER_SET, photos.length)));
    }
    return sets;
  }, [photos]);

  // Auto-advance slides
  useEffect(() => {
    if (photoSets.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSetIndex(prev => (prev + 1) % photoSets.length);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }, DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, [photoSets.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioning || photoSets.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        setIsTransitioning(true);
        setCurrentSetIndex(prev => prev === 0 ? photoSets.length - 1 : prev - 1);
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
      } else if (event.key === 'ArrowRight') {
        setIsTransitioning(true);
        setCurrentSetIndex(prev => (prev + 1) % photoSets.length);
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoSets.length, isTransitioning]);

  if (photos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-brunswick-green/50">
        No photos available
      </div>
    );
  }

  const currentSet = photoSets[currentSetIndex];

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSetIndex}
          className="grid grid-cols-3 gap-4 h-full p-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {currentSet.map((photo, index) => (
            <motion.div
              key={`${photo.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: deletingPhotoId === photo.id ? 0 : 1, 
                y: 0 
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="relative aspect-[3/4] group"
            >
              <div className="w-full h-full bg-white/90 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={photo.url}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {onDeletePhoto && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: deletingPhotoId === photo.id ? 0 : 1 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onDeletePhoto(photo)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white 
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      {photoSets.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {photoSets.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentSetIndex(index);
                  setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSetIndex ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Set counter */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white/70 rounded-full text-sm">
        Set {currentSetIndex + 1} of {photoSets.length}
      </div>
    </div>
  );
}