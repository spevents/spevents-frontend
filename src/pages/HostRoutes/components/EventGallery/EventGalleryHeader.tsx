// File: src/pages/HostRoutes/components/EventGallery/EventGalleryHeader.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Download,
  ArrowLeft,
  QrCode,
  Calendar,
  Users,
  ImageIcon,
  Grid3X3,
  Grid2X2,
  GalleryHorizontal,
  Play,
  Pause,
  Check,
  Sparkles,
} from "lucide-react";
import type { DisplayPhoto } from "../../types";
import { useEvent } from "@/contexts/EventContext";
import { CaptionGenerator } from "@/components/CaptionGenerator";
import { useState } from "react";

interface EventGalleryHeaderProps {
  eventId: string;
  status: "draft" | "active" | "paused" | "ended";
  currentEvent: any;
  photos: DisplayPhoto[];
  gridSize: "large" | "small";
  setGridSize: (size: "large" | "small") => void;
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  setSelectedPhotos: (photos: Set<string>) => void;
  handleDownloadAll: () => Promise<void>;
  isDownloading: boolean;
  loadPhotosFromStorage: () => Promise<void>;
}

export function EventGalleryHeader({
  eventId,
  status,
  currentEvent,
  photos,
  gridSize,
  setGridSize,
  isSelectionMode,
  setIsSelectionMode,
  setSelectedPhotos,
  handleDownloadAll,
  isDownloading,
  loadPhotosFromStorage,
}: EventGalleryHeaderProps) {
  const navigate = useNavigate();
  const { startEvent, endEvent } = useEvent();
  const guestPhotos = photos.filter((p) => p.isGuestPhoto).length;
  const [showCaptionGenerator, setShowCaptionGenerator] = useState(false);

  return (
    <>
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
              {/* Status Control Button */}
              {status === "draft" && (
                <button
                  onClick={() => startEvent(eventId)}
                  className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                  title="Start Event"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              {status === "active" && (
                <button
                  onClick={() => endEvent(eventId)}
                  className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                  title="End Event"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
              {status === "ended" && (
                <div className="p-2 rounded-md opacity-70 text-sp_darkgreen transition-colors">
                  <Check className="w-4 h-4 " />
                </div>
              )}

              <button
                onClick={() => navigate(`/host/event/${eventId}/qr`)}
                className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* AI Caption Button */}
              {photos.length > 0 && (
                <button
                  onClick={() => setShowCaptionGenerator(!showCaptionGenerator)}
                  className="p-2 rounded-md hover:bg-purple-100 text-purple-600 transition-colors"
                  title="AI Captions"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              {photos.length > 0 && (
                <>
                  <button
                    onClick={() => navigate(`/host/event/${eventId}/slideshow`)}
                    className="p-2 rounded-md hover:bg-sp_lightgreen/30 text-sp_darkgreen transition-colors"
                    title="View Slideshow"
                  >
                    <GalleryHorizontal className="w-4 h-4" />
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

        {/* AI Caption Generator Panel */}
        {showCaptionGenerator && (
          <div className="px-4 pb-4">
            <CaptionGenerator
              eventId={eventId}
              onComplete={() => loadPhotosFromStorage()}
            />
          </div>
        )}
      </motion.div>
    </>
  );
}
