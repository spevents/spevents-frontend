// File: src/pages/HostRoutes/hooks/usePhotoManagement.tsx
// Fix: Line 84 - Use photo.url directly instead of getEventPhotoUrl()

import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { auth } from "@/components/config/firebase";
import {
  listAllEventPhotos,
  photoService,
  type EventPhoto,
} from "@/services/api";
import { DisplayPhoto } from "../types";

export function usePhotoManagement(
  eventId: string | undefined,
  currentEvent: any,
  selectedPhotos: Set<string>
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

      if (!hasLoadedOnce.current) {
        setIsLoading(true);
      }

      const eventPhotos: EventPhoto[] = await listAllEventPhotos(eventId);
      console.log("📸 Found photos:", eventPhotos.length);

      // ✅ FIX: Use photo.url directly from backend
      const displayPhotos: DisplayPhoto[] = eventPhotos.map((photo) => ({
        url: photo.url, // ← Use direct URL from backend
        fileName: photo.fileName,
        created_at: photo.uploadedAt || new Date().toISOString(),
        fullKey: photo.fullKey,
        isGuestPhoto: photo.isGuestPhoto,
        guestId: photo.guestId,
      }));

      const sortedPhotos = displayPhotos.sort(
        (a: DisplayPhoto, b: DisplayPhoto) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      if (!isInitialLoad.current) {
        const currentPhotoIds = new Set(sortedPhotos.map((p) => p.fileName));
        const newIds = new Set<string>();

        currentPhotoIds.forEach((id) => {
          if (!existingPhotoIds.current.has(id)) {
            newIds.add(id);
          }
        });

        setNewPhotoIds(newIds);

        if (newIds.size > 0) {
          setTimeout(() => {
            setNewPhotoIds(new Set());
          }, 1000);
        }
      } else {
        setNewPhotoIds(new Set(sortedPhotos.map((p) => p.fileName)));
        isInitialLoad.current = false;
      }

      existingPhotoIds.current = new Set(sortedPhotos.map((p) => p.fileName));
      setPhotos(sortedPhotos);
      hasLoadedOnce.current = true;
    } catch (error) {
      console.error("❌ Error loading photos:", error);
    } finally {
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

  const downloadViaProxy = async (photo: DisplayPhoto): Promise<Blob> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      const apiUrl =
        import.meta.env.VITE_API_URL || "https://api.spevents.live";

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

  const handleDownloadAll = async () => {
    if (photos.length === 0) return;

    setIsDownloading(true);
    try {
      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          const blob = await downloadViaProxy(photo);
          if (blob.size === 0) throw new Error("Empty response");
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
        compressionOptions: { level: 6 },
      });

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

      if (failCount > 0) {
        alert(
          `Download completed with ${successCount} photos. ${failCount} photos failed to download.`
        );
      }
    } catch (error) {
      console.error("❌ Zip download error:", error);
      alert(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDownloading(true);
    try {
      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName)
      );

      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedPhotoObjects.length; i++) {
        const photo = selectedPhotoObjects[i];
        try {
          const blob = await downloadViaProxy(photo);
          if (blob.size === 0) throw new Error("Empty response");
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
        compressionOptions: { level: 6 },
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
          `Download completed with ${successCount} photos. ${failCount} photos failed to download.`
        );
      }
    } catch (error) {
      console.error("❌ Zip download error:", error);
      alert(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDownloading(false);
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
      const selectedPhotoObjects = photos.filter((p) =>
        selectedPhotos.has(p.fileName)
      );

      const photoKeys = selectedPhotoObjects.map((p) => p.fullKey);
      await photoService.deletePhotos(eventId, photoKeys);
      await loadPhotosFromStorage();
    } catch (error) {
      console.error("❌ Error deleting photos:", error);
      alert(
        `Failed to delete photos: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
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
