// src/pages/HostRoutes/EventGallery.tsx
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEvent } from "../../contexts/EventContext";
import { useState, useEffect } from "react";
import {
  QrCode,
  Trash2,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  listAllEventPhotos,
  getEventPhotoUrl,
  deleteMultipleFiles,
  EventPhoto,
} from "../../services/api";
// import {
//   listAllEventPhotos,
//   getEventPhotoUrl,
//   deleteMultipleFiles,
//   EventPhoto,
// } from "../../lib/aws";

interface DisplayPhoto {
  url: string;
  fileName: string;
  created_at: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
}

export function EventGallery() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentEvent, selectEvent } = useEvent();

  const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);

  useEffect(() => {
    if (eventId && (!currentEvent || currentEvent.id !== eventId)) {
      selectEvent(eventId);
    }
  }, [eventId, currentEvent, selectEvent]);

  const loadPhotosFromStorage = async () => {
    if (!eventId) return;

    try {
      console.log("🔍 Loading photos for eventId:", eventId);

      // Get all photos (both event and guest photos)
      const eventPhotos: EventPhoto[] = await listAllEventPhotos(eventId);
      console.log("📸 Found photos:", eventPhotos.length);

      // Convert to display format with correct URLs
      const displayPhotos: DisplayPhoto[] = eventPhotos.map((photo) => ({
        url: getEventPhotoUrl(eventId, photo),
        fileName: photo.fileName,
        created_at: new Date().toISOString(),
        fullKey: photo.fullKey,
        isGuestPhoto: photo.isGuestPhoto,
        guestId: photo.guestId,
      }));

      console.log("🖼️ Display photos created:", displayPhotos.length);
      console.log(
        "📋 Sample photo URLs:",
        displayPhotos.slice(0, 3).map((p) => ({
          fileName: p.fileName,
          url: p.url,
          isGuest: p.isGuestPhoto,
        })),
      );

      // Sort by creation time (most recent first)
      const sortedPhotos = displayPhotos.sort(
        (a: DisplayPhoto, b: DisplayPhoto) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setPhotos(sortedPhotos);
    } catch (error) {
      console.error("❌ Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotosFromStorage();
    const pollInterval = setInterval(loadPhotosFromStorage, 5000);
    return () => clearInterval(pollInterval);
  }, [eventId]);

  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0 || !eventId) return;

    setIsDeletingPhotos(true);
    try {
      // Group photos by type for deletion
      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName),
      );

      // Delete guest photos (need guestId)
      const guestPhotos = selectedPhotoObjects.filter(
        (p) => p.isGuestPhoto && p.guestId,
      );
      for (const photo of guestPhotos) {
        await deleteMultipleFiles(eventId, [photo.fileName], photo.guestId);
      }

      // Delete regular event photos
      const eventPhotos = selectedPhotoObjects.filter((p) => !p.isGuestPhoto);
      if (eventPhotos.length > 0) {
        await deleteMultipleFiles(
          eventId,
          eventPhotos.map((p) => p.fileName),
        );
      }

      await loadPhotosFromStorage();
      setSelectedPhotos(new Set());
      setIsDeleteMode(false);
    } catch (error) {
      console.error("❌ Error deleting photos:", error);
    } finally {
      setIsDeletingPhotos(false);
    }
  };

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 bg-gray-900/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/host")}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-lg font-semibold">
                {currentEvent?.name || "Event Gallery"}
              </h1>
              <p className="text-white/60 text-sm">
                Session: {currentEvent?.sessionCode} • {photos.length} photos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/host/event/${eventId}/qr`)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <QrCode className="w-5 h-5 text-white" />
            </button>

            {photos.length > 0 && (
              <>
                <button
                  onClick={() => navigate(`/host/event/${eventId}/slideshow`)}
                  className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  View Slideshow
                </button>
                <button
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  className={`p-2 rounded-full transition-colors ${
                    isDeleteMode
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-white/10 hover:bg-white/20"
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
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-white/10 cursor-not-allowed"
                    }`}
                  >
                    {isDeletingPhotos ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      `Delete ${selectedPhotos.size ? `(${selectedPhotos.size})` : ""}`
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
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <p className="text-white/60 mb-4">No photos uploaded yet</p>
            <button
              onClick={() => navigate(`/host/event/${eventId}/qr`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show QR Code to Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo) => (
              <motion.button
                key={photo.fileName}
                onClick={() => {
                  if (isDeleteMode) {
                    const newSelection = new Set(selectedPhotos);
                    if (newSelection.has(photo.fileName)) {
                      newSelection.delete(photo.fileName);
                    } else {
                      newSelection.add(photo.fileName);
                    }
                    setSelectedPhotos(newSelection);
                  }
                }}
                className="relative aspect-square group focus:outline-none"
              >
                <img
                  src={photo.url}
                  alt="Event photo"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => {
                    console.error("❌ Failed to load image:", photo.url);
                    console.error("Photo details:", photo);
                  }}
                  onLoad={() => {
                    console.log(
                      "✅ Successfully loaded image:",
                      photo.fileName,
                    );
                  }}
                />

                {/* Guest photo indicator */}
                {photo.isGuestPhoto && (
                  <div
                    className="absolute top-1 left-1 w-3 h-3 bg-green-500 rounded-full"
                    title="Guest photo"
                  />
                )}

                <div
                  className={`absolute inset-0 transition-colors ${
                    isDeleteMode
                      ? selectedPhotos.has(photo.fileName)
                        ? "bg-red-500/30"
                        : "bg-black/20 hover:bg-black/30"
                      : "bg-black/0 group-hover:bg-black/20"
                  }`}
                />

                {isDeleteMode && selectedPhotos.has(photo.fileName) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
