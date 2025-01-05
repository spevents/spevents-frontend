// src/components/PhotoSlideshowMini.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, LayoutTemplate, Presentation, X } from 'lucide-react';
import MiniFunSlideshow from '../../../../components/slideshow_modes/MiniFunSlideshow';
import MiniPresenterSlideshow from '../../../../components/slideshow_modes/MiniPresenterSlideshow';

interface Photo {
  id: number;
  url: string;
}

interface PhotoSlideshowMiniProps {
  photos: Photo[];
  expanded?: boolean;
  onPhotoDelete?: (photo: Photo) => void;
}

type ViewMode = 'simple' | 'fun' | 'presenter';

export default function PhotoSlideshowMini({ 
  photos, 
  expanded = false, 
  onPhotoDelete 
}: PhotoSlideshowMiniProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);

  useEffect(() => {
    if (photos.length <= 1 || viewMode !== 'simple') return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev => (prev + 1) % photos.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length, viewMode]);

  const handleDelete = (photo: Photo) => {
    setDeletingPhotoId(photo.id);
    setTimeout(() => {
      if (onPhotoDelete) {
        onPhotoDelete(photo);
      }
      setDeletingPhotoId(null);
    }, 300);
  };

  if (photos.length === 0) {
    return (
      <motion.div 
        className={`w-full relative rounded-2xl overflow-hidden bg-black/5 ${
          expanded ? 'h-[42rem]' : 'h-96'
        }`}
        animate={{ height: expanded ? 672 : 384 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex items-center justify-center text-brunswick-green/50">
          Swipe up on photos below to add them to the gallery
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full relative rounded-2xl overflow-auto bg-black/5"
      animate={{ height: expanded ? 672 : 384 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* View Mode Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full p-1">
        <button
          onClick={() => setViewMode('simple')}
          className={`p-2 rounded-full transition-colors ${
            viewMode === 'simple' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('fun')}
          className={`p-2 rounded-full transition-colors ${
            viewMode === 'fun' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('presenter')}
          className={`p-2 rounded-full transition-colors ${
            viewMode === 'presenter' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <Presentation className="w-4 h-4" />
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'fun' && (
        <div className="absolute inset-0 scale-150">
        <MiniFunSlideshow 
          photos={photos}
          deletingPhotoId={deletingPhotoId}
          onDeletePhoto={handleDelete}
        />
        </div>
      )}
      {viewMode === 'presenter' && (
      <div className="absolute inset-0">
        <MiniPresenterSlideshow 
          photos={photos}
          deletingPhotoId={deletingPhotoId}
          onDeletePhoto={handleDelete}
        />
        </div>
      )}
      {viewMode === 'simple' && (
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex items-center justify-center p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
            <div className="relative w-3/4 h-3/4 rounded-xl overflow-hidden">
              <img
                src={photos[currentIndex].url}
                alt="Gallery"
                className="w-full h-full object-cover"
              />

              
              {onPhotoDelete && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: deletingPhotoId === photos[currentIndex].id ? 0 : 1 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleDelete(photos[currentIndex])}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white 
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}