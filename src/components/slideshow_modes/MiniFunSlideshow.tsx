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
  
  const getRandomPosition = (index: number) => {
    // Define areas for each photo to minimize overlap
    let xPos, yPos;
    
    switch (index % 3) {
      case 0: // Left side
        xPos = -200 + (Math.random() * 100); // -200 to -100
        yPos = Math.random() * 300 - 150; // -150 to 150
        break;
      case 1: // Center
        xPos = -50 + (Math.random() * 100); // -50 to 50
        yPos = Math.random() * 300 - 150; // -150 to 150
        break;
      case 2: // Right side
        xPos = 100 + (Math.random() * 100); // 100 to 200
        yPos = Math.random() * 300 - 150; // -150 to 150
        break;
      default:
        xPos = 0;
        yPos = 0;
    }

    return {
      x: xPos,
      y: yPos,
      rotation: Math.random() * 30 - 15, // -15deg to +15deg
      scale: 0.85 + Math.random() * 0.15, // 0.85 to 1.0
      zIndex: Math.floor(Math.random() * 10)
    };
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center">
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
                  stiffness: 150,
                  damping: 15,
                  duration: 0.5
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: '160px',
                  height: '220px',
                }}
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
    </div>
  );
}