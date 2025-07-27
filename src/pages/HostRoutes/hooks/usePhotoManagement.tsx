// File: src/pages/HostRoutes/hooks/usePhotoManagement.tsx
import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { auth } from "@/components/config/firebase";
import {
  listAllEventPhotos,
  getEventPhotoUrl,
  photoService,
  type EventPhoto,
} from "@/services/api";
import { DisplayPhoto } from "../types";

export function usePhotoManagement(
  eventId: string | undefined,
  currentEvent: any,
  selectedPhotos: Set<string>,
) {
  const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
  const [newPhotoIds, setNewPhotoIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isInitialLoad = useRef(true);
  const existingPhotoIds = useRef<Set<string>>(new Set());
  const hasLoadedOnce = useRef(false);
  const currentEventId = useRef<string | undefined>(undefined);

  // Reset refs if eventId changes
  if (currentEventId.current !== eventId) {
    isInitialLoad.current = true;
    existingPhotoIds.current = new Set();
    hasLoadedOnce.current = false;
    currentEventId.current = eventId;
  }

  const loadPhotosFromStorage = async () => {
    if (!eventId) return;

    try {
      console.log("🔍 Loading photos for eventId:", eventId);

      // Only show loading on true initial load (never loaded before)
      if (!hasLoadedOnce.current) {
        setIsLoading(true);
      }

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

      // Identify new photos (only after initial load)
      if (!isInitialLoad.current) {
        const currentPhotoIds = new Set(sortedPhotos.map((p) => p.fileName));
        const newIds = new Set<string>();

        console.log(
          "🔍 [DEBUG] Existing photo IDs:",
          Array.from(existingPhotoIds.current),
        );
        console.log(
          "🔍 [DEBUG] Current photo IDs:",
          Array.from(currentPhotoIds),
        );

        currentPhotoIds.forEach((id) => {
          if (!existingPhotoIds.current.has(id)) {
            newIds.add(id);
          }
        });

        console.log("🔍 [DEBUG] New photo IDs detected:", Array.from(newIds));
        setNewPhotoIds(newIds);

        // Clear new photo IDs after a delay to stop animation
        if (newIds.size > 0) {
          console.log("🔍 [DEBUG] Will clear new photo IDs in 1000ms");
          setTimeout(() => {
            console.log("🔍 [DEBUG] Clearing new photo IDs");
            setNewPhotoIds(new Set());
          }, 1000);
        }
      } else {
        // On initial load, all photos are "new" for animation
        console.log(
          "🔍 [DEBUG] Initial load - all photos marked as new:",
          sortedPhotos.length,
        );
        setNewPhotoIds(new Set(sortedPhotos.map((p) => p.fileName)));
        isInitialLoad.current = false;
      }

      // Update existing photo IDs reference
      existingPhotoIds.current = new Set(sortedPhotos.map((p) => p.fileName));
      console.log(
        "🔍 [DEBUG] Updated existing photo IDs reference:",
        Array.from(existingPhotoIds.current),
      );

      setPhotos(sortedPhotos);
      hasLoadedOnce.current = true;
    } catch (error) {
      console.error("❌ Error loading photos:", error);
    } finally {
      // Only set loading false if we were actually loading
      if (!hasLoadedOnce.current || isLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (eventId) {
      loadPhotosFromStorage();
      const pollInterval = setInterval(loadPhotosFromStorage, 5000);
      return () => clearInterval(pollInterval);
    }
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

      console.log(`🔗 Downloading via API: ${apiUrl}/api/photos`);

      const response = await fetch(`${apiUrl}/api/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "download",
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

  return {
    photos,
    newPhotoIds,
    isLoading,
    isDeletingPhotos,
    isDownloading,
    loadPhotosFromStorage,
    handleDownloadAll,
    handleDownloadSelected,
    handleDownloadSinglePhoto,
    deleteSelectedPhotos,
    handleShareSelected,
  };
}
