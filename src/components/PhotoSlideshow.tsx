import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, EyeOff, Layout, LayoutTemplate, Presentation, Hotel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listPhotos, getPhotoUrl } from '../lib/aws';
import FunSlideshow from './slideshow_modes/FunSlideshow';
import PresenterSlideshow from './slideshow_modes/PresenterSlideshow';
import ModelSlideshow from './slideshow_modes/ModelSlideshow';

interface Photo {
  src: string;
  id: string;
  createdAt: number;
}

interface PhotoWithStringDate {
  src: string;
  id: string;
  createdAt: string;
}

type ViewMode = 'simple' | 'fun' | 'presenter' | 'model';
const MAX_PHOTOS = 12;
const PHOTO_REFRESH_INTERVAL = 1;

export default function PhotoSlideshow() {
  const navigate = useNavigate();
  // const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [hideUI, setHideUI] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // const isDemoMode = location.pathname.startsWith('/demo');

  // Convert photos array to format expected by slideshow components
  const convertPhotosForDisplay = (photos: Photo[]): PhotoWithStringDate[] => {
    return photos.map(photo => ({
      ...photo,
      createdAt: new Date(photo.createdAt).toISOString()
    }));
  };

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

  const getTimestampFromFilename = (fileName: string): number => {
    const match = fileName.match(/photo-(\d+)\.jpg/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  };

  const loadPhotosFromStorage = async () => {
    try {
      const fileNames = await listPhotos();
      const photoUrls = fileNames.map(fileName => ({
        src: getPhotoUrl(fileName),
        id: fileName,
        createdAt: getTimestampFromFilename(fileName)
      }));

      // Sort by timestamp, newest first
      const sortedPhotos = photoUrls.sort((a, b) => b.createdAt - a.createdAt);
      setPhotos(sortedPhotos);

      // Update displayed photos
      const mostRecent = sortedPhotos.slice(0, MAX_PHOTOS);
      
      setDisplayedPhotos(current => {
        if (current.length === 0) {
          return mostRecent;
        }

        // Get the newest timestamp we're currently displaying
        const currentNewestTimestamp = Math.max(...current.map(p => p.createdAt));
        
        // Find any new photos that are newer than our current newest
        const newPhotos = mostRecent.filter(photo => photo.createdAt > currentNewestTimestamp);
        
        if (newPhotos.length > 0) {
          // Replace oldest photos with new ones
          const updatedPhotos = [...current];
          newPhotos.forEach((newPhoto) => {
            // Find the oldest photo's index
            const oldestPhotoIndex = updatedPhotos.findIndex(p => 
              p.createdAt === Math.min(...updatedPhotos.map(up => up.createdAt))
            );
            if (oldestPhotoIndex !== -1) {
              updatedPhotos[oldestPhotoIndex] = newPhoto;
            }
          });
          return updatedPhotos;
        }
        
        return current;
      });

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const renderSlideshow = () => {
    const photosWithStringDates = convertPhotosForDisplay(photos);
    
    switch (viewMode) {
      case 'fun':
        return <FunSlideshow photos={photosWithStringDates} containerDimensions={containerDimensions} />;
      case 'presenter':
        return <PresenterSlideshow photos={photosWithStringDates} hideUI={hideUI} />;
      case 'model':
        return <ModelSlideshow photos={photosWithStringDates} hideUI={hideUI} />;
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-7xl px-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
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
            onClick={() => navigate(`/host/gallery`)}
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