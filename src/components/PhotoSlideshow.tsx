// src/components/PhotoSlideshow.tsx
import { useState, useEffect, useRef } from "react";
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
import { listAllEventPhotos, getEventPhotoUrl, EventPhoto } from "../lib/aws";
import FunSlideshow from "./slideshow_modes/FunSlideshow";
import PresenterSlideshow from "./slideshow_modes/PresenterSlideshow";
import ModelSlideshow from "./slideshow_modes/ModelSlideshow";
import MarqueeSlideshow from "./slideshow_modes/MarqueeSlideshow";

interface Photo {
  src: string;
  id: string;
  createdAt: number;
  transitionId: string;
  expiryTime: number;
}

interface PhotoWithStringDate {
  src: string;
  id: string;
  createdAt: string;
}

interface PhotoSlideshowProps {
  eventId?: string;
}

type ViewMode = "simple" | "fun" | "presenter" | "model" | "marquee";

const MAX_PHOTOS = 16;
const PHOTO_DISPLAY_TIME = 8000 + Math.random() * 2000; // 8-10 seconds
const TRANSITION_DURATION = 10000; // 3 seconds for fade
const PHOTO_REFRESH_INTERVAL = 2000 + Math.random() * 2000;

export default function PhotoSlideshow({ eventId }: PhotoSlideshowProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [hideUI, setHideUI] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const photosRef = useRef(photos);

  // Update refs when props change
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const convertPhotosForDisplay = (photos: Photo[]): PhotoWithStringDate[] => {
    return photos.map((photo) => ({
      ...photo,
      createdAt: new Date(photo.createdAt).toISOString(),
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
    const match = fileName.match(/photo-(\d+)\.jpg/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  };

  const loadPhotos = async () => {
    if (!eventId) return;

    try {
      const eventPhotos: EventPhoto[] = await listAllEventPhotos(eventId);
      const loadedPhotos: Photo[] = eventPhotos.map((eventPhoto) => ({
        src: getEventPhotoUrl(eventId, eventPhoto),
        id: eventPhoto.fileName,
        createdAt: getTimestampFromFilename(eventPhoto.fileName) || Date.now(),
        transitionId: `${eventPhoto.fileName}-${Date.now()}`,
        expiryTime: Date.now() + PHOTO_DISPLAY_TIME,
      }));

      setPhotos(loadedPhotos);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading photos:", error);
      setIsLoading(false);
    }
  };

  const addNewPhoto = () => {
    setDisplayedPhotos((current) => {
      // If we're at max photos, find the oldest one to replace
      const now = Date.now();

      if (current.length >= MAX_PHOTOS) {
        // Find the oldest photo based on expiryTime
        const oldestPhoto = current.reduce(
          (oldest, photo) =>
            photo.expiryTime < oldest.expiryTime ? photo : oldest,
          current[0],
        );

        // Get available photos (not currently displayed)
        const availablePhotos = photosRef.current.filter(
          (photo) => !current.some((p) => p.id === photo.id),
        );

        // If no new photos, reuse older ones
        const photoPool =
          availablePhotos.length > 0 ? availablePhotos : photosRef.current;
        const randomPhoto =
          photoPool[Math.floor(Math.random() * photoPool.length)];

        const newPhoto = {
          ...randomPhoto,
          transitionId: `${randomPhoto.id}-${now}`,
          expiryTime: now + PHOTO_DISPLAY_TIME,
        };

        // Schedule the next replacement
        const removalJitter = Math.random() * 1000;
        timeoutsRef.current[newPhoto.transitionId] = setTimeout(() => {
          addNewPhoto();
        }, PHOTO_DISPLAY_TIME + removalJitter);

        // Replace the oldest photo with the new one
        return current.map((photo) =>
          photo.transitionId === oldestPhoto.transitionId ? newPhoto : photo,
        );
      } else {
        // Add a new photo if we haven't reached the limit
        const availablePhotos = photosRef.current.filter(
          (photo) => !current.some((p) => p.id === photo.id),
        );

        if (availablePhotos.length === 0) {
          return current; // No new photos to add
        }

        const randomPhoto =
          availablePhotos[Math.floor(Math.random() * availablePhotos.length)];

        const newPhoto = {
          ...randomPhoto,
          transitionId: `${randomPhoto.id}-${now}`,
          expiryTime: now + PHOTO_DISPLAY_TIME,
        };

        // Schedule the next addition/replacement
        const removalJitter = Math.random() * 1000;
        timeoutsRef.current[newPhoto.transitionId] = setTimeout(() => {
          addNewPhoto();
        }, PHOTO_DISPLAY_TIME + removalJitter);

        return [...current, newPhoto];
      }
    });
  };

  // Load photos on mount and set up refresh interval
  useEffect(() => {
    if (eventId) {
      loadPhotos();
      const refreshInterval = setInterval(loadPhotos, PHOTO_REFRESH_INTERVAL);
      return () => clearInterval(refreshInterval);
    }
  }, [eventId]);

  // Start slideshow when photos are loaded
  useEffect(() => {
    if (photos.length > 0 && displayedPhotos.length === 0) {
      // Initial delay before starting slideshow
      setTimeout(() => {
        addNewPhoto();
      }, 1000);
    }
  }, [photos.length, displayedPhotos.length]);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const renderViewMode = () => {
    const photosForDisplay = convertPhotosForDisplay(displayedPhotos);

    switch (viewMode) {
      case "fun":
        return (
          <FunSlideshow
            photos={photosForDisplay}
            containerDimensions={containerDimensions}
          />
        );
      case "presenter":
        return (
          <PresenterSlideshow
            photos={photosForDisplay}
            containerDimensions={containerDimensions}
          />
        );
      case "model":
        return (
          <ModelSlideshow
            photos={photosForDisplay}
            containerDimensions={containerDimensions}
          />
        );
      case "marquee":
        return (
          <MarqueeSlideshow
            photos={photosForDisplay}
            containerDimensions={containerDimensions}
          />
        );
      default:
        return (
          <div className="relative w-full h-full overflow-hidden bg-gray-900">
            <AnimatePresence>
              {displayedPhotos.map((photo) => (
                <motion.div
                  key={photo.transitionId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{
                    duration: TRANSITION_DURATION / 1000,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={photo.src}
                    alt="Slideshow photo"
                    className="max-w-full max-h-full object-contain"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Main slideshow content */}
      {renderViewMode()}

      {/* UI Controls */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="flex items-center justify-between">
              {/* Back button */}
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              {/* View mode controls */}
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
                <button
                  onClick={() => setViewMode("simple")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "simple"
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <Layout size={16} />
                </button>
                <button
                  onClick={() => setViewMode("fun")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "fun"
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <LayoutTemplate size={16} />
                </button>
                <button
                  onClick={() => setViewMode("presenter")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "presenter"
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <Presentation size={16} />
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
                <button
                  onClick={() => setViewMode("marquee")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "marquee"
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <AlignHorizontalSpaceAround size={16} />
                </button>
              </div>

              {/* Hide UI button */}
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

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Click to show UI when hidden */}
      {hideUI && (
        <button
          onClick={() => setHideUI(false)}
          className="absolute inset-0 w-full h-full bg-transparent"
        />
      )}
    </div>
  );
}
