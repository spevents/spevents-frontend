// src/components/slideshow_modes/FunSlideshow.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FunPhoto {
  src: string;
  id: string;
  createdAt: string;
  size: {
    width: number;
    height: number;
    aspect: 'square' | 'portrait' | 'landscape';
  };
  position: {
    x: number;
    y: number;
    rotation: number;
  };
  displayStartTime: number;
  displayDuration: number;
  transitionId: string;
}

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  containerDimensions: { width: number; height: number };
}

const MIN_DISPLAY_TIME = 15000; // 15 seconds
const MAX_DISPLAY_TIME = 30000; // 30 seconds
const MAX_PHOTOS = 12;

// Rest of the helper functions remain the same...
function getRandomAspectRatio(): 'square' | 'portrait' | 'landscape' {
  const ratios = ['square', 'portrait', 'landscape'];
  return ratios[Math.floor(Math.random() * ratios.length)] as 'square' | 'portrait' | 'landscape';
}

function getPhotoSize(
  windowWidth: number, 
  windowHeight: number, 
  aspect: 'square' | 'portrait' | 'landscape'
): { width: number; height: number; aspect: 'square' | 'portrait' | 'landscape' } {
  const baseSize = Math.min(windowWidth, windowHeight) * 0.25;
  const sizeVariation = baseSize * 0.2;
  const baseWidth = baseSize + (Math.random() * sizeVariation - sizeVariation / 2);
  
  switch (aspect) {
    case 'portrait':
      return {
        width: baseWidth,
        height: baseWidth * 1.5,
        aspect: 'portrait' as const
      };
    case 'landscape':
      return {
        width: baseWidth * 1.5,
        height: baseWidth,
        aspect: 'landscape' as const
      };
    case 'square':
    default:
      return {
        width: baseWidth,
        height: baseWidth,
        aspect: 'square' as const
      };
  }
}

function getRandomPosition(
  containerWidth: number,
  containerHeight: number,
  photoSize: { width: number; height: number },
  existingPhotos: FunPhoto[]
) {
  const margin = 20;
  const maxAttempts = 50;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const x = margin + Math.random() * (containerWidth - photoSize.width - margin * 2);
    const y = margin + Math.random() * (containerHeight - photoSize.height - margin * 2);
    const rotation = Math.random() * 10 - 5;
    
    const hasOverlap = existingPhotos.some(existing => {
      const xOverlap = Math.abs(existing.position.x - x) < (photoSize.width + existing.size.width) / 2;
      const yOverlap = Math.abs(existing.position.y - y) < (photoSize.height + existing.size.height) / 2;
      return xOverlap && yOverlap;
    });
    
    if (!hasOverlap || attempts === maxAttempts - 1) {
      return { x, y, rotation };
    }
    
    attempts++;
  }
  
  return {
    x: margin + Math.random() * (containerWidth - photoSize.width - margin * 2),
    y: margin + Math.random() * (containerHeight - photoSize.height - margin * 2),
    rotation: Math.random() * 10 - 5
  };
}

function processFunPhoto(
  photo: { src: string; id: string; createdAt: string },
  containerDimensions: { width: number; height: number },
  existingPhotos: FunPhoto[]
): FunPhoto {
  const aspect = getRandomAspectRatio();
  const size = getPhotoSize(containerDimensions.width, containerDimensions.height, aspect);
  const position = getRandomPosition(containerDimensions.width, containerDimensions.height, size, existingPhotos);
  const displayDuration = MIN_DISPLAY_TIME + Math.random() * (MAX_DISPLAY_TIME - MIN_DISPLAY_TIME);
  
  return {
    ...photo,
    size,
    position,
    displayStartTime: Date.now(),
    displayDuration,
    transitionId: `${photo.id}-${Date.now()}`
  };
}

export default function FunSlideshow({ photos, containerDimensions }: Props) {
  const [displayedPhotos, setDisplayedPhotos] = useState<FunPhoto[]>([]);
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const addNewPhoto = useCallback(() => {
    setDisplayedPhotos(current => {
      if (current.length >= MAX_PHOTOS) return current;
      
      const availablePhotos = photos.filter(
        photo => !current.find(p => p.id === photo.id)
      );
      
      if (availablePhotos.length === 0) return current;
      
      const newPhotoBase = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
      const newPhoto = processFunPhoto(newPhotoBase, containerDimensions, current);
      
      return [...current, newPhoto];
    });
  }, [photos, containerDimensions]);

  const removePhoto = useCallback((transitionId: string) => {
    setDisplayedPhotos(current => current.filter(p => p.transitionId !== transitionId));
    // Schedule a new photo to be added
    setTimeout(addNewPhoto, 1500); // Wait for fade out before adding new photo
  }, [addNewPhoto]);

  // Clean up function for timeouts
  const cleanupTimeouts = useCallback(() => {
    Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = {};
  }, []);

  // Initialize display
  useEffect(() => {
    if (photos.length === 0) return;
    cleanupTimeouts();

    const initialCount = Math.min(MAX_PHOTOS, photos.length);
    const initialPhotos = photos
      .slice(0, initialCount)
      .reduce<FunPhoto[]>((acc, photo) => {
        const processedPhoto = processFunPhoto(photo, containerDimensions, acc);
        return [...acc, processedPhoto];
      }, []);

    setDisplayedPhotos(initialPhotos);

    return cleanupTimeouts;
  }, [photos, containerDimensions, cleanupTimeouts]);

  // Manage individual photo timeouts
  useEffect(() => {
    cleanupTimeouts();

    displayedPhotos.forEach(photo => {
      const elapsedTime = Date.now() - photo.displayStartTime;
      const remainingTime = Math.max(0, photo.displayDuration - elapsedTime);
      
      if (remainingTime > 0) {
        timeoutsRef.current[photo.transitionId] = setTimeout(() => {
          removePhoto(photo.transitionId);
        }, remainingTime);
      } else {
        removePhoto(photo.transitionId);
      }
    });

    return cleanupTimeouts;
  }, [displayedPhotos, removePhoto, cleanupTimeouts]);

  return (
    <div className="relative w-full h-screen">
      <AnimatePresence mode="popLayout">
        {displayedPhotos.map((photo) => (
          <motion.div
            key={photo.transitionId}
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.5, ease: "easeInOut" }

            }}
            style={{
              width: photo.size.width,
              height: photo.size.height,
              transform: `translate(${photo.position.x}px, ${photo.position.y}px) rotate(${photo.position.rotation}deg)`
            }}
          >
            <div className="w-full h-full p-2 bg-white/90 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden">
              <img
                src={photo.src}
                alt="Event photo"
                className="w-full h-full object-cover rounded"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}