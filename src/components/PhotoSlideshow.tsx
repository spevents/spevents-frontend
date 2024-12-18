// src/components/PhotoSlideshow.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Photo {
  src: string;
  id: string;
  createdAt: string;
}

const MAX_PHOTOS = 6;
const PHOTO_REFRESH_INTERVAL = 750;
const RECENT_THRESHOLD =   60 * 1000; // 5 minutes in milliseconds

export default function PhotoSlideshow() {
  const navigate = useNavigate();
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPhotosFromStorage = async () => {
    try {
      const { data: files, error } = await supabase
        .storage
        .from('gallery-photos')
        .list();

      if (error) throw error;

      if (files) {
        const photoUrls = await Promise.all(
          files.map(async (file) => {
            const { data: { publicUrl } } = supabase
              .storage
              .from('gallery-photos')
              .getPublicUrl(file.name);

            return {
              src: publicUrl,
              id: file.name,
              createdAt: file.created_at,
            };
          })
        );

        const sortedPhotos = photoUrls.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAllPhotos(sortedPhotos);
        
        // Initialize displayed photos if empty
        if (displayedPhotos.length === 0) {
          setDisplayedPhotos(sortedPhotos.slice(0, MAX_PHOTOS));
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setIsLoading(false);
    }
  };

  // Regular polling for new photos
  useEffect(() => {
    loadPhotosFromStorage();
    const pollInterval = setInterval(loadPhotosFromStorage, PHOTO_REFRESH_INTERVAL);
    return () => clearInterval(pollInterval);
  }, []);

  // Photo rotation logic
  useEffect(() => {
    if (allPhotos.length === 0) return;

    const rotateInterval = setInterval(() => {
      setDisplayedPhotos(current => {
        const now = new Date().getTime();
        
        // Filter recent photos
        const recentPhotos = allPhotos.filter(photo => 
          now - new Date(photo.createdAt).getTime() < RECENT_THRESHOLD
        );

        // Decide which photos to use as source
        const sourcePhotos = recentPhotos.length > 0 ? recentPhotos : allPhotos;
        
        // Get photos that aren't currently displayed
        const availablePhotos = sourcePhotos.filter(
          photo => !current.find(p => p.id === photo.id)
        );

        if (availablePhotos.length === 0) return current;

        // Create new array with one random photo replaced
        const newPhotos = [...current];
        const replaceIndex = Math.floor(Math.random() * Math.min(MAX_PHOTOS, current.length));
        const randomNewPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
        
        newPhotos[replaceIndex] = randomNewPhoto;
        return newPhotos;
      });
    }, PHOTO_REFRESH_INTERVAL);

    return () => clearInterval(rotateInterval);
  }, [allPhotos]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/gallery')}
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Gallery</span>
        </button>
      </div>

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
    </div>
  );
}