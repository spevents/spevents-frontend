import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Photo {
  src: string;
  id: string;
  createdAt: string;
}

interface MarqueeSlideshowProps {
  photos: Photo[];
  hideUI?: boolean;
}

interface PhotoStrip {
  photos: Photo[];
  id: string;
}

const PHOTOS_PER_STRIP = 8;
const STRIP_COUNT = 3;
const ANIMATION_DURATION = 50;
const COLUMN_COUNT = 10;

const MarqueeSlideshow = ({ photos }: MarqueeSlideshowProps) => {
  const [strips, setStrips] = useState<PhotoStrip[][]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const createPhotoStrip = useCallback((isCenter: boolean = false): PhotoStrip => {
    let selectedPhotos: Photo[];
    if (isCenter) {
      selectedPhotos = [...photos]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, PHOTOS_PER_STRIP);
    } else {
      const recentPhotos = new Set(
        [...photos]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, PHOTOS_PER_STRIP)
          .map(p => p.id)
      );

      const availablePhotos = photos.filter(p => !recentPhotos.has(p.id));
      selectedPhotos = [];

      while (selectedPhotos.length < PHOTOS_PER_STRIP && availablePhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePhotos.length);
        selectedPhotos.push(availablePhotos[randomIndex]);
        availablePhotos.splice(randomIndex, 1);
      }

      while (selectedPhotos.length < PHOTOS_PER_STRIP) {
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        selectedPhotos.push(randomPhoto);
      }
    }

    return {
      photos: selectedPhotos,
      id: `strip-${Date.now()}-${Math.random()}`
    };
  }, [photos]);

  const initializeStrips = useCallback(() => {
    const newStrips: PhotoStrip[][] = [];
    for (let i = 0; i < COLUMN_COUNT; i++) {
      const isCenter = i === 1;
      const columnStrips: PhotoStrip[] = [];
      
      // Create double the strips for seamless loop
      for (let j = 0; j < STRIP_COUNT * 2; j++) {
        columnStrips.push(createPhotoStrip(isCenter));
      }
      
      newStrips.push(columnStrips);
    }
    return newStrips;
  }, [createPhotoStrip]);

  useEffect(() => {
    if (photos.length > 0 && !isInitialized) {
      setStrips(initializeStrips());
      setIsInitialized(true);
    }
  }, [photos, isInitialized, initializeStrips]);

  if (!isInitialized || photos.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div className="h-full w-full flex justify-center gap-12 px-8">
        {strips.map((columnStrips, columnIndex) => {
          const direction = columnIndex % 2 === 0 ? 1 : -1;
          
          return (
            <div 
              key={columnIndex} 
              className="w-[300px] relative overflow-hidden"
            >
              <motion.div
                className="flex flex-col absolute inset-0 gap-4"
                animate={{ 
                  y: direction > 0 ? [0, "-50%"] : ["-50%", 0]
                }}
                transition={{
                  y: {
                    duration: ANIMATION_DURATION,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "reverse"
                  }
                }}
              >
                {/* Render each photo in the strips */}
                {[...columnStrips, ...columnStrips].map((strip) => (
                  strip.photos.map((photo, photoIndex) => (
                    <div
                      key={`${strip.id}-${photoIndex}`}
                      className="relative flex-none w-full aspect-[9/16]"
                    >
                      <img
                        src={photo.src}
                        alt="Event photo"
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  ))
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarqueeSlideshow;