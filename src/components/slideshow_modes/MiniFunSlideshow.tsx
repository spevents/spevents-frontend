// src/components/slideshow_modes/MiniFunSlideshow.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
}

interface MiniFunSlideshowProps {
  photos: Photo[];
  deletingPhotoId: number | null;
  onDeletePhoto?: (photo: Photo) => void;
}
export default function MiniFunSlideshow({ 
  photos, 
  deletingPhotoId,
  onDeletePhoto 
}: MiniFunSlideshowProps) {
  const getRandomPosition = (index: number) => ({
    // Much larger range for x and y positions, based on container size
    x: (Math.random() * 300) - 150,  // -150px to +150px
    y: (Math.random() * 200) - 100,  // -100px to +100px
    // More extreme rotation
    rotation: Math.random() * 30 - 15, // -15deg to +15deg
    // Slightly larger scale variation
    scale: 0.9 + Math.random() * 0.2,
    // Randomize z-index for more natural overlapping
    zIndex: Math.floor(Math.random() * 10)
  });

  return (
    <div className="relative w-full h-full p-8">
      <AnimatePresence mode="popLayout">
        {photos.map((photo, index) => {
          const position = getRandomPosition(index);
          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: deletingPhotoId === photo.id ? 0 : 1,
                scale: position.scale,
                x: position.x,
                y: position.y,
                rotate: position.rotation,
                zIndex: position.zIndex
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 150, // Reduced stiffness for more bouncy movement
                damping: 15,    // Reduced damping for more playful animation
                duration: 0.5
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(33%-0.5rem)]"
            >
              <div className="relative group">
                <div 
                  className="w-full h-full p-2 bg-white shadow-xl rounded-lg overflow-hidden 
                    transition-transform duration-300 hover:scale-105 hover:z-50 
                    hover:shadow-2xl"
                >
                  <img
                    src={photo.url}
                    alt="Gallery"
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                </div>
                
                {onDeletePhoto && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: deletingPhotoId === photo.id ? 0 : 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => onDeletePhoto(photo)}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white 
                      opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}