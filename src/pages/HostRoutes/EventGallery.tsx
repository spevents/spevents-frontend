// src/pages/HostRoutes/EventGallery.tsx
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEvent } from "@/contexts/EventContext";
import { useState, useEffect } from "react";
import {
  QrCode,
  Trash2,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
  Play,
  FolderPlus,
  Download,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  listAllEventPhotos,
  getEventPhotoUrl,
  deleteMultipleFiles,
  EventPhoto,
} from "@/services/api";

// Type declaration for JSZip
declare global {
  interface Window {
    JSZip: any;
  }
}

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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);
  const [_showBulkActions, setShowBulkActions] = useState(false);

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

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.fileName)));
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) return;

    const selectedPhotoObjects = photos.filter((p) =>
      selectedPhotos.has(p.fileName),
    );

    try {
      // Load JSZip from CDN
      if (!window.JSZip) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.async = false;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const zip = new window.JSZip();
      console.log(`📦 Creating zip with ${selectedPhotoObjects.length} photos`);

      // Add each photo to zip
      for (let i = 0; i < selectedPhotoObjects.length; i++) {
        const photo = selectedPhotoObjects[i];
        try {
          console.log(
            `📥 Adding to zip: ${photo.fileName} (${i + 1}/${
              selectedPhotoObjects.length
            })`,
          );

          const response = await fetch(photo.url);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${photo.fileName}: ${response.status}`,
            );
          }

          // Convert to arrayBuffer for JSZip
          const arrayBuffer = await response.arrayBuffer();
          zip.file(photo.fileName, arrayBuffer);
        } catch (error) {
          console.error(`❌ Failed to add ${photo.fileName} to zip:`, error);
        }
      }

      // Generate and download zip
      console.log("🔄 Generating zip file...");
      zip.generateAsync({ type: "blob" }).then(function (
        content: Blob | MediaSource,
      ) {
        const zipUrl = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = `${currentEvent?.name || "event"}-photos-${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
        console.log("✅ Zip download complete");
      });
    } catch (error) {
      console.error("❌ Zip download error:", error);
      alert("Failed to create zip file. Please try again.");
    }
  };

  const handleShareSelected = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      // Create shareable link with selected photos
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

      // Try native share API first
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.log("Native share failed, falling back to clipboard");
          } else {
            return; // User cancelled
          }
        }
      }

      // Fallback: copy shareable link to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Show success message with link preview
      const message = `Shareable link copied to clipboard!\n\n${shareUrl}\n\nAnyone with this link can view the ${
        selectedPhotos.size
      } selected photo${selectedPhotos.size > 1 ? "s" : ""}.`;
      alert(message);
    } catch (error) {
      console.error("Failed to create shareable link:", error);

      // Ultimate fallback: share event gallery URL
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

      // Group photos by type for deletion
      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName),
      );

      console.log(
        "📋 Selected photos:",
        selectedPhotoObjects.map((p) => ({
          fileName: p.fileName,
          isGuest: p.isGuestPhoto,
          guestId: p.guestId,
        })),
      );

      // Delete guest photos (need guestId)
      const guestPhotos = selectedPhotoObjects.filter(
        (p) => p.isGuestPhoto && p.guestId,
      );

      if (guestPhotos.length > 0) {
        console.log(`🔄 Deleting ${guestPhotos.length} guest photos`);
        for (const photo of guestPhotos) {
          console.log(
            `🗑️ Deleting guest photo: ${photo.fileName} (guest: ${photo.guestId})`,
          );
          await deleteMultipleFiles(eventId, [photo.fileName], photo.guestId);
        }
      }

      // Delete regular event photos
      const eventPhotos = selectedPhotoObjects.filter((p) => !p.isGuestPhoto);
      if (eventPhotos.length > 0) {
        console.log(`🔄 Deleting ${eventPhotos.length} event photos`);
        const fileNames = eventPhotos.map((p) => p.fileName);
        console.log(`🗑️ Deleting event photos:`, fileNames);
        await deleteMultipleFiles(eventId, fileNames);
      }

      console.log("✅ Delete operations completed, reloading photos...");
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

  const handleAddFolder = () => {
    // Navigate to folder creation or show modal
    console.log("Add folder functionality");
    // This could open a modal or navigate to a folder creation page
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
              onClick={() => navigate("/host/library")}
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
              title="Show QR Code"
            >
              <QrCode className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={handleAddFolder}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Add Folder"
            >
              <FolderPlus className="w-5 h-5 text-white" />
            </button>

            {photos.length > 0 && (
              <>
                <button
                  onClick={() => navigate(`/host/event/${eventId}/slideshow`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Slideshow
                </button>

                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  Select Photos
                </button>
              </>
            )}
          </div>
        </div>

        {/* Selection Mode Controls */}
        <AnimatePresence>
          {isSelectionMode && selectedPhotos.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-white/70">
                    {selectedPhotos.size} of {photos.length} selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Select All
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDownloadSelected}
                    className="flex items-center gap-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                    title="Download Selected"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareSelected}
                    className="flex items-center gap-2 p-2 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
                    title="Share Selected"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={deleteSelectedPhotos}
                    disabled={isDeletingPhotos}
                    className="flex items-center gap-2 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    title="Delete Selected"
                  >
                    {isDeletingPhotos ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectionMode(false);
                      setSelectedPhotos(new Set());
                      setShowBulkActions(false);
                    }}
                    className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    Cancel
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
                  if (isSelectionMode) {
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
                    isSelectionMode
                      ? selectedPhotos.has(photo.fileName)
                        ? "bg-blue-500/30"
                        : "bg-black/20 hover:bg-black/30"
                      : "bg-black/0 group-hover:bg-black/20"
                  }`}
                />

                {isSelectionMode && selectedPhotos.has(photo.fileName) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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
