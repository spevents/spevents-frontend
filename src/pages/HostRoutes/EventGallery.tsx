// File: src/pages/HostRoutes/EventGallery.tsx

import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Download,
  Trash2,
  ArrowLeft,
  Grid3X3,
  Grid2X2,
  X,
  QrCode,
} from "lucide-react";
import JSZip from "jszip";
import { auth } from "@/components/config/firebase";
import { useEvent } from "@/contexts/EventContext";
import {
  listAllEventPhotos,
  getEventPhotoUrl,
  deleteMultipleFiles,
  EventPhoto,
} from "@/services/api";

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
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [gridSize, setGridSize] = useState<"large" | "small">("large");
  const [selectedPhoto, setSelectedPhoto] = useState<DisplayPhoto | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  useEffect(() => {
    if (eventId && (!currentEvent || currentEvent.id !== eventId)) {
      selectEvent(eventId);
    }
  }, [eventId, currentEvent, selectEvent]);

  const loadPhotosFromStorage = async () => {
    if (!eventId) return;

    try {
      console.log("🔍 Loading photos for eventId:", eventId);
      setIsLoading(true);

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

  // CORS-friendly download using your API as proxy
  const downloadViaProxy = async (photo: DisplayPhoto): Promise<Blob> => {
    try {
      // Get Firebase auth token properly
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      const apiUrl =
        import.meta.env.VITE_API_URL || "https://spevents-backend.vercel.app";

      console.log(`🔗 Downloading via API: ${apiUrl}/api/photos/download`);

      const response = await fetch(`${apiUrl}/api/photos/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          fileName: photo.fileName,
          guestId: photo.guestId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      return response.blob();
    } catch (error) {
      console.error("Download via proxy failed:", error);
      throw error;
    }
  };

  // Updated download function using API proxy
  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDownloading(true);
    try {
      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName),
      );

      console.log(`🔄 Creating zip with ${selectedPhotoObjects.length} photos`);

      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      // Download photos via API proxy to avoid CORS
      for (let i = 0; i < selectedPhotoObjects.length; i++) {
        const photo = selectedPhotoObjects[i];
        try {
          console.log(
            `📥 Downloading: ${photo.fileName} (${i + 1}/${
              selectedPhotoObjects.length
            })`,
          );

          // Use API proxy instead of direct fetch
          const blob = await downloadViaProxy(photo);

          if (blob.size === 0) {
            throw new Error("Empty response");
          }

          zip.file(photo.fileName, blob);
          successCount++;

          console.log(
            `✅ Added to zip: ${photo.fileName} (${blob.size} bytes)`,
          );
        } catch (error) {
          console.error(`❌ Failed to download ${photo.fileName}:`, error);
          failCount++;
        }
      }

      if (successCount === 0) {
        throw new Error("No photos could be downloaded");
      }

      console.log(
        `📊 Download summary: ${successCount} success, ${failCount} failed`,
      );

      // Generate and download zip
      console.log("🔄 Generating zip file...");
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      // Create download link
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = `${currentEvent?.name || "event"}-photos-${
        new Date().toISOString().split("T")[0]
      }.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);

      console.log("✅ Zip download initiated");

      if (failCount > 0) {
        alert(
          `Download completed with ${successCount} photos. ${failCount} photos failed to download.`,
        );
      }
    } catch (error) {
      console.error("❌ Zip download error:", error);
      alert(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Updated single photo download using API proxy
  const handleDownloadSinglePhoto = async (photo: DisplayPhoto) => {
    try {
      const blob = await downloadViaProxy(photo);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = photo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download photo. Please try again.");
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.fileName)));
    }
  };

  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0 || !eventId) return;

    setIsDeletingPhotos(true);
    try {
      console.log(
        `🗑️ Deleting ${selectedPhotos.size} photos for event ${eventId}`,
      );

      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName),
      );

      const guestPhotos = selectedPhotoObjects.filter(
        (p) => p.isGuestPhoto && p.guestId,
      );

      for (const photo of guestPhotos) {
        await deleteMultipleFiles(eventId, [photo.fileName], photo.guestId);
      }

      const eventPhotos = selectedPhotoObjects.filter((p) => !p.isGuestPhoto);
      if (eventPhotos.length > 0) {
        await deleteMultipleFiles(
          eventId,
          eventPhotos.map((p) => p.fileName),
        );
      }

      await loadPhotosFromStorage();
      setSelectedPhotos(new Set());
      setIsSelectionMode(false);
      console.log("✅ Photos deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting photos:", error);
      alert(
        `Failed to delete photos: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsDeletingPhotos(false);
    }
  };

  const deleteSinglePhoto = async (photo: DisplayPhoto) => {
    if (!eventId) return;

    setIsDeletingSingle(true);
    try {
      if (photo.isGuestPhoto && photo.guestId) {
        await deleteMultipleFiles(eventId, [photo.fileName], photo.guestId);
      } else {
        await deleteMultipleFiles(eventId, [photo.fileName]);
      }

      await loadPhotosFromStorage();
      setSelectedPhoto(null);
      console.log("✅ Photo deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting photo:", error);
      alert(
        `Failed to delete photo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handlePhotoClick = (photo: DisplayPhoto) => {
    if (!isSelectionMode) {
      setSelectedPhoto(photo);
    }
  };

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const gridCols = gridSize === "large" ? "grid-cols-3" : "grid-cols-5";

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/host/event/${eventId}`)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {currentEvent?.name || "Event Gallery"}

            <p className="flex text-white/60 text-sm">
              Session: {currentEvent?.sessionCode} • {photos.length} photos
            </p>
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
              </>
            )}
          </div>
          <button
            onClick={() =>
              setGridSize(gridSize === "large" ? "small" : "large")
            }
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title={`Switch to ${gridSize === "large" ? "small" : "large"} grid`}
          >
            {gridSize === "large" ? (
              <Grid2X2 className="w-5 h-5 text-white" />
            ) : (
              <Grid3X3 className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isSelectionMode ? "Cancel" : "Select"}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedPhotos.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-blue-600 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-white">
                  {selectedPhotos.size} of {photos.length} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  {selectedPhotos.size === photos.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownloadSelected}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloading ? "Creating ZIP..." : "Download ZIP"}
                </button>

                <button
                  onClick={deleteSelectedPhotos}
                  disabled={isDeletingPhotos}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeletingPhotos ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className={`grid ${gridCols} gap-1`}>
            {photos.map((photo) => (
              <motion.div
                key={photo.fileName}
                className="relative aspect-square group cursor-pointer"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.url}
                  alt="Event photo"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Selection overlay */}
                {isSelectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSelection = new Set(selectedPhotos);
                      if (newSelection.has(photo.fileName)) {
                        newSelection.delete(photo.fileName);
                      } else {
                        newSelection.add(photo.fileName);
                      }
                      setSelectedPhotos(newSelection);
                    }}
                    className={`absolute inset-0 transition-colors ${
                      selectedPhotos.has(photo.fileName)
                        ? "bg-blue-600/50 border-2 border-blue-400"
                        : "bg-black/20 hover:bg-black/40"
                    }`}
                  >
                    {selectedPhotos.has(photo.fileName) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                )}

                {/* Guest photo indicator */}
                {photo.isGuestPhoto && (
                  <div
                    className="absolute top-1 left-1 w-3 h-3 bg-green-500 rounded-full"
                    title="Guest photo"
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Photo */}
              <img
                src={selectedPhoto.url}
                alt="Event photo"
                className="max-w-full max-h-[80vh] object-contain"
              />

              {/* Action buttons */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <button
                  onClick={() => handleDownloadSinglePhoto(selectedPhoto)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => deleteSinglePhoto(selectedPhoto)}
                  disabled={isDeletingSingle}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeletingSingle ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>

              {/* Guest photo indicator */}
              {selectedPhoto.isGuestPhoto && (
                <div className="absolute top-4 left-4 px-2 py-1 bg-green-500 rounded text-white text-sm">
                  Guest photo
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventGallery;
