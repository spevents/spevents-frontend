// src/components/PhotoSlideshowMini.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, LayoutTemplate, Presentation, X } from 'lucide-react';
import MiniFunSlideshow from '../../../components/slideshow_modes/MiniFunSlideshow';
import MiniPresenterSlideshow from '../../../components/slideshow_modes/MiniPresenterSlideshow';

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
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);

  useEffect(() => {
    // Filter out duplicate photos based on photo ID
    const uniquePhotos = photos.reduce((acc: Photo[], current) => {
      const exists = acc.find(photo => photo.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    setDisplayedPhotos(uniquePhotos);
  }, [photos]);

  const handleDeletePhoto = (photo: Photo) => {
    setDeletingPhotoId(photo.id);
    setTimeout(() => {
      if (onPhotoDelete) {
        onPhotoDelete(photo);
        setDisplayedPhotos(prev => prev.filter(p => p.id !== photo.id));
      }
      setDeletingPhotoId(null);
    }, 300);
  };

  const renderPhotoCard = (photo: Photo) => (
    <motion.div
      key={photo.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative aspect-[3/4] group"
    >
      <div className="w-full h-full bg-white/90 rounded-lg overflow-hidden shadow-md">
        <img
          src={photo.url}
          alt="Gallery"
          className="w-full h-full object-cover"
        />
      </div>
      
      {onPhotoDelete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: deletingPhotoId === photo.id ? 0 : 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => handleDeletePhoto(photo)}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white 
            opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );

  const renderSimpleMode = () => (
    <div className="grid grid-cols-3 gap-2 p-2 h-full">
      <AnimatePresence mode="popLayout">
        {displayedPhotos.map(photo => renderPhotoCard(photo))}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div 
      className={`w-full relative rounded-2xl overflow-hidden bg-black/5 ${
        expanded ? 'h-[42rem]' : 'h-96'
      }`}
      animate={{ height: expanded ? 672 : 384 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {displayedPhotos.length === 0 ? (
        <div className="h-full flex items-center justify-center text-brunswick-green/50">
          Swipe up on photos below to add them to the gallery
        </div>
      ) : (
        <>
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
          
          {viewMode === 'fun' && (
            <MiniFunSlideshow 
              photos={displayedPhotos}
              deletingPhotoId={deletingPhotoId}
              onDeletePhoto={onPhotoDelete}
            />
          )}
          {viewMode === 'presenter' && (
            <MiniPresenterSlideshow 
              photos={displayedPhotos}
              deletingPhotoId={deletingPhotoId}
              onDeletePhoto={onPhotoDelete}
            />
          )}
          {viewMode === 'simple' && renderSimpleMode()}
        </>
      )}
    </motion.div>
  );
}