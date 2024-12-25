// src/components/slideshow_modes/MiniPresenterSlideshow.tsx
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

export default function MiniPresenterSlideshow({ 
  photos,
  deletingPhotoId,
  onDeletePhoto 
}: MiniPresenterSlideshowProps) {
  return (
    <div className="relative h-full p-4">
      <AnimatePresence mode="wait">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: deletingPhotoId === photo.id ? 0 : 1,
              scale: 1,
              zIndex: photos.length - index
            }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-2/3 h-full group">
              <div className="w-full h-full bg-white shadow-2xl rounded-lg overflow-hidden">
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
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white 
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}