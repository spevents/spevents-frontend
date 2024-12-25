// src/components/guest/GuestDashboard.tsx (updated)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {  getPhotoUrl } from '../../lib/aws';
import { CollageCreator } from './CollageCreator';

interface Photo {
  url: string;
  name: string;
  created_at: string;
}

export function GuestDashboard() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCollageCreator, setShowCollageCreator] = useState(false);

  useEffect(() => {
    loadGuestPhotos();
  }, []);

  const loadGuestPhotos = async () => {
    try {
      const sessionPhotos = JSON.parse(localStorage.getItem('uploaded-photos') || '[]');
      
      if (sessionPhotos.length > 0) {
        const photoUrls = sessionPhotos.map((fileName: string) => ({
          url: getPhotoUrl(fileName),
          name: fileName,
          created_at: new Date().toISOString()
        }));

        setPhotos(photoUrls);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10 px-4 py-4">
          <h1 className="text-white text-xl font-semibold">Your Gallery</h1>
        </div>

        {/* Photo Grid */}
        <div className="px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No photos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <motion.div
                  key={photo.name}
                  className="relative aspect-square"
                >
                  <img
                    src={photo.url}
                    alt="Your photo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 inset-x-0 bg-gray-900/80 backdrop-blur-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/camera')}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                text-white rounded-full py-3 px-6 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Take More</span>
            </button>
            
            <button
              onClick={() => setShowCollageCreator(true)}
              disabled={photos.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-6 
                transition-colors ${
                  photos.length > 0
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'bg-white/10 text-white/50'
                }`}
            >
              <Palette className="w-5 h-5" />
              <span>Creator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collage Creator Modal */}
      <AnimatePresence>
        {showCollageCreator && (
          <CollageCreator
            photos={photos}
            onClose={() => setShowCollageCreator(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}