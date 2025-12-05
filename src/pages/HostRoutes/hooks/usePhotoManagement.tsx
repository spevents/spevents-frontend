// File: src/pages/HostRoutes/hooks/usePhotoManagement.tsx

import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { auth } from "@/components/config/firebase";
import {
  listAllEventPhotos,
  photoService,
  type EventPhoto,
} from "@/services/api";
import type { DisplayPhoto } from "../types";

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

      const displayPhotos: DisplayPhoto[] = eventPhotos.map((photo) => ({
        url: photo.url, // direct Vercel Blob URL
        fileName: photo.fileName,
        created_at: photo.uploadedAt || new Date().toISOString(),
        fullKey: (photo as any).fullKey, // optional from older API
        isGuestPhoto: photo.isGuestPhoto,
        guestId: photo.guestId,
      }));

      const sortedPhotos = displayPhotos.sort(
        (a: DisplayPhoto, b: DisplayPhoto) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      if (!isInitialLoad.current) {
        const currentPhotoIds = new Set(sortedPhotos.map((p) => p.fileName));
        const newIds = new Set<string>();
        currentPhotoIds.forEach((id) => {
          if (!existingPhotoIds.current.has(id)) newIds.add(id);
        });
        setNewPhotoIds(newIds);
        if (newIds.size > 0) {
          setTimeout(() => setNewPhotoIds(new Set()), 1000);
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

  /**
   * Prefer direct Vercel Blob URL when available; fallback to proxy for legacy/private cases.
   */

  const downloadFromVercelUrl = async (photo: DisplayPhoto): Promise<Blob> => {
    if (!photo.url) throw new Error("Missing photo.url");

    const url = photo.url.includes("?")
      ? `${photo.url}&download=1`
      : `${photo.url}?download=1`;

    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    });

    if (!res.ok) {
      throw new Error(`Vercel Blob GET failed: ${res.status}`);
    }
    const blob = await res.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Vercel Blob returned empty blob");
    }
    return blob;
  };

  // Keep the proxy available as a fallback (your backend can decide where to fetch from).
  const downloadViaProxy = async (photo: DisplayPhoto): Promise<Blob> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();
    const apiUrl = import.meta.env.VITE_API_URL || "https://api.spevents.live";

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
      throw new Error(
        `Proxy download failed: ${response.status} - ${errorText}`,
      );
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Proxy returned empty blob");
    }
    return blob;
  };

  const getPhotoBlob = async (photo: DisplayPhoto): Promise<Blob> => {
    try {
      return await downloadFromVercelUrl(photo);
    } catch (e) {
      console.warn(
        `Vercel Blob fetch failed for ${photo.fileName}, trying proxy…`,
        e,
      );
      return await downloadViaProxy(photo);
    }
  };

  const deriveDownloadName = (photo: DisplayPhoto): string => {
    const hasExt = /\.[a-z0-9]+$/i.test(photo.fileName || "");
    if (photo.fileName && hasExt) return photo.fileName;

    try {
      const u = new URL(photo.url);
      const base = u.pathname.split("/").pop() || photo.fileName || "photo";
      if (/\.[a-z0-9]+$/i.test(base)) return base;
      return `${base}.jpg`;
    } catch {
      return photo.fileName && hasExt
        ? photo.fileName
        : `${photo.fileName || "photo"}.jpg`;
    }
  };

  const zipAndSave = async (
    entries: Array<{ name: string; blob: Blob }>,
    zipName: string,
  ) => {
    const zip = new JSZip();
    entries.forEach(({ name, blob }) => zip.file(name, blob));
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
  };

  const safeZipName = (suffix: string) =>
    `${(currentEvent?.name || "event")
      .toString()
      .replace(/[^\w\-]+/g, "_")}-${suffix}-${
      new Date().toISOString().split("T")[0]
    }.zip`;

  const handleDownloadAll = async () => {
    if (photos.length === 0) return;

    setIsDownloading(true);
    try {
      const results = await Promise.allSettled(
        photos.map(async (photo) => {
          const blob = await getPhotoBlob(photo);
          const name = deriveDownloadName(photo);
          return { name, blob };
        }),
      );

      const successes = results
        .filter(
          (r): r is PromiseFulfilledResult<{ name: string; blob: Blob }> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value);

      const failures = results.filter((r) => r.status === "rejected");

      if (successes.length === 0) {
        throw new Error("No photos could be downloaded");
      }

      await zipAndSave(successes, safeZipName("all-photos"));

      if (failures.length > 0) {
        alert(
          `Download completed with ${successes.length} photos. ${failures.length} photos failed to download.`,
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

  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDownloading(true);
    try {
      const selected = photos.filter((p) => selectedPhotos.has(p.fileName));

      const results = await Promise.allSettled(
        selected.map(async (photo) => {
          const blob = await getPhotoBlob(photo);
          const name = deriveDownloadName(photo);
          return { name, blob };
        }),
      );

      const successes = results
        .filter(
          (r): r is PromiseFulfilledResult<{ name: string; blob: Blob }> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value);

      const failures = results.filter((r) => r.status === "rejected");

      if (successes.length === 0) {
        throw new Error("No photos could be downloaded");
      }

      await zipAndSave(successes, safeZipName("photos"));

      if (failures.length > 0) {
        alert(
          `Download completed with ${successes.length} photos. ${failures.length} photos failed to download.`,
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

  const handleDownloadSinglePhoto = async (photo: DisplayPhoto) => {
    try {
      const blob = await getPhotoBlob(photo);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = deriveDownloadName(photo);
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
        } catch (error: any) {
          if (error?.name !== "AbortError") {
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
        selectedPhotos.has(p.fileName),
      );
      const photoKeys = selectedPhotoObjects.map(
        (p) => p.fullKey || p.fileName,
      );
      await photoService.deletePhotos(eventId, photoKeys);
      await loadPhotosFromStorage();
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
