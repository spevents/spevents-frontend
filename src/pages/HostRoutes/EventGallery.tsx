// File: src/pages/HostRoutes/EventGallery.tsx

import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Trash2,
  Grid3X3,
  Grid2X2,
  X,
  Check,
  Calendar,
  Users,
  ImageIcon,
  Share,
  QrCode,
  RefreshCw,
  MoreHorizontal,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

      const eventPhotos: EventPhoto[] = await listAllEventPhotos(eventId);
      console.log("📸 Found photos:", eventPhotos.length);

      const displayPhotos: DisplayPhoto[] = eventPhotos.map((photo) => ({
        url: getEventPhotoUrl(eventId, photo),
        fileName: photo.fileName,
        created_at: new Date().toISOString(),
        fullKey: photo.fullKey,
        isGuestPhoto: photo.isGuestPhoto,
        guestId: photo.guestId,
      }));

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

  const downloadViaProxy = async (photo: DisplayPhoto): Promise<Blob> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      const apiUrl =
        import.meta.env.VITE_API_URL || "https://spevents-backend.vercel.app";

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

  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDownloading(true);
    try {
      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName),
      );

      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedPhotoObjects.length; i++) {
        const photo = selectedPhotoObjects[i];
        try {
          const blob = await downloadViaProxy(photo);
          if (blob.size === 0) {
            throw new Error("Empty response");
          }
          zip.file(photo.fileName, blob);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to download ${photo.fileName}:`, error);
          failCount++;
        }
      }

      if (successCount === 0) {
        throw new Error("No photos could be downloaded");
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

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
      setIsSelectionMode(false);
      setSelectedPhotos(new Set());
    }
  };

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
    if (isSelectionMode) {
      togglePhotoSelection(photo.fileName);
    } else {
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

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const gridCols =
    gridSize === "large"
      ? "grid-cols-3 md:grid-cols-4"
      : "grid-cols-4 md:grid-cols-6";
  const guestPhotosCount = photos.filter((p) => p.isGuestPhoto).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#344e41" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          backgroundColor: "rgba(52, 78, 65, 0.8)",
          borderBottomColor: "#588157",
        }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(`/host/event/${eventId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ color: "#dad7cd" }}
              >
                {currentEvent?.name || "Event Gallery"}
              </h1>
              <div
                className="flex items-center gap-4 text-sm"
                style={{ color: "#a3b18a" }}
              >
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {currentEvent?.date
                    ? new Date(currentEvent.date).toLocaleDateString()
                    : "Today"}
                </div>
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  {photos.length} photos
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {guestPhotosCount} from guests
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/host/event/${eventId}/qr`)}
              className="rounded-full hover:bg-opacity-20"
              style={{
                color: "#dad7cd",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(218, 215, 205, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title="Show QR Code"
            >
              <QrCode className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setGridSize(gridSize === "large" ? "small" : "large")
              }
              className="rounded-full"
              style={{
                color: "#dad7cd",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(218, 215, 205, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {gridSize === "large" ? (
                <Grid2X2 className="w-5 h-5" />
              ) : (
                <Grid3X3 className="w-5 h-5" />
              )}
            </Button>
            {photos.length > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate(`/host/event/${eventId}/slideshow`)}
                className="border-opacity-50 hover:bg-opacity-20"
                style={{
                  color: "#dad7cd",
                  borderColor: "#588157",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(88, 129, 87, 0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Slideshow
              </Button>
            )}
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) {
                  setSelectedPhotos(new Set());
                }
              }}
              className="border-opacity-50"
              style={{
                color: isSelectionMode ? "#344e41" : "#dad7cd",
                backgroundColor: isSelectionMode ? "#a3b18a" : "transparent",
                borderColor: "#588157",
              }}
            >
              {isSelectionMode ? "Done" : "Select"}
            </Button>
          </div>
        </div>

        {/* Selection Actions Bar */}
        <AnimatePresence>
          {isSelectionMode && selectedPhotos.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t"
              style={{
                borderTopColor: "#588157",
                backgroundColor: "#588157",
              }}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#dad7cd" }}
                  >
                    {selectedPhotos.size} of {photos.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    style={{ color: "#a3b18a" }}
                  >
                    {selectedPhotos.size === photos.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("Share selected")}
                    style={{
                      color: "#dad7cd",
                      borderColor: "#a3b18a",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSelected}
                    disabled={isDownloading}
                    style={{
                      color: "#dad7cd",
                      borderColor: "#a3b18a",
                      backgroundColor: "transparent",
                    }}
                  >
                    {isDownloading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isDownloading ? "Creating ZIP..." : "Download"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedPhotos}
                    disabled={isDeletingPhotos}
                    style={{
                      color: "#dad7cd",
                      backgroundColor: "#3a5a40",
                      borderColor: "#3a5a40",
                    }}
                  >
                    {isDeletingPhotos ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
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
            <RefreshCw
              className="w-8 h-8 animate-spin"
              style={{ color: "#a3b18a" }}
            />
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center"
          >
            <ImageIcon
              className="w-16 h-16 mb-4"
              style={{ color: "#588157" }}
            />
            <h3
              className="text-xl font-medium mb-2"
              style={{ color: "#dad7cd" }}
            >
              No photos yet
            </h3>
            <p className="mb-4" style={{ color: "#a3b18a" }}>
              Share your event code to start collecting photos
            </p>
            <Button
              onClick={() => navigate(`/host/event/${eventId}/qr`)}
              className="gap-2"
              style={{
                backgroundColor: "#588157",
                color: "#dad7cd",
                borderColor: "#588157",
              }}
            >
              <QrCode className="w-4 h-4" />
              Show QR Code
            </Button>
          </motion.div>
        ) : (
          Object.entries(groupedPhotos).map(([date, datePhotos]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2
                  className="text-lg font-medium"
                  style={{ color: "#dad7cd" }}
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: "#588157",
                    color: "#dad7cd",
                  }}
                >
                  {datePhotos.length} photos
                </Badge>
              </div>

              <div className={`grid ${gridCols} gap-2`}>
                {datePhotos.map((photo, index) => (
                  <motion.div
                    key={photo.fileName}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.fileName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Selection Overlay */}
                    {isSelectionMode && (
                      <div
                        className={`absolute inset-0 transition-all duration-200 ${
                          selectedPhotos.has(photo.fileName)
                            ? "border-2"
                            : "hover:bg-black/10"
                        }`}
                        style={{
                          backgroundColor: selectedPhotos.has(photo.fileName)
                            ? "rgba(163, 177, 138, 0.3)"
                            : "transparent",
                          borderColor: selectedPhotos.has(photo.fileName)
                            ? "#a3b18a"
                            : "transparent",
                        }}
                      >
                        <div className="absolute top-2 right-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: selectedPhotos.has(
                                photo.fileName,
                              )
                                ? "#a3b18a"
                                : "rgba(218, 215, 205, 0.8)",
                              borderColor: selectedPhotos.has(photo.fileName)
                                ? "#a3b18a"
                                : "#dad7cd",
                            }}
                          >
                            {selectedPhotos.has(photo.fileName) && (
                              <Check
                                className="w-4 h-4"
                                style={{ color: "#344e41" }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Guest Photo Indicator */}
                    {!isSelectionMode && photo.isGuestPhoto && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 right-2">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: "#a3b18a",
                              color: "#344e41",
                            }}
                          >
                            Guest
                          </Badge>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(52, 78, 65, 0.95)" }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 rounded-full"
                style={{
                  backgroundColor: "rgba(52, 78, 65, 0.5)",
                  color: "#dad7cd",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(52, 78, 65, 0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(52, 78, 65, 0.5)")
                }
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Photo */}
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.fileName}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {/* Photo Info */}
              <div
                className="absolute bottom-4 left-4 right-4 rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(52, 78, 65, 0.5)",
                  color: "#dad7cd",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{selectedPhoto.fileName}</h3>
                  <div className="flex items-center gap-2">
                    {selectedPhoto.isGuestPhoto && (
                      <Badge
                        style={{
                          backgroundColor: "#a3b18a",
                          color: "#344e41",
                        }}
                      >
                        Guest Photo
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm" style={{ color: "#a3b18a" }}>
                  {new Date(selectedPhoto.created_at).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadSinglePhoto(selectedPhoto)}
                  style={{
                    backgroundColor: "#588157",
                    color: "#dad7cd",
                    borderColor: "#588157",
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    console.log("Share photo:", selectedPhoto.fileName)
                  }
                  style={{
                    backgroundColor: "#588157",
                    color: "#dad7cd",
                    borderColor: "#588157",
                  }}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSinglePhoto(selectedPhoto)}
                  disabled={isDeletingSingle}
                  style={{
                    backgroundColor: "#3a5a40",
                    color: "#dad7cd",
                    borderColor: "#3a5a40",
                  }}
                >
                  {isDeletingSingle ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    console.log("More options:", selectedPhoto.fileName)
                  }
                  style={{
                    color: "#dad7cd",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(218, 215, 205, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventGallery;
