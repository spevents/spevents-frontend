// src/components/PhotoGallery.tsx
import React, { useState, useEffect } from "react";
import { QrCode, Trash2, RefreshCw, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPhotoUrl, listPhotos, deleteMultipleFiles } from "../lib/aws";
import { QRCodeModal } from "./QRCodeModal";

interface StoragePhoto {
  url: string;
  name: string;
  created_at: string;
}

const PhotoGallery: React.FC = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<StoragePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_selectedPhoto, setSelectedPhoto] = useState<StoragePhoto | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);



  const loadPhotosFromStorage = async () => {
    try {
      const fileNames = await listPhotos();
      const photoUrls: StoragePhoto[] = fileNames.map((fileName) => ({
        url: getPhotoUrl(fileName),
        name: fileName,
        created_at: new Date().toISOString(),
      }));

      const sortedPhotos = photoUrls.sort(
        (a: StoragePhoto, b: StoragePhoto) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPhotos(sortedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const togglePhotoSelection = (photo: StoragePhoto) => {
    setSelectedPhotos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(photo.name)) {
        newSelection.delete(photo.name);
      } else {
        newSelection.add(photo.name);
      }
      return newSelection;
    });
  };


  const selectAllPhotos = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(photo => photo.name)));
    }
  };

  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) return;
    
    setIsDeletingPhotos(true);
    try {
      // Convert Set to Array and delete all selected photos at once
      await deleteMultipleFiles(Array.from(selectedPhotos));
      
      // Refresh the gallery
      await loadPhotosFromStorage();
      
      // Clear selection and exit delete mode
      setSelectedPhotos(new Set());
      setIsDeleteMode(false);
    } catch (error) {
      console.error("Error deleting photos:", error);
      // Optionally show an error message to the user
    } finally {
      setIsDeletingPhotos(false);
    } 
  };



  useEffect(() => {
    sessionStorage.removeItem("temp-photos");
    loadPhotosFromStorage();
    const pollInterval = setInterval(loadPhotosFromStorage, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 bg-gray-900/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">Gallery</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <QrCode className="w-5 h-5 text-white" />
            </button>

            {photos.length > 0 && (
              <>
                <button
                  onClick={() => navigate("/host/slideshow")}
                  className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  View Slideshow
                </button>
                <button
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  className={`p-2 rounded-full transition-colors ${
                    isDeleteMode ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Delete Mode Controls */}
        <AnimatePresence>
          {isDeleteMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAllPhotos}
                    className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-white/70">
                    {selectedPhotos.size} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsDeleteMode(false);
                      setSelectedPhotos(new Set());
                    }}
                    className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteSelectedPhotos}
                    disabled={selectedPhotos.size === 0 || isDeletingPhotos}
                    className={`px-4 py-2 rounded-full text-white transition-colors ${
                      selectedPhotos.size > 0 && !isDeletingPhotos
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-white/10 cursor-not-allowed'
                    }`}
                  >
                    {isDeletingPhotos ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      `Delete ${selectedPhotos.size ? `(${selectedPhotos.size})` : ''}`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gallery Grid */}
      <div className="px-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo) => (
              <motion.button
                key={photo.name}
                onClick={() => isDeleteMode ? togglePhotoSelection(photo) : setSelectedPhoto(photo)}
                className="relative aspect-square group focus:outline-none"
              >
                <img
                  src={photo.url}
                  alt="Event photo"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className={`absolute inset-0 transition-colors ${
                  isDeleteMode 
                    ? selectedPhotos.has(photo.name)
                      ? 'bg-red-500/30'
                      : 'bg-black/20 hover:bg-black/30'
                    : 'bg-black/0 group-hover:bg-black/20'
                }`} />
                
                {isDeleteMode && selectedPhotos.has(photo.name) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
      <QRCodeModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}

export default PhotoGallery;