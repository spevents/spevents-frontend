// src/components/PhotoGallery.tsx
import React, { useState, useEffect } from "react";
import { QrCode, Trash2, RefreshCw, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getPhotoUrl, listPhotos, deleteMultipleFiles } from "@/services/api";
import { QRCodeModal } from "./QRCodeModal";

interface StoragePhoto {
  url: string;
  name: string;
  created_at: string;
}

const PhotoGallery: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [photos, setPhotos] = useState<StoragePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_selectedPhoto, setSelectedPhoto] = useState<StoragePhoto | null>(
    null,
  );
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);

  const loadPhotosFromStorage = async () => {
    if (!eventId) return;

    try {
      const fileNames = await listPhotos(eventId);
      const photoUrls: StoragePhoto[] = fileNames.map((fileName: string) => ({
        url: getPhotoUrl(eventId, fileName),
        name: fileName,
        created_at: new Date().toISOString(),
      }));

      const sortedPhotos = photoUrls.sort(
        (a: StoragePhoto, b: StoragePhoto) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setPhotos(sortedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhotoSelection = (photo: StoragePhoto) => {
    setSelectedPhotos((prev) => {
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
      setSelectedPhotos(new Set(photos.map((photo) => photo.name)));
    }
  };

  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0 || !eventId) return;

    setIsDeletingPhotos(true);
    try {
      // Convert Set to Array and delete all selected photos at once
      await deleteMultipleFiles(eventId, Array.from(selectedPhotos));

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
    loadPhotosFromStorage();
    const pollInterval = setInterval(loadPhotosFromStorage, 5000);
    return () => clearInterval(pollInterval);
  }, [eventId]);

  const refreshPhotos = () => {
    setIsLoading(true);
    loadPhotosFromStorage();
  };

  if (!eventId) {
    return <div>No event ID provided</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Photo Gallery</h1>
        <div className="flex items-center gap-3">
          {isDeleteMode && (
            <>
              <button
                onClick={selectAllPhotos}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                {selectedPhotos.size === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                onClick={deleteSelectedPhotos}
                disabled={selectedPhotos.size === 0 || isDeletingPhotos}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                {isDeletingPhotos ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete ({selectedPhotos.size})
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedPhotos(new Set());
                }}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          {!isDeleteMode && (
            <>
              <button
                onClick={() => setIsDeleteMode(true)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Delete Photos"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={refreshPhotos}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh Gallery"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Show QR Code"
              >
                <QrCode size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-400 mb-4">No photos uploaded yet</p>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show QR Code to Get Started
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <motion.div
                  key={photo.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer ${
                    isDeleteMode
                      ? "ring-2 ring-offset-2 ring-offset-gray-900"
                      : ""
                  } ${
                    selectedPhotos.has(photo.name)
                      ? "ring-red-500"
                      : isDeleteMode
                        ? "ring-gray-600"
                        : ""
                  }`}
                  onClick={() => {
                    if (isDeleteMode) {
                      togglePhotoSelection(photo);
                    } else {
                      setSelectedPhoto(photo);
                    }
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${photo.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isDeleteMode && (
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                          selectedPhotos.has(photo.name)
                            ? "bg-red-500"
                            : "bg-gray-700 bg-opacity-50"
                        }`}
                      >
                        {selectedPhotos.has(photo.name) && (
                          <CheckCircle size={16} className="text-white" />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
};

export default PhotoGallery;
