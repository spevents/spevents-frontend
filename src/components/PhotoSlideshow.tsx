// File: src/components/PhotoSlideshow.tsx
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
import {
  listAllEventPhotos,
  getEventPhotoUrl,
  EventPhoto,
} from "@/services/api";
import { useEvent } from "@/contexts/EventContext";
import { colors } from "@/types/eventTypes";
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
const PHOTO_DISPLAY_TIME = 8000 + Math.random() * 2000;
const PHOTO_REFRESH_INTERVAL = 10000; // Reduced frequency to 10 seconds

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
  const [isLoading, setIsLoading] = useState(true);
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const photosRef = useRef(photos);

  // Get theme colors from current event, with fallback to default
  const themeColors = currentEvent?.colors || {
    primary: colors.green,
    secondary: colors.lightGreen,
  };

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
    return Date.now(); // Return current time as fallback
  };

  const loadPhotos = async () => {
    if (!eventId) {
      console.log("❌ No eventId provided to slideshow");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🎬 Slideshow loading photos for eventId:", eventId);

      const eventPhotos: EventPhoto[] = await listAllEventPhotos(eventId);
      console.log("📸 Slideshow found photos:", eventPhotos.length);

      if (eventPhotos.length === 0) {
        console.log("📭 No photos found, setting empty array");
        setPhotos([]);
        setIsLoading(false);
        return;
      }

      const loadedPhotos: Photo[] = eventPhotos.map((eventPhoto) => {
        const photoUrl = getEventPhotoUrl(eventId, eventPhoto);
        console.log("🔗 Generated URL for", eventPhoto.fileName, ":", photoUrl);

        return {
          src: photoUrl,
          id: eventPhoto.fileName,
          createdAt: getTimestampFromFilename(eventPhoto.fileName),
          transitionId: `${eventPhoto.fileName}-${Date.now()}`,
          expiryTime: Date.now() + PHOTO_DISPLAY_TIME,
        };
      });

      console.log("✅ Slideshow photos loaded:", loadedPhotos.length);
      setPhotos(loadedPhotos);
      setIsLoading(false);
    } catch (error) {
      console.error("💥 Error loading slideshow photos:", error);
      setPhotos([]);
      setIsLoading(false);
    }
  };

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

  // Load photos on mount and set up refresh interval
  useEffect(() => {
    if (eventId) {
      console.log("🎬 Starting slideshow for eventId:", eventId);
      loadPhotos();
      const refreshInterval = setInterval(() => {
        console.log("🔄 Refreshing slideshow photos");
        loadPhotos();
      }, PHOTO_REFRESH_INTERVAL);
      return () => clearInterval(refreshInterval);
    } else {
      console.log("❌ No eventId provided, cannot start slideshow");
      setIsLoading(false);
    }
  }, [eventId]);

  // Start slideshow when photos are loaded
  useEffect(() => {
    if (photos.length > 0 && displayedPhotos.length === 0 && !isLoading) {
      console.log("🚀 Starting photo display with", photos.length, "photos");
      setTimeout(() => {
        addNewPhoto();
      }, 1000);
    }
  }, [photos.length, displayedPhotos.length, isLoading]);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const renderViewMode = () => {
    // For modes that need all photos (marquee, presenter), use the full photos array
    // For simple/fun/model modes, use the rotating displayedPhotos
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
            photos={allPhotosForDisplay} // Use all photos
            containerDimensions={containerDimensions}
            themeColors={themeColors}
          />
        );
      case "model":
        return (
          <ModelSlideshow
            photos={displayedPhotosForDisplay}
            containerDimensions={containerDimensions}
          />
        );
      case "marquee":
        return (
          <MarqueeSlideshow
            photos={allPhotosForDisplay} // Use all photos, not displayedPhotos
            containerDimensions={containerDimensions}
            themeColors={themeColors}
          />
        );
      default:
        // Simple mode continues to use displayedPhotos
        return (
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}10)`,
            }}
          >
            {displayedPhotos.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-xl mb-2">No photos to display</p>
                  <p className="text-white/60">
                    Photos will appear here as guests upload them
                  </p>
                </div>
              </div>
            )}
            <AnimatePresence>
              {displayedPhotos.map((photo) => (
                <motion.div
                  key={photo.transitionId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={photo.src}
                    alt="Slideshow photo"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={{
                      border: `3px solid ${themeColors.secondary}60`,
                      boxShadow: `0 0 20px ${themeColors.primary}30`,
                    }}
                    onError={() => {
                      console.error(
                        "❌ Failed to load slideshow image:",
                        photo.src,
                      );
                    }}
                    onLoad={() => {
                      console.log("✅ Slideshow image loaded:", photo.id);
                    }}
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
      {renderViewMode()}

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
