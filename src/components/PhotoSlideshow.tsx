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
import { listAllEventPhotos, EventPhoto } from "@/services/api";
import { useEvent } from "@/contexts/EventContext";
import { colors } from "@/types/eventTypes";
import FunSlideshow from "./slideshow_modes/FunSlideshow";
import PresenterSlideshow from "./slideshow_modes/PresenterSlideshow";
import MarqueeSlideshow from "./slideshow_modes/MarqueeSlideshow";
import SimpleSlideshow from "./slideshow_modes/SimpleSlideshow";
import SimpleParallaxSlideshow from "./slideshow_modes/SimpleParallaxSlideshow";
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
const PHOTO_REFRESH_INTERVAL = 10000;

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

  const themeColors = currentEvent?.colors || {
    primary: colors.green,
    secondary: colors.lightGreen,
  };

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
        console.log("🔗 Using Vercel Blob URL:", eventPhoto.url);

        return {
          src: eventPhoto.url,
          id: eventPhoto.fileName,
          createdAt: getTimestampFromFilename(eventPhoto.fileName),
          transitionId: `${eventPhoto.fileName}-${Date.now()}`,
          expiryTime: Date.now() + PHOTO_DISPLAY_TIME,
          depthMap: (eventPhoto as any).depthMap, // Include depth map if available
        };
      });

      console.log("✅ Slideshow photos loaded:", loadedPhotos.length);
      const withDepth = loadedPhotos.filter((p) => p.depthMap).length;
      console.log(`🎨 ${withDepth} photos have depth maps`);

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
      case "model": {
        // Use full parallax if we have depth maps, otherwise use simple version
        const hasDepthMaps = photos.some((p) => p.depthMap);
        const photosForParallax = convertPhotosForDisplay(photos);

        return hasDepthMaps ? (
          <ParallaxSlideshow
            photos={photosForParallax}
            hideUI={hideUI}
            eventId={eventId!} // ⭐ Pass eventId
            onPhotosRefresh={() => {
              console.log("🔄 Depth maps generated, refreshing photos...");
              loadPhotos(); // ⭐ Refresh photos after depth map generation
            }}
          />
        ) : (
          <SimpleParallaxSlideshow photos={photosForParallax} hideUI={hideUI} />
        );
      }
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
