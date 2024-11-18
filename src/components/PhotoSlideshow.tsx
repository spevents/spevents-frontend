import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Photo {
  url: string;
  id: string;
  size: 'small' | 'medium' | 'large' | 'vertical' | 'horizontal';
  position: {
    top: string;
    left: string;
  };
}

const DISPLAY_COUNT = 5;
const TRANSITION_INTERVAL = 1200;
const INITIAL_LOAD_DELAY = 800;

// Responsive size classes
const sizeClasses = {
  small: 'w-48 h-48 md:w-56 md:h-56',
  medium: 'w-64 h-56 md:w-72 md:h-64',
  large: 'w-80 h-64 md:w-96 md:h-80',
  vertical: 'w-48 h-80 md:w-56 md:h-96',
  horizontal: 'w-80 h-48 md:w-96 md:h-56',
};

// Centered position zones
const desktopPositionZones = [
  { top: '35%', left: '35%' }, // Top left
  { top: '35%', left: '65%' }, // Top right
  { top: '65%', left: '35%' }, // Bottom left
  { top: '65%', left: '65%' }, // Bottom right
  { top: '50%', left: '50%' }, // Center
];

const mobilePositionZones = [
  { top: '20%', left: '50%' },
  { top: '40%', left: '50%' },
  { top: '60%', left: '50%' },
  { top: '80%', left: '50%' },
  { top: '100%', left: '50%' },
];

export default function PhotoSlideshow() {
  const navigate = useNavigate();
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRandomPosition = (index: number) => {
    const zones = isMobile ? mobilePositionZones : desktopPositionZones;
    return zones[index % zones.length];
  };

  const getRandomSize = () => {
    const sizes: Array<'small' | 'medium' | 'large' | 'vertical' | 'horizontal'> =
      isMobile ? ['medium', 'vertical'] : ['small', 'medium', 'large', 'vertical', 'horizontal'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  useEffect(() => {
    async function loadPhotos() {
      try {
        const { data: files, error } = await supabase.storage.from('gallery-photos').list();
        if (error) throw error;

        if (files) {
          const urls = await Promise.all(
            files.map(async (file) => {
              const { data } = supabase.storage.from('gallery-photos').getPublicUrl(file.name);
              return {
                url: data.publicUrl,
                id: file.name,
                size: getRandomSize(),
                position: getRandomPosition(0),
              };
            })
          );

          setAllPhotos(urls);
          setDisplayedPhotos(
            urls.slice(0, DISPLAY_COUNT).map((photo, i) => ({
              ...photo,
              position: getRandomPosition(i),
            }))
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load photos:', error);
        setIsLoading(false);
      }
    }

    loadPhotos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (allPhotos.length === 0 || displayedPhotos.length < DISPLAY_COUNT) return;
      const index = Math.floor(Math.random() * DISPLAY_COUNT);
      const nextPhoto = allPhotos[Math.floor(Math.random() * allPhotos.length)];
      setDisplayedPhotos((current) => {
        const updated = [...current];
        updated[index] = {
          ...nextPhoto,
          position: getRandomPosition(index),
          size: getRandomSize(),
        };
        return updated;
      });
    }, TRANSITION_INTERVAL);

    return () => clearInterval(interval);
  }, [allPhotos, displayedPhotos]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <button
        onClick={() => navigate('/gallery')}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Gallery</span>
      </button>

      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="sync">
          {displayedPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: photo.position.top,
                left: photo.position.left,
                transform: 'translate(-50%, -50%)',
                zIndex: index,
              }}
              className={`${sizeClasses[photo.size]} shadow-2xl`}
            >
              <div className="w-full h-full rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt="Photo"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
