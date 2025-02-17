import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

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
}

const PHOTO_DISPLAY_TIME = 7000 + Math.random() * 2000; // Between 10-15 seconds
const TRANSITION_DURATION = 3000; // 2 seconds for fade
const MAX_PHOTOS = 20;

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
  const baseSize = Math.min(windowWidth, windowHeight) * 0.25;
  const sizeVariation = baseSize * 0.2;
  const baseWidth =
    baseSize + (Math.random() * sizeVariation - sizeVariation / 2);

  switch (aspect) {
    case "portrait":
      return {
        width: baseWidth,
        height: baseWidth * 1.5,
        aspect: "portrait",
      };
    case "landscape":
      return {
        width: baseWidth * 1.5,
        height: baseWidth,
        aspect: "landscape",
      };
    case "square":
    default:
      return {
        width: baseWidth,
        height: baseWidth,
        aspect: "square",
      };
  }
}

function getRandomPosition(
  containerWidth: number,
  containerHeight: number,
  photoSize: { width: number; height: number },
  existingPhotos: FunPhoto[],
) {
  const margin = 90;
  const maxAttempts = 100;
  let attempts = 0;

  // Define grid sections to encourage better spread
  const gridRows = 8;
  const gridCols = 8;
  const cellWidth = (containerWidth - margin * 2) / gridCols;
  const cellHeight = (containerHeight - margin * 2) / gridRows;

  while (attempts < maxAttempts) {
    // Choose a random grid cell
    const gridRow = Math.floor(Math.random() * gridRows);
    const gridCol = Math.floor(Math.random() * gridCols);

    // Calculate base position within the cell
    const baseX = margin + gridCol * cellWidth;
    const baseY = margin + gridRow * cellHeight;

    // Add some random offset within the cell
    const offsetX = Math.random() * (cellWidth - photoSize.width);
    const offsetY = Math.random() * (cellHeight - photoSize.height);

    const x = baseX + offsetX;
    const y = baseY + offsetY;
    const rotation = Math.random() * 16 - 8; // -8 to +8 degrees

    // Check for overlap with larger minimum distance
    const minDistance = Math.max(photoSize.width, photoSize.height) * 0.6;
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

  // Fallback position using grid system
  const gridRow = Math.floor(existingPhotos.length / gridCols) % gridRows;
  const gridCol = existingPhotos.length % gridCols;
  return {
    x: margin + gridCol * cellWidth + (Math.random() * 100 - 50),
    y: margin + gridRow * cellHeight + (Math.random() * 100 - 50),
    rotation: Math.random() * 16 - 8,
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

export default function FunSlideshow({ photos, containerDimensions }: Props) {
  const [displayedPhotos, setDisplayedPhotos] = useState<FunPhoto[]>([]);
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const photosRef = useRef(photos);
  const dimensionsRef = useRef(containerDimensions);

  // Update refs when props change
  useEffect(() => {
    photosRef.current = photos;
    dimensionsRef.current = containerDimensions;
  }, [photos, containerDimensions]);

  // Set up the main display cycle
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

      // Schedule removal of this photo
      const removalJitter = Math.random() * 1000; // Up to 1 second extra random delay

      timeoutsRef.current[newPhoto.transitionId] = setTimeout(() => {
        setDisplayedPhotos((photos) =>
          photos.filter((p) => p.transitionId !== newPhoto.transitionId),
        );
        delete timeoutsRef.current[newPhoto.transitionId];
        // Add a new photo with a slight delay to desynchronize
        setTimeout(addNewPhoto, Math.random() * 2000); // Up to 2 seconds random delay
      }, PHOTO_DISPLAY_TIME + removalJitter);

      return [...current, newPhoto];
    });
  };

  useEffect(() => {
    // Clear any existing timeouts
    Object.values(timeoutsRef.current).forEach((timeout) =>
      clearTimeout(timeout),
    );
    timeoutsRef.current = {};

    // Add initial photos
    const initialCount = Math.min(MAX_PHOTOS, photosRef.current.length);
    for (let i = 0; i < initialCount; i++) {
      setTimeout(() => addNewPhoto(), i * (TRANSITION_DURATION / 2));
    }

    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
    };
  }, []);
  return (
    <div className="relative w-full h-screen">
      <AnimatePresence>
        {displayedPhotos.map((photo) => (
          <motion.div
            key={photo.transitionId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }} // Exit animation
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
            <div className="w-full h-full p-2 bg-white/90 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden">
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
    </div>
  );
}
