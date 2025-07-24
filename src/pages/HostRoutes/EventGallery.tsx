"use client";

// File: src/pages/HostRoutes/EventGallery.tsx
import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Download,
  Trash2,
  ArrowLeft,
  QrCode,
  Check,
  Calendar,
  Users,
  ImageIcon,
  Share,
  Grid3X3,
  Grid2X2,
  X,
  MoreHorizontal,
} from "lucide-react";
import JSZip from "jszip";
import { auth } from "@/components/config/firebase";
import { useEvent } from "@/contexts/EventContext";
import {
  listAllEventPhotos,
  getEventPhotoUrl,
  photoService,
  type EventPhoto,
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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // Navigation functions for modal
  const navigateToPhoto = (index: number) => {
    if (index >= 0 && index < photos.length) {
      setCurrentPhotoIndex(index);
      setSelectedPhoto(photos[index]);
    }
  };

  const navigateNext = () => {
    const nextIndex = (currentPhotoIndex + 1) % photos.length;
    navigateToPhoto(nextIndex);
  };

  const navigatePrevious = () => {
    const prevIndex =
      currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1;
    navigateToPhoto(prevIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          navigatePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateNext();
          break;
        case "Escape":
          e.preventDefault();
          setSelectedPhoto(null);
          break;
      }
    };

    if (selectedPhoto) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [selectedPhoto, currentPhotoIndex, photos.length]);

  // Force select the event from URL parameter immediately
  useEffect(() => {
    if (eventId) {
      console.log(`🎯 EventGallery: Forcing selection of eventId: ${eventId}`);
      selectEvent(eventId);
    }
  }, [eventId, selectEvent]);

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
    if (eventId) {
      loadPhotosFromStorage();
      const pollInterval = setInterval(loadPhotosFromStorage, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [eventId]);

  // Group photos by date
  const groupedPhotos = photos.reduce(
    (groups, photo) => {
      const date = new Date(photo.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
      return groups;
    },
    {} as Record<string, DisplayPhoto[]>,
  );

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

  // Download all photos
  const handleDownloadAll = async () => {
    if (photos.length === 0) return;

    setIsDownloading(true);
    try {
      console.log(`🔄 Creating zip with all ${photos.length} photos`);

      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      // Download all photos via API proxy
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          console.log(
            `📥 Downloading: ${photo.fileName} (${i + 1}/${photos.length})`,
          );

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
      link.download = `${currentEvent?.name || "event"}-all-photos-${
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

  const handlePhotoClick = (photo: DisplayPhoto) => {
    if (isSelectionMode) {
      togglePhotoSelection(photo.fileName);
    } else {
      const photoIndex = photos.findIndex((p) => p.fileName === photo.fileName);
      setCurrentPhotoIndex(photoIndex);
      setSelectedPhoto(photo);
    }
  };

  const togglePhotoSelection = (fileName: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(fileName)) {
      newSelection.delete(fileName);
    } else {
      newSelection.add(fileName);
    }
    setSelectedPhotos(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.fileName)));
    }
  };

  const handleShareSelected = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      const baseUrl = window.location.origin;
      const photoParams = Array.from(selectedPhotos).join(",");
      const shareUrl = `${baseUrl}/guest/${
        currentEvent?.sessionCode
      }?photos=${encodeURIComponent(photoParams)}`;

      const shareData = {
        title: `${currentEvent?.name} - Selected Photos`,
        text: `Check out these ${selectedPhotos.size} photos from ${currentEvent?.name}!`,
        url: shareUrl,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.log("Native share failed, falling back to clipboard");
          } else {
            return;
          }
        }
      }

      await navigator.clipboard.writeText(shareUrl);
      const message = `Shareable link copied to clipboard!\n\n${shareUrl}\n\nAnyone with this link can view the ${
        selectedPhotos.size
      } selected photo${selectedPhotos.size > 1 ? "s" : ""}.`;
      alert(message);
    } catch (error) {
      console.error("Failed to create shareable link:", error);
      try {
        const eventUrl = `${window.location.origin}/guest/${currentEvent?.sessionCode}`;
        await navigator.clipboard.writeText(eventUrl);
        alert(`Event gallery link copied to clipboard:\n${eventUrl}`);
      } catch (clipboardError) {
        alert("Failed to create shareable link. Please try again.");
      }
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

      // Use photoService.deletePhotos with fullKeys
      const photoKeys = selectedPhotoObjects.map((p) => p.fullKey);
      await photoService.deletePhotos(eventId, photoKeys);

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

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const gridCols =
    gridSize === "large"
      ? "grid-cols-3 md:grid-cols-4"
      : "grid-cols-4 md:grid-cols-6";
  const guestPhotos = photos.filter((p) => p.isGuestPhoto).length;

  return (
    <div className="min-h-screen bg-sp_eggshell">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-sp_eggshell/95 backdrop-blur-md border-b border-sp_lightgreen/30"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-full hover:bg-sp_lightgreen/20 text-sp_darkgreen transition-colors"
              onClick={() => navigate("/host")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-sp_darkgreen">
                {currentEvent?.name || "Event Gallery"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-sp_green">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {currentEvent?.timestamp
                    ? new Date(currentEvent.timestamp).toLocaleDateString()
                    : "Today"}
                </div>
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  {photos.length} photos
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {guestPhotos} from guests
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Actions Group */}
            <div className="flex items-center gap-1 p-1 bg-sp_lightgreen/10 rounded-lg border border-sp_lightgreen/20">
              <button
                onClick={() => navigate(`/host/event/${eventId}/qr`)}
                className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {photos.length > 0 && (
                <>
                  <button
                    onClick={() => navigate(`/host/event/${eventId}/slideshow`)}
                    className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                    title="View Slideshow"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </button>

                  <button
                    onClick={() =>
                      setGridSize(gridSize === "large" ? "small" : "large")
                    }
                    className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                    title={`Switch to ${
                      gridSize === "large" ? "small" : "large"
                    } grid`}
                  >
                    {gridSize === "large" ? (
                      <Grid2X2 className="w-4 h-4" />
                    ) : (
                      <Grid3X3 className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Primary Actions Group */}
            {photos.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-sp_green text-sp_eggshell rounded-lg hover:bg-sp_darkgreen transition-colors disabled:opacity-50 font-medium"
                >
                  {isDownloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Download All</span>
                </button>

                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSelectionMode
                      ? "bg-sp_green hover:bg-sp_darkgreen text-sp_eggshell"
                      : "border border-sp_green text-sp_green hover:bg-sp_green hover:text-sp_eggshell"
                  }`}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) {
                      setSelectedPhotos(new Set());
                    }
                  }}
                >
                  {isSelectionMode ? "Done" : "Select"}
                </button>
              </div>
            )}

            {/* Utility Actions */}
            <div className="flex items-center">
              <button
                onClick={loadPhotosFromStorage}
                className="p-2 rounded-lg hover:bg-sp_lightgreen/20 text-sp_darkgreen transition-colors"
                title="Refresh photos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selection Actions Bar */}
        <AnimatePresence>
          {isSelectionMode && selectedPhotos.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-sp_lightgreen/30 bg-sp_lightgreen/20"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-sp_darkgreen">
                    {selectedPhotos.size} of {photos.length} selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-sp_green hover:text-sp_darkgreen transition-colors"
                  >
                    {selectedPhotos.size === photos.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareSelected}
                    className="flex items-center gap-2 px-3 py-2 border border-sp_green text-sp_green hover:bg-sp_green hover:text-sp_eggshell rounded-lg transition-colors"
                  >
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={handleDownloadSelected}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-3 py-2 border border-sp_midgreen text-sp_midgreen hover:bg-sp_midgreen hover:text-sp_eggshell rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={deleteSelectedPhotos}
                    disabled={isDeletingPhotos}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Photo Gallery */}
      <div className="p-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <RefreshCw className="w-8 h-8 text-sp_darkgreen animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <p className="text-sp_green mb-4">No photos uploaded yet</p>
            <button
              onClick={() => navigate(`/host/event/${eventId}/qr`)}
              className="px-4 py-2 bg-sp_green text-sp_eggshell rounded-lg hover:bg-sp_darkgreen transition-colors"
            >
              Show QR Code to Get Started
            </button>
          </div>
        ) : (
          Object.entries(groupedPhotos).map(([date, datePhotos]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-medium text-sp_darkgreen">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <span className="text-xs px-2 py-1 bg-sp_lightgreen/30 text-sp_darkgreen rounded-full">
                  {datePhotos.length} photos
                </span>
              </div>

              <div className={`grid ${gridCols} gap-2`}>
                {datePhotos.map((photo, index) => (
                  <motion.div
                    key={photo.fileName}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg border border-sp_lightgreen/30 bg-white"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <img
                      src={photo.url || "/placeholder.svg"}
                      alt={photo.fileName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Selection Overlay */}
                    {isSelectionMode && (
                      <div
                        className={`absolute inset-0 transition-all duration-200 ${
                          selectedPhotos.has(photo.fileName)
                            ? "bg-sp_green/40 border-2 border-sp_green"
                            : "bg-black/0 hover:bg-sp_darkgreen/10"
                        }`}
                      >
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedPhotos.has(photo.fileName)
                                ? "bg-sp_green border-sp_green"
                                : "bg-sp_eggshell/90 border-sp_lightgreen"
                            }`}
                          >
                            {selectedPhotos.has(photo.fileName) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Photo Info Overlay */}
                    {!isSelectionMode && (
                      <div className="absolute inset-0 bg-gradient-to-t from-sp_darkgreen/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 right-2">
                          {photo.isGuestPhoto && (
                            <span className="text-xs px-2 py-1 bg-sp_midgreen/90 text-sp_eggshell rounded-full">
                              Guest
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Navigation Arrow - Left */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm group"
              >
                <svg
                  className="w-6 h-6 transition-transform group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Navigation Arrow - Right */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm group"
              >
                <svg
                  className="w-6 h-6 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Close Button */}
            <button
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm group"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6 transition-transform group-hover:scale-110" />
            </button>

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute top-6 left-6 z-10 px-3 py-2 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
                {currentPhotoIndex + 1} of {photos.length}
              </div>
            )}

            {/* Main Photo Container */}
            <motion.div
              key={selectedPhoto.fileName}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo */}
              <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
                <img
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.fileName}
                  className="max-w-[85vw] max-h-[75vh] object-contain"
                  style={{ minHeight: "200px" }}
                />
              </div>

              {/* Photo Metadata */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-4 bg-sp_darkgreen/95 backdrop-blur-md rounded-lg p-4 text-sp_eggshell border border-sp_lightgreen/20 max-w-full min-w-[300px]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sp_eggshell text-lg truncate mb-1">
                      {selectedPhoto.fileName}
                    </h3>
                    <p className="text-sm text-sp_lightgreen">
                      {new Date(selectedPhoto.created_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {selectedPhoto.isGuestPhoto && (
                      <span className="px-3 py-1 bg-sp_midgreen text-sp_eggshell rounded-full text-xs font-medium">
                        Guest Photo
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2 border-t border-sp_lightgreen/20">
                  <button
                    onClick={() => handleDownloadSinglePhoto(selectedPhoto)}
                    className="flex items-center gap-2 px-4 py-2 bg-sp_green hover:bg-sp_midgreen text-sp_eggshell rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() =>
                      console.log("Share photo:", selectedPhoto.fileName)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-sp_lightgreen/20 hover:bg-sp_lightgreen/30 text-sp_eggshell rounded-lg transition-colors"
                  >
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() =>
                      console.log("More options:", selectedPhoto.fileName)
                    }
                    className="p-2 text-sp_eggshell hover:bg-sp_lightgreen/20 rounded-lg transition-colors"
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Keyboard Hints */}
              {photos.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-white/60 text-xs text-center"
                >
                  Use ← → arrow keys to navigate • ESC to close
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventGallery;
