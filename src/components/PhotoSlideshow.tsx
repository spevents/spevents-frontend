// File: src/components/PhotoSlideshow.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeOff,
  ArrowLeft,
  Layout,
  LayoutTemplate,
  Presentation,
  Hotel,
  AlignHorizontalSpaceAround,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listAllEventPhotos } from "@/services/api";
import { useEvent } from "@/contexts/EventContext";
import { colors } from "@/types/eventTypes";
import { usePhotoUpdates } from "@/hooks/usePhotoUpdates";
import { HuntLeaderboard } from "./slideshow_modes/HuntLeaderboard";
import FunSlideshow from "./slideshow_modes/FunSlideshow";
import PresenterSlideshow from "./slideshow_modes/PresenterSlideshow";
import MarqueeSlideshow from "./slideshow_modes/MarqueeSlideshow";
import SimpleSlideshow from "./slideshow_modes/SimpleSlideshow";
import ParallaxSlideshow from "./slideshow_modes/ParallaxSlideshow";

interface Photo {
  src: string;
  id: string;
  createdAt: number;
  transitionId: string;
  expiryTime: number;
  depthMap?: string;
}

interface PhotoWithStringDate {
  src: string;
  id: string;
  createdAt: string;
  depthMap?: string;
}

interface PhotoSlideshowProps {
  eventId?: string;
}

type ViewMode = "simple" | "fun" | "presenter" | "model" | "marquee";

const MAX_PHOTOS = 16;
const PHOTO_DISPLAY_TIME = 8000 + Math.random() * 2000;

