// File: src/pages/HostRoutes/EventGallery.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useEvent } from "@/contexts/EventContext";
import { usePhotoManagement } from "./hooks/usePhotoManagement";
import { EventGalleryHeader } from "./components/EventGallery/EventGalleryHeader";
import { SelectionActionsBar } from "./components/EventGallery/SelectionActionsBar";
import { PhotoGrid } from "./components/EventGallery/PhotoGrid";
import { PhotoLightbox } from "./components/EventGallery/PhotoLightbox";
import type { DisplayPhoto } from "./types";

export function EventGallery() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentEvent, selectEvent } = useEvent();

  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [gridSize, setGridSize] = useState<"large" | "small">("large");
  const [selectedPhoto, setSelectedPhoto] = useState<DisplayPhoto | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  const {
    photos,
    isLoading,
    isDeletingPhotos,
    isDownloading,
    loadPhotosFromStorage,
    handleDownloadAll,
    handleDownloadSelected,
    handleDownloadSinglePhoto,
    deleteSelectedPhotos,
    handleShareSelected,
    newPhotoIds,
    checkSelectedPhotosForNSFW,
    isCheckingNSFW,
  } = usePhotoManagement(eventId, currentEvent, selectedPhotos);

  // Force select the event from URL parameter immediately
  useEffect(() => {
    if (eventId) {
      console.log(`🎯 EventGallery: Forcing selection of eventId: ${eventId}`);
      selectEvent(eventId);
    }
  }, [eventId, selectEvent]);

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

  const handleDeleteSelected = async () => {
    await deleteSelectedPhotos();
    setSelectedPhotos(new Set());
    setIsSelectionMode(false);
  };

  const handleCheckNSFW = async () => {
    const nsfwPhotos = await checkSelectedPhotosForNSFW();
    if (nsfwPhotos.size > 0) {
      setSelectedPhotos(nsfwPhotos);
    }
  };

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  return (
    <div className="min-h-screen bg-sp_eggshell">
      <EventGalleryHeader
        eventId={eventId!}
        status={currentEvent?.status || "draft"}
        currentEvent={currentEvent}
        photos={photos}
        gridSize={gridSize}
        setGridSize={setGridSize}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        setSelectedPhotos={setSelectedPhotos}
        handleDownloadAll={handleDownloadAll}
        isDownloading={isDownloading}
        loadPhotosFromStorage={loadPhotosFromStorage}
      />

      <SelectionActionsBar
        isSelectionMode={isSelectionMode}
        selectedPhotos={selectedPhotos}
        photos={photos}
        handleSelectAll={handleSelectAll}
        handleShareSelected={handleShareSelected}
        handleDownloadSelected={handleDownloadSelected}
        handleDeleteSelected={handleDeleteSelected}
        handleCheckNSFW={handleCheckNSFW}
        isDownloading={isDownloading}
        isDeletingPhotos={isDeletingPhotos}
        isCheckingNSFW={isCheckingNSFW}
      />

      <div className="p-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <RefreshCw className="w-8 h-8 text-sp_darkgreen animate-spin" />
          </div>
        ) : (
          <PhotoGrid
            photos={photos}
            eventId={eventId}
            gridSize={gridSize}
            isSelectionMode={isSelectionMode}
            selectedPhotos={selectedPhotos}
            handlePhotoClick={handlePhotoClick}
            newPhotoIds={newPhotoIds}
          />
        )}
      </div>

      <PhotoLightbox
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
        photos={photos}
        currentPhotoIndex={currentPhotoIndex}
        navigateNext={navigateNext}
        navigatePrevious={navigatePrevious}
        handleDownloadSinglePhoto={handleDownloadSinglePhoto}
      />
    </div>
  );
}

export default EventGallery;
