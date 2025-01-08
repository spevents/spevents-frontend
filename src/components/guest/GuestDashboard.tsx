// src/components/guest/GuestDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Palette, Download, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPhotoUrl } from '../../lib/aws';
import { CollageCreator } from './CollageCreator';

interface Photo {
  url: string;
  name: string;
  created_at: string;
}

export function GuestDashboard() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCollageCreator, setShowCollageCreator] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGuestPhotos();
  }, [eventId]);

  const loadGuestPhotos = async () => {
    try {
      const sessionKey = `uploaded-photos-${eventId}`;
      const sessionPhotos = JSON.parse(localStorage.getItem(sessionKey) || '[]');
      
      if (sessionPhotos.length > 0) {
        const photoUrls = sessionPhotos.map((fileName: string) => ({
          url: getPhotoUrl(fileName, eventId!),
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

  const togglePhotoSelection = (photoName: string) => {
    setSelectedPhotos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(photoName)) {
        newSelection.delete(photoName);
      } else {
        newSelection.add(photoName);
      }
      return newSelection;
    });
  };

  const downloadSelectedPhotos = async () => {
    const selectedPhotosList = photos.filter(photo => selectedPhotos.has(photo.name));
    
    for (const photo of selectedPhotosList) {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const navigateToFeedback = () => {
    navigate(`/${eventId}/feedback`);
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
                  onClick={() => togglePhotoSelection(photo.name)}
                >
                  <img
                    src={photo.url}
                    alt="Your photo"
                    className={`w-full h-full object-cover rounded-lg transition-transform 
                      ${selectedPhotos.has(photo.name) ? 'ring-2 ring-white scale-95' : ''}`}
                  />
                  {selectedPhotos.has(photo.name) && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 inset-x-0 bg-gray-900/80 backdrop-blur-lg p-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate(`/${eventId}/camera`)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                text-white rounded-full py-3 px-4 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Take More</span>
            </button>
            
            <button
              onClick={() => setShowCollageCreator(true)}
              disabled={photos.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-4 
                transition-colors ${
                  photos.length > 0
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'bg-white/10 text-white/50'
                }`}
            >
              <Palette className="w-5 h-5" />
              <span>Create</span>
            </button>

            <button
              onClick={downloadSelectedPhotos}
              disabled={selectedPhotos.size === 0}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-4 
                transition-colors ${
                  selectedPhotos.size > 0
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/5 text-white/50'
                }`}
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button
              onClick={navigateToFeedback}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                text-white rounded-full py-3 px-4 transition-colors"
            >
              <Award className="w-5 h-5" />
              <span>Win Prize</span>
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