// src/components/PhotoGallery.tsx
import React, { useState, useCallback, useMemo, memo } from "react";
import { QrCode, Trash2, RefreshCw, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getPhotoUrl,
  listAllEventPhotos,
  deleteMultipleFiles,
  EventPhoto,
} from "@/services/api";
import { QRCodeModal } from "./QRCodeModal";
import { OptimizedImage } from "./ui/OptimizedImage";
import { usePhotoUpdates } from "@/hooks/usePhotoUpdates";

interface StoragePhoto {
  url: string;
  name: string;
  created_at: string;
}

// Memoized photo card to prevent unnecessary re-renders
const PhotoCard = memo(function PhotoCard({
  photo,
  isDeleteMode,
  isSelected,
  isNew,
  onSelect,
  onClick,
}: {
  photo: StoragePhoto;
  isDeleteMode: boolean;
  isSelected: boolean;
  isNew: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer ${
        isDeleteMode ? "ring-2 ring-offset-2 ring-offset-gray-900" : ""
      } ${
        isSelected ? "ring-red-500" : isDeleteMode ? "ring-gray-600" : ""
      } ${isNew ? "ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900" : ""}`}
      onClick={isDeleteMode ? onSelect : onClick}
    >
      <OptimizedImage
        src={photo.url}
        alt={`Photo ${photo.name}`}
        className="w-full h-full"
        aspectRatio="square"
        objectFit="cover"
      />
      {isDeleteMode && (
        <div className="absolute top-2 right-2">
          <div
            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
              isSelected ? "bg-red-500" : "bg-gray-700 bg-opacity-50"
            }`}
          >
            {isSelected && <CheckCircle size={16} className="text-white" />}
          </div>
        </div>
      )}
      {isNew && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
            New
          </span>
        </div>
      )}
    </motion.div>
  );
});

const PhotoGallery: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [_selectedPhoto, setSelectedPhoto] = useState<StoragePhoto | null>(
    null,
  );
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);

  // Fetch function for the hook
  const fetchPhotos = useCallback(async (): Promise<EventPhoto[]> => {
    if (!eventId) return [];
    return listAllEventPhotos(eventId);
  }, [eventId]);

  // Use smart polling hook with adaptive intervals
  const {
    photos: eventPhotos,
    isLoading,
    newPhotoIds,
    refresh,
  } = usePhotoUpdates({
    eventId,
    fetchPhotos,
    enabled: !!eventId,
    initialInterval: 3000, // 3 seconds when active
    maxInterval: 15000, // Slow to 15 seconds when idle
  });

  // Transform EventPhoto to StoragePhoto format
  const photos = useMemo((): StoragePhoto[] => {
    return eventPhotos.map((photo) => ({
      url: eventId ? getPhotoUrl(eventId, photo.fileName) : photo.url,
      name: photo.fileName,
      created_at: photo.uploadedAt || new Date().toISOString(),
    }));
  }, [eventPhotos, eventId]);

  const togglePhotoSelection = useCallback((photoName: string) => {
    setSelectedPhotos((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(photoName)) {
        newSelection.delete(photoName);
      } else {
        newSelection.add(photoName);
      }
      return newSelection;
    });
  }, []);

  const selectAllPhotos = useCallback(() => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((photo) => photo.name)));
    }
  }, [selectedPhotos.size, photos]);

  const deleteSelectedPhotos = useCallback(async () => {
    if (selectedPhotos.size === 0 || !eventId) return;

    setIsDeletingPhotos(true);
    try {
      await deleteMultipleFiles(eventId, Array.from(selectedPhotos));
      // Optimistic update: remove deleted photos locally
      setSelectedPhotos(new Set());
      setIsDeleteMode(false);
      // Refresh to get updated list
      await refresh();
    } catch (error) {
      console.error("Error deleting photos:", error);
    } finally {
      setIsDeletingPhotos(false);
    }
  }, [selectedPhotos, eventId, refresh]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

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
                onClick={handleRefresh}
                className={`p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isLoading ? "animate-spin" : ""
                }`}
                title="Refresh Gallery"
                disabled={isLoading}
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
        {isLoading && photos.length === 0 ? (
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
                <PhotoCard
                  key={photo.name}
                  photo={photo}
                  isDeleteMode={isDeleteMode}
                  isSelected={selectedPhotos.has(photo.name)}
                  isNew={newPhotoIds.has(photo.name)}
                  onSelect={() => togglePhotoSelection(photo.name)}
                  onClick={() => setSelectedPhoto(photo)}
                />
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
