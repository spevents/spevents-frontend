// src/components/slideshow_modes/FunSlideshow.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FunPhoto {
  src: string;
  id: string;
  createdAt: string;
  size: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    zIndex: number;
  };
}

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  containerDimensions: { width: number; height: number };
}

const TRANSITION_INTERVAL = 1200;
const MAX_PHOTOS = 20;
const RECENT_THRESHOLD = 30 * 1000; // 5 minutes

function getResponsivePhotoSizes(windowWidth: number, windowHeight: number) {
  const baseSize = Math.min(windowWidth, windowHeight) * 0.2;
  const sizeMultiplier = windowWidth < 768 ? 0.8 : 1;

  return [
    { width: baseSize * 0.8 * sizeMultiplier, height: baseSize * 0.8 * sizeMultiplier },
    { width: baseSize * sizeMultiplier, height: baseSize * sizeMultiplier },
    { width: baseSize * 1.2 * sizeMultiplier, height: baseSize * 1.2 * sizeMultiplier },
    { width: baseSize * 1.2 * sizeMultiplier, height: baseSize * 0.8 * sizeMultiplier },
    { width: baseSize * 1.5 * sizeMultiplier, height: baseSize * sizeMultiplier },
  ];
}

function getRandomPosition(containerWidth: number, containerHeight: number, photoSize: { width: number; height: number }) {
  const marginX = photoSize.width / 2 + 20;
  const marginY = photoSize.height / 2 + 20;
  const availableWidth = containerWidth - (marginX * 2);
  const availableHeight = containerHeight - (marginY * 2);
  
  return {
    x: marginX + (Math.random() * availableWidth),
    y: marginY + (Math.random() * availableHeight),
    rotation: Math.random() * 20 - 10,
    scale: 0.95 + Math.random() * 0.1,
    zIndex: Math.floor(Math.random() * 10),
  };
}

function processFunPhoto(
  photo: { src: string; id: string; createdAt: string },
  containerDimensions: { width: number; height: number }
): FunPhoto {
  const sizes = getResponsivePhotoSizes(containerDimensions.width, containerDimensions.height);
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  
  return {
    ...photo,
    size,
    position: getRandomPosition(containerDimensions.width, containerDimensions.height, size),
  };
}

export default function FunSlideshow({ photos, containerDimensions }: Props) {
  const [displayedPhotos, setDisplayedPhotos] = useState<FunPhoto[]>([]);

  useEffect(() => {
    if (photos.length === 0) return;

    // Initial setup
    const initialPhotos = photos
      .slice(0, MAX_PHOTOS)
      .map(photo => processFunPhoto(photo, containerDimensions));
    setDisplayedPhotos(initialPhotos);

    const interval = setInterval(() => {
      setDisplayedPhotos(current => {
        const now = new Date().getTime();
        const recentPhotos = photos.filter(photo =>
          now - new Date(photo.createdAt).getTime() < RECENT_THRESHOLD
        );

        const sourcePhotos = recentPhotos.length > 0 ? recentPhotos : photos;
        const availablePhotos = sourcePhotos.filter(
          photo => !current.find(p => p.id === photo.id)
        );

        if (availablePhotos.length === 0) return current;

        const newPhotos = [...current];
        const replaceIndex = Math.floor(Math.random() * Math.min(MAX_PHOTOS, current.length));
        const randomNewPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
        
        newPhotos[replaceIndex] = processFunPhoto(randomNewPhoto, containerDimensions);
        return newPhotos;
      });
    }, TRANSITION_INTERVAL);

    return () => clearInterval(interval);
  }, [photos, containerDimensions]);

  return (
    <div className="relative w-full h-screen">
      <AnimatePresence mode="popLayout">
        {displayedPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            className="absolute"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: photo.position.scale,
              x: photo.position.x,
              y: photo.position.y,
              rotate: photo.position.rotation,
              zIndex: photo.position.zIndex,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 1,
            }}
            style={{
              width: photo.size.width,
              height: photo.size.height,
            }}
          >
            <div className="w-full h-full p-2 bg-white shadow-xl rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:z-50">
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