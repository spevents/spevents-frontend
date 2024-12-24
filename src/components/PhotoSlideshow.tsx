// src/components/PhotoSlideshow.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, EyeOff, Layout, LayoutTemplate, Presentation, Hotel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listPhotos, getPhotoUrl } from '../lib/aws';
import FunSlideshow from './slideshow_modes/FunSlideshow';
import PresenterSlideshow from './slideshow_modes/PresenterSlideshow';
import ModelSlideshow from './slideshow_modes/ModelSlideshow';

interface Photo {
  src: string;
  id: string;
  createdAt: string;
}

type ViewMode = 'simple' | 'fun' | 'presenter' | 'model';
const MAX_PHOTOS = 6;
const PHOTO_REFRESH_INTERVAL = 750;

export default function PhotoSlideshow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [hideUI, setHideUI] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = location.pathname.startsWith('/demo');
  const basePrefix = isDemoMode ? '/demo' : '';

  useEffect(() => {
    const updateDimensions = () => {
      setContainerDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setViewMode('simple');
      } else if (hideUI) {
        setHideUI(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hideUI]);

  const loadPhotosFromStorage = async () => {
    try {
      const fileNames = await listPhotos();
      const photoUrls = fileNames.map(fileName => ({
        src: getPhotoUrl(fileName),
        id: fileName,
        createdAt: new Date().toISOString()
      }));

      const sortedPhotos = photoUrls.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPhotos(sortedPhotos);
      
      if (displayedPhotos.length === 0) {
        setDisplayedPhotos(sortedPhotos.slice(0, MAX_PHOTOS));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading photos:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotosFromStorage();
    const pollInterval = setInterval(loadPhotosFromStorage, PHOTO_REFRESH_INTERVAL);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      if (viewMode === 'simple') {
        setDisplayedPhotos(current => {
          const availablePhotos = photos.filter(
            photo => !current.find(p => p.id === photo.id)
          );

          if (availablePhotos.length === 0) return current;

          const newPhotos = [...current];
          const replaceIndex = Math.floor(Math.random() * Math.min(MAX_PHOTOS, current.length));
          const randomNewPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
          
          newPhotos[replaceIndex] = randomNewPhoto;
          return newPhotos;
        });
      }
    }, PHOTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [photos, viewMode]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Render the appropriate slideshow mode
  const renderSlideshow = () => {
    switch (viewMode) {
      case 'fun':
        return <FunSlideshow photos={photos} containerDimensions={containerDimensions} />;
      case 'presenter':
        return <PresenterSlideshow photos={photos} hideUI={hideUI} />;
      case 'model':
        return <ModelSlideshow photos={photos} hideUI={hideUI} />;

      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-7xl px-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
                <AnimatePresence mode="popLayout">
                  {displayedPhotos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.5
                      }}
                      className="relative aspect-[4/3]"
                    >
                      <div className="absolute inset-0 p-1">
                        <div className="w-full h-full bg-white/90 rounded-lg overflow-hidden">
                          <img
                            src={photo.src}
                            alt="Event photo"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {!hideUI && (
        <div className="absolute top-4 left-4 z-50 flex items-center space-x-4">
          <button
            onClick={() => navigate(`${basePrefix}/gallery`)}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Gallery</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('simple')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm transition-colors ${
                viewMode === 'simple' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Layout className="w-5 h-5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setViewMode('fun')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm transition-colors ${
                viewMode === 'fun' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <LayoutTemplate className="w-5 h-5" />
              <span>Fun</span>
            </button>

            <button
              onClick={() => setViewMode('presenter')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm transition-colors ${
                viewMode === 'presenter' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Presentation className="w-5 h-5" />
              <span>Present</span>
            </button>

            <button
              onClick={() => setViewMode('model')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm transition-colors ${
                viewMode === 'model' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Hotel className="w-5 h-5" />
              <span>Model</span>
            </button>

            <button
              onClick={() => setHideUI(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              <EyeOff className="w-5 h-5" />
              <span>Hide UI</span>
            </button>
          </div>
        </div>
      )}

      {renderSlideshow()}
    </div>
  );
}