export default function PhotoSlideshow({ eventId }: PhotoSlideshowProps) {
  const navigate = useNavigate();
  const { currentEvent } = useEvent();
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [hideUI, setHideUI] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const photosRef = useRef(photos);

  const themeColors = currentEvent?.colors || {
    primary: colors.green,
    secondary: colors.lightGreen,
  };

  // Fetch photos function for the hook
  const fetchPhotos = useCallback(async () => {
    if (!eventId) return [];
    return listAllEventPhotos(eventId);
  }, [eventId]);

  // Use adaptive polling hook (3s when active, 15s when idle)
  const {
    photos: eventPhotos,
    isLoading,
    refresh: loadPhotos,
  } = usePhotoUpdates({
    eventId,
    fetchPhotos,
    enabled: !!eventId,
    initialInterval: 3000, // Start polling every 3s
    maxInterval: 10000, // Slow down to 10s when idle
  });

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const convertPhotosForDisplay = (photos: Photo[]): PhotoWithStringDate[] => {
    return photos.map((photo) => ({
      src: photo.src,
      id: photo.id,
      createdAt: new Date(photo.createdAt).toISOString(),
      depthMap: photo.depthMap,
    }));
  };

  useEffect(() => {
    const updateDimensions = () => {
      setContainerDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewMode("simple");
      } else if (hideUI) {
        setHideUI(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [hideUI]);

  const getTimestampFromFilename = (fileName: string): number => {
    const match = fileName.match(/(\d+)-/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return Date.now();
  };

  // Convert eventPhotos from hook to Photo format when they change
  useEffect(() => {
    if (eventPhotos.length === 0) {
      setPhotos([]);
      return;
    }

    const loadedPhotos: Photo[] = eventPhotos.map((eventPhoto) => ({
      src: eventPhoto.url,
      id: eventPhoto.fileName,
      createdAt: getTimestampFromFilename(eventPhoto.fileName),
      transitionId: `${eventPhoto.fileName}-${Date.now()}`,
      expiryTime: Date.now() + PHOTO_DISPLAY_TIME,
      depthMap: (eventPhoto as any).depthMap,
    }));

    setPhotos(loadedPhotos);
  }, [eventPhotos]);

  const addNewPhoto = () => {
    if (photosRef.current.length === 0) {
      console.log("🚫 No photos available to display");
      return;
    }

    setDisplayedPhotos((current) => {
      const now = Date.now();

      if (current.length >= MAX_PHOTOS) {
        const oldestPhoto = current.reduce(
          (oldest, photo) =>
            photo.expiryTime < oldest.expiryTime ? photo : oldest,
          current[0],
        );

        const availablePhotos = photosRef.current.filter(
          (photo) => !current.some((p) => p.id === photo.id),
        );

        const photoPool =
          availablePhotos.length > 0 ? availablePhotos : photosRef.current;
        const randomPhoto =
          photoPool[Math.floor(Math.random() * photoPool.length)];

        const newPhoto = {
          ...randomPhoto,
          transitionId: `${randomPhoto.id}-${now}`,
          expiryTime: now + PHOTO_DISPLAY_TIME,
        };

        const removalJitter = Math.random() * 1000;
        timeoutsRef.current[newPhoto.transitionId] = setTimeout(() => {
          addNewPhoto();
        }, PHOTO_DISPLAY_TIME + removalJitter);

        return current.map((photo) =>
          photo.transitionId === oldestPhoto.transitionId ? newPhoto : photo,
        );
      } else {
        const availablePhotos = photosRef.current.filter(
          (photo) => !current.some((p) => p.id === photo.id),
        );

        if (availablePhotos.length === 0) {
          return current;
        }

        const randomPhoto =
          availablePhotos[Math.floor(Math.random() * availablePhotos.length)];

        const newPhoto = {
          ...randomPhoto,
          transitionId: `${randomPhoto.id}-${now}`,
          expiryTime: now + PHOTO_DISPLAY_TIME,
        };

        const removalJitter = Math.random() * 1000;
        timeoutsRef.current[newPhoto.transitionId] = setTimeout(() => {
          addNewPhoto();
        }, PHOTO_DISPLAY_TIME + removalJitter);

        return [...current, newPhoto];
      }
    });
  };

  // usePhotoUpdates hook handles all polling - removed manual interval

  useEffect(() => {
    if (photos.length > 0 && displayedPhotos.length === 0 && !isLoading) {
      console.log("🚀 Starting photo display with", photos.length, "photos");
      setTimeout(() => {
        addNewPhoto();
      }, 1000);
    }
  }, [photos.length, displayedPhotos.length, isLoading]);

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const renderViewMode = () => {
    const allPhotosForDisplay = convertPhotosForDisplay(photos);
    const displayedPhotosForDisplay = convertPhotosForDisplay(displayedPhotos);

    switch (viewMode) {
      case "fun":
        return (
          <FunSlideshow
            photos={displayedPhotosForDisplay}
            containerDimensions={containerDimensions}
            themeColors={themeColors}
          />
        );
      case "presenter":
        return (
          <PresenterSlideshow
            photos={allPhotosForDisplay}
            containerDimensions={containerDimensions}
            themeColors={themeColors}
          />
        );
      case "model":
        // ✅ FIXED: Always show ParallaxSlideshow with generator button
        return (
          <ParallaxSlideshow
            photos={allPhotosForDisplay}
            hideUI={hideUI}
            eventId={eventId!}
            onPhotosRefresh={() => {
              console.log("🔄 Depth maps generated, refreshing photos...");
              loadPhotos();
            }}
          />
        );
      case "marquee":
        return (
          <MarqueeSlideshow
            photos={allPhotosForDisplay}
            containerDimensions={containerDimensions}
            themeColors={themeColors}
          />
        );
      case "simple":
        return (
          <SimpleSlideshow
            photos={convertPhotosForDisplay(displayedPhotos)}
            containerDimensions={containerDimensions}
            themeColors={themeColors}
            hideUI={hideUI}
          />
        );
      default:
        return (
          <SimpleSlideshow
            photos={convertPhotosForDisplay(displayedPhotos)}
            containerDimensions={containerDimensions}
            themeColors={themeColors}
            hideUI={hideUI}
          />
        );
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {renderViewMode()}

      {/* Scavenger Hunt Leaderboard */}
      {currentEvent?.scavengerHunt?.enabled &&
        currentEvent.scavengerHunt.settings.showLeaderboard && (
          <HuntLeaderboard
            photos={eventPhotos}
            tasks={currentEvent.scavengerHunt.tasks}
            themeColors={themeColors}
          />
        )}

      <AnimatePresence>
        {!hideUI && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
                <button
                  onClick={() => setViewMode("simple")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "simple"
                      ? "text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "simple"
                        ? themeColors.secondary
                        : "transparent",
                  }}
                >
                  <Layout size={16} />
                </button>
                <button
                  onClick={() => setViewMode("fun")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "fun"
                      ? "text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "fun"
                        ? themeColors.secondary
                        : "transparent",
                  }}
                >
                  <LayoutTemplate size={16} />
                </button>
                <button
                  onClick={() => setViewMode("presenter")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "presenter"
                      ? "text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "presenter"
                        ? themeColors.secondary
                        : "transparent",
                  }}
                >
                  <Presentation size={16} />
                </button>
                <button
                  onClick={() => setViewMode("marquee")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "marquee"
                      ? "text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "marquee"
                        ? themeColors.secondary
                        : "transparent",
                  }}
                >
                  <AlignHorizontalSpaceAround size={16} />
                </button>
                <button
                  onClick={() => setViewMode("model")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "model"
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <Hotel size={16} />
                </button>
              </div>

              <button
                onClick={() => setHideUI(true)}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <EyeOff size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {hideUI && (
        <button
          onClick={() => setHideUI(false)}
          className="absolute inset-0 w-full h-full bg-transparent"
        />
      )}
    </div>
  );
}
