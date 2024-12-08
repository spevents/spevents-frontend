// src/components/PhotoGallery.tsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, RefreshCw, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { deleteFile, getPhotoUrl } from '../lib/aws';

interface StoragePhoto {
  url: string;
  name: string;
  created_at: string;
}

const PhotoGallery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState<StoragePhoto[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<StoragePhoto | null>(null);

  const isDemoMode = location.pathname.startsWith('/demo');
  const basePrefix = isDemoMode ? '/demo' : '';

  const loadPhotosFromStorage = async () => {
    try {
      // For demo purposes, we'll use localStorage to track uploaded files
      const storedPhotos = JSON.parse(localStorage.getItem('uploaded-photos') || '[]') as string[];
      
      const photoUrls: StoragePhoto[] = storedPhotos.map((fileName: string) => ({
        url: getPhotoUrl(fileName),
        name: fileName,
        created_at: new Date().toISOString() // In production, store this with the file metadata
      }));

      const sortedPhotos = photoUrls.sort((a: StoragePhoto, b: StoragePhoto) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPhotos(sortedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      const storedPhotos = JSON.parse(localStorage.getItem('uploaded-photos') || '[]') as string[];
      
      // Delete each photo from S3
      await Promise.all(storedPhotos.map(async (fileName: string) => {
        try {
          await deleteFile(fileName);
        } catch (error) {
          console.error(`Failed to delete ${fileName}:`, error);
        }
      }));

      // Clear local storage
      localStorage.removeItem('uploaded-photos');
      setPhotos([]);
    } catch (error) {
      console.error('Error clearing gallery:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleStartCapturing = () => {
    navigate(`${basePrefix}/qr`, { state: { from: 'gallery' } });
  };

  useEffect(() => {
    sessionStorage.removeItem("temp-photos");
    loadPhotosFromStorage();
    const pollInterval = setInterval(loadPhotosFromStorage, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 inset-x-0 bg-gray-900/80 backdrop-blur-md z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate(`${basePrefix}`)}
              className="text-white flex items-center space-x-2"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back</span>
            </button>
            <h1 className="text-white text-lg font-semibold">Gallery</h1>
            <div className="flex items-center space-x-3">
              {photos.length > 0 && (
                <>
                  <button
                    onClick={() => navigate(`${basePrefix}/slideshow`)}
                    className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    View Slideshow
                  </button>
                  <button
                    onClick={clearAllData}
                    disabled={isClearing}
                    className={`p-2 rounded-full transition-all duration-300 
                      ${isClearing ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {isClearing ? (
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="px-4 pb-20 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {photos.map((photo) => (
                <button
                  key={photo.name}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square group focus:outline-none"
                >
                  <img
                    src={photo.url}
                    alt="Event photo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {!isLoading && photos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <p className="text-center mb-4">No photos yet</p>
              <button
                onClick={handleStartCapturing}
                className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                Start capturing moments
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt="Selected photo"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhotoGallery;