// src/components/slideshow_modes/BuilderFunSlideshow.tsx
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Layout,
  LayoutTemplate,
  Presentation,
  AlignHorizontalSpaceAround,
} from "lucide-react";

interface FunPhoto {
  src: string;
  id: string;
  createdAt: string;
  size: {
    width: number;
    height: number;
    aspect: "square" | "portrait" | "landscape";
  };
  position: {
    x: number;
    y: number;
    rotation: number;
  };
  expiryTime: number;
  transitionId: string;
}

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  containerDimensions: { width: number; height: number };
  themeColors: { primary: string; secondary: string };
  selectedMode: string;
  onModeChange: (mode: string) => void;
  hideUI?: boolean;
}

const PHOTO_DISPLAY_TIME = 4000;
const MAX_PHOTOS = 8; // Reduced for builder view
const slideshowModes = [
  { id: "simple", name: "Classic", icon: Layout },
  { id: "fun", name: "Dynamic", icon: LayoutTemplate },
  { id: "presenter", name: "Presenter", icon: Presentation },
  { id: "marquee", name: "Marquee", icon: AlignHorizontalSpaceAround },
];

function getRandomAspectRatio(): "square" | "portrait" | "landscape" {
  const ratios = ["square", "portrait", "landscape"];
  return ratios[Math.floor(Math.random() * ratios.length)] as
    | "square"
    | "portrait"
    | "landscape";
}

function getPhotoSize(
  windowWidth: number,
  windowHeight: number,
  aspect: "square" | "portrait" | "landscape",
): {
  width: number;
  height: number;
  aspect: "square" | "portrait" | "landscape";
} {
  const baseSize = Math.min(windowWidth, windowHeight) * 0.15; // Smaller for builder
  const sizeVariation = baseSize * 0.2;
  const baseWidth =
    baseSize + (Math.random() * sizeVariation - sizeVariation / 2);

  switch (aspect) {
    case "portrait":
      return { width: baseWidth, height: baseWidth * 1.3, aspect: "portrait" };
    case "landscape":
      return { width: baseWidth * 1.3, height: baseWidth, aspect: "landscape" };
    case "square":
    default:
      return { width: baseWidth, height: baseWidth, aspect: "square" };
  }
}

function getRandomPosition(
  containerWidth: number,
  containerHeight: number,
  photoSize: { width: number; height: number },
  existingPhotos: FunPhoto[],
) {
  const margin = 40; // Reduced margin for builder
  const maxAttempts = 50;
  let attempts = 0;

  const gridRows = 4;
  const gridCols = 6;
  const cellWidth = (containerWidth - margin * 2) / gridCols;
  const cellHeight = (containerHeight - margin * 2) / gridRows;

  while (attempts < maxAttempts) {
    const gridRow = Math.floor(Math.random() * gridRows);
    const gridCol = Math.floor(Math.random() * gridCols);

    const baseX = margin + gridCol * cellWidth;
    const baseY = margin + gridRow * cellHeight;

    const offsetX = Math.random() * (cellWidth - photoSize.width);
    const offsetY = Math.random() * (cellHeight - photoSize.height);

    const x = baseX + offsetX;
    const y = baseY + offsetY;
    const rotation = Math.random() * 12 - 6; // Reduced rotation

    const minDistance = Math.max(photoSize.width, photoSize.height) * 0.3;
    const hasOverlap = existingPhotos.some((existing) => {
      const distance = Math.sqrt(
        Math.pow(existing.position.x - x, 2) +
          Math.pow(existing.position.y - y, 2),
      );
      return distance < minDistance;
    });

    if (!hasOverlap || attempts === maxAttempts - 1) {
      return { x, y, rotation };
    }
    attempts++;
  }

  const gridRow = Math.floor(existingPhotos.length / gridCols) % gridRows;
  const gridCol = existingPhotos.length % gridCols;
  return {
    x: margin + gridCol * cellWidth + (Math.random() * 20 - 10),
    y: margin + gridRow * cellHeight + (Math.random() * 20 - 10),
    rotation: Math.random() * 12 - 6,
  };
}

function processFunPhoto(
  photo: { src: string; id: string; createdAt: string },
  containerDimensions: { width: number; height: number },
  existingPhotos: FunPhoto[],
  now: number,
): FunPhoto {
  const aspect = getRandomAspectRatio();
  const size = getPhotoSize(
    containerDimensions.width,
    containerDimensions.height,
    aspect,
  );
  const position = getRandomPosition(
    containerDimensions.width,
    containerDimensions.height,
    size,
    existingPhotos,
  );

  return {
    ...photo,
    size,
    position,
    expiryTime: now + PHOTO_DISPLAY_TIME,
    transitionId: `${photo.id}-${now}`,
  };
}

export default function BuilderFunSlideshow({
  photos,
  containerDimensions,
  themeColors,
  selectedMode,
  onModeChange,
  hideUI = false,
}: Props) {
  const [displayedPhotos, setDisplayedPhotos] = useState<FunPhoto[]>([]);
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const photosRef = useRef(photos);
  const dimensionsRef = useRef(containerDimensions);

  useEffect(() => {
    photosRef.current = photos;
    dimensionsRef.current = containerDimensions;
  }, [photos, containerDimensions]);

  const addNewPhoto = () => {
    setDisplayedPhotos((current) => {
      if (current.length >= MAX_PHOTOS) return current;

      const availablePhotos = photosRef.current.filter(
        (photo) => !current.find((p) => p.id === photo.id),
      );

      if (availablePhotos.length === 0) return current;

      const now = Date.now();
      const randomPhoto =
        availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
      const newPhoto = processFunPhoto(
        randomPhoto,
        dimensionsRef.current,
        current,
        now,
      );

      const removalJitter = Math.random() * 500;
      timeoutsRef.current[newPhoto.transitionId] = setTimeout(() => {
        setDisplayedPhotos((photos) =>
          photos.filter((p) => p.transitionId !== newPhoto.transitionId),
        );
        delete timeoutsRef.current[newPhoto.transitionId];
        setTimeout(addNewPhoto, Math.random() * 1000);
      }, PHOTO_DISPLAY_TIME + removalJitter);

      return [...current, newPhoto];
    });
  };

  useEffect(() => {
    Object.values(timeoutsRef.current).forEach((timeout) =>
      clearTimeout(timeout),
    );
    timeoutsRef.current = {};
    setDisplayedPhotos([]);

    if (photosRef.current.length > 0) {
      const initialCount = Math.min(MAX_PHOTOS, photosRef.current.length);
      for (let i = 0; i < initialCount; i++) {
        setTimeout(() => addNewPhoto(), i * 800);
      }
    }

    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
    };
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}20)`,
        }}
      >
        <p className="text-gray-400 text-lg">No photos available</p>

        {!hideUI && (
          <div className="absolute top-4 right-4">
            <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-lg p-1">
              {slideshowModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`p-2 rounded-md transition-colors ${
                      selectedMode === mode.id
                        ? "bg-white text-black"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    title={mode.name}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}20)`,
      }}
    >
      <AnimatePresence>
        {displayedPhotos.map((photo) => (
          <motion.div
            key={photo.transitionId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              scale: { type: "spring", visualDuration: 0.4, bounce: 0.2 },
            }}
            style={{
              position: "absolute",
              left: photo.position.x,
              top: photo.position.y,
              width: photo.size.width,
              height: photo.size.height,
              transform: `rotate(${photo.position.rotation}deg)`,
            }}
          >
            <div
              className="w-full h-full p-1 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden"
              style={{
                backgroundColor: themeColors.secondary + "90",
                border: `2px solid ${themeColors.primary}40`,
              }}
            >
              <img
                src={photo.src}
                alt="Event photo"
                className="w-full h-full object-cover rounded"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!hideUI && (
        <div className="absolute top-4 right-4">
          <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-lg p-1">
            {slideshowModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  className={`p-2 rounded-md transition-colors ${
                    selectedMode === mode.id
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  title={mode.name}
                >
                  <IconComponent size={16} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: themeColors.primary + "80",
          color: "white",
        }}
      >
        Dynamic Mode
      </div>
    </div>
  );
}
