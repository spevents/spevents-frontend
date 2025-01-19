// src/components/PhotoReview/PhotoReview.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { CheckCircle2, Trash2, Camera } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import {
  getPresignedUrl,
  storeUploadedPhoto,
  getTempPhotos,
  storeTempPhotos,
} from "../../lib/aws";
import { useNgrok } from "../../contexts/NgrokContext";

interface Photo {
  id: number;
  url: string;
}

const SWIPE_THRESHOLD_PERCENTAGE = 0.25;
const ACTIVATION_THRESHOLD_PERCENTAGE = 0.15;

const springConfig = {
  type: "spring" as const,
  stiffness: 250,
  damping: 25,
  mass: 0.8,
  restDelta: 0.001,
};

const bounceTransition = {
  type: "spring" as const,
  bounce: 0.2,
  duration: 0.6,
  restDelta: 0.001,
};

const dragTransitionConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 40,
  mass: 1,
  restDelta: 0.001,
};

// PhotoProgress Component
const PhotoProgress: React.FC<{ total: number; current: number }> = ({
  total,
  current,
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
      <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((current + 1) / total) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      <div className="text-white/70 text-sm font-medium">
        {current + 1} of {total}
      </div>
    </div>
  );
};

// Review Complete Component
const ReviewComplete: React.FC = () => {
    const { eventId } = useParams();
    const { baseUrl } = useNgrok();
    const navigate = useNavigate();
  
  
    const navigateWithBaseUrl = (path: string) => {
      const fullPath = `/${eventId}/guest${path}`;
      if (window.innerWidth <= 768 && baseUrl) {
        window.location.href = `${baseUrl}${fullPath}`;
      } else {
        navigate(fullPath);
      }
    };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springConfig}
        className="w-full max-w-xs space-y-6 text-center"
      >
        <h2 className="text-white text-xl font-medium">All photos reviewed!</h2>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateWithBaseUrl("/guest")}
            // onClick={() => navigate("/guest")}
            className="w-full px-6 py-3 bg-white text-gray-900 rounded-full font-medium 
              transition-colors hover:bg-white/90"
          >
            Guest Dashboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/camera")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 
              bg-white/10 text-white rounded-full font-medium 
              transition-colors hover:bg-white/20"
          >
            <Camera className="w-5 h-5" />
            <span>Take More</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function PhotoReview() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState<Set<number>>(
    new Set()
  );
  const [dragPosition, setDragPosition] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"up" | "down" | null>(
    null
  );

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [horizontalDrag, setHorizontalDrag] = useState(0);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);


  useEffect(() => {
    const updateScreenHeight = () => setScreenHeight(window.innerHeight);
    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    const tempPhotos = getTempPhotos();
    setPhotos(tempPhotos);

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, []);

  const handleStackNavigation = (direction: 1 | -1) => {
    setCurrentPhotoIndex((prev) => {
      const newIndex = prev + direction;
      return Math.max(0, Math.min(newIndex, photos.length - 1));
    });
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPhotoIndex < photos.length - 1 && !isDragging) {
        handleStackNavigation(1);
        setSwipeDirection("left");
      }
    },
    onSwipedRight: () => {
      if (currentPhotoIndex > 0 && !isDragging) {
        handleStackNavigation(-1);
        setSwipeDirection("right");
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const handleDragStart = (_: any, info: PanInfo) => {
    const horizontalMovement =
      Math.abs(info.offset.x) > Math.abs(info.offset.y);
    setIsHorizontalDragging(horizontalMovement);
    if (!horizontalMovement) {
      setIsDragging(true);
    }
  };

  const handleDragUpdate = (_: any, info: PanInfo) => {
    if (isHorizontalDragging) {
      setHorizontalDrag(info.offset.x);
    } else {
      setDragPosition(info.offset.y);
    }
  };

  const handlePhotoAction = async (photo: Photo, isUpward: boolean) => {
    const currentIndex = currentPhotoIndex;
    const totalPhotos = photos.length;

    if (isUpward) {
      setProcessingPhotos((prev) => new Set(prev).add(photo.id));
      setIsUploading(true);

      try {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setDragPosition(0);

        if (currentIndex === totalPhotos - 1 && currentIndex > 0) {
          setCurrentPhotoIndex(currentIndex - 1);
        }

        const response = await fetch(photo.url);
        const blob = await response.blob();
        const fileName = `photo-${Date.now()}.jpg`;

        // Get presigned URL for upload
        const presignedUrl = await getPresignedUrl({
          fileName,
          contentType: "image/jpeg",
        });

        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": "image/jpeg",
          },
        });

        if (!uploadResponse.ok) throw new Error("Upload failed");

        // Store the uploaded photo info in localStorage
        storeUploadedPhoto(fileName);

        // Update session storage for temporary photos
        const tempPhotos = getTempPhotos().filter(
          (p: Photo) => p.id !== photo.id
        );
        storeTempPhotos(tempPhotos);
      } catch (error) {
        console.error("Upload failed:", error);
        if (processingPhotos.has(photo.id)) {
          setPhotos((prev) => [...prev, photo]);
        }
      } finally {
        setProcessingPhotos((prev) => {
          const newSet = new Set(prev);
          newSet.delete(photo.id);
          return newSet;
        });
        setIsUploading(false);
        setExitDirection(null);
      }
    } else {
      // Handle delete action
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (currentIndex === totalPhotos - 1 && currentIndex > 0) {
        setCurrentPhotoIndex(currentIndex - 1);
      }

      // Update session storage for temporary photos
      const tempPhotos = getTempPhotos().filter(
        (p: Photo) => p.id !== photo.id
      );
      storeTempPhotos(tempPhotos);

      setDragPosition(0);
    }
  };

  const handleDragEnd = async (photoId: number, info: PanInfo) => {
    setIsDragging(false);
    setIsHorizontalDragging(false);
    setHorizontalDrag(0);

    if (isHorizontalDragging) {
      if (Math.abs(info.offset.x) > 100) {
        const isLeft = info.offset.x < 0;
        if (isLeft && currentPhotoIndex < photos.length - 1) {
          handleStackNavigation(1);
        } else if (!isLeft && currentPhotoIndex > 0) {
          handleStackNavigation(-1);
        }
      }
      return;
    }

    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    const swipeThreshold = screenHeight * SWIPE_THRESHOLD_PERCENTAGE;

    if (
      Math.abs(info.velocity.y) > 400 ||
      Math.abs(info.offset.y) > swipeThreshold
    ) {
      const isUpward = info.offset.y < 0;
      setExitDirection(isUpward ? "up" : "down");
      await handlePhotoAction(photo, isUpward);
    }

    setDragPosition(0);
  };

  if (photos.length === 0) {
    return <ReviewComplete />;
  }

  const dragPercentage = Math.abs(dragPosition / screenHeight);
  const isNearThreshold = dragPercentage >= ACTIVATION_THRESHOLD_PERCENTAGE;
  const isOverThreshold = dragPercentage >= SWIPE_THRESHOLD_PERCENTAGE;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg">
      {isUploading && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full z-50"
        >
          <span className="text-white text-sm font-medium">
            Uploading photo...
          </span>
        </motion.div>
      )}

      <div
        className="relative h-full flex items-center justify-center p-6 scale-90"
        {...handlers}
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => {
            const isCurrentPhoto = index === currentPhotoIndex;
            const isPrevPhoto = index === currentPhotoIndex - 1;
            const isNextPhoto = index === currentPhotoIndex + 1;
            const isActive = isPrevPhoto || isCurrentPhoto || isNextPhoto;

            return (
              <motion.div
                key={photo.id}
                className={`absolute w-full max-w-md ${
                  isCurrentPhoto ? "cursor-grab active:cursor-grabbing" : ""
                }`}
                style={{
                  zIndex: isCurrentPhoto
                    ? 10
                    : photos.length - Math.abs(index - currentPhotoIndex),
                  pointerEvents: isActive ? "auto" : "none",
                }}
                initial={{
                  scale: 0.8,
                  opacity: 0,
                  x:
                    swipeDirection === "left"
                      ? -200
                      : swipeDirection === "right"
                      ? 200
                      : 0,
                }}
                animate={{
                  scale: isCurrentPhoto
                    ? 1
                    : isPrevPhoto || isNextPhoto
                    ? 0.95
                    : 0.9,
                  opacity: isCurrentPhoto ? 1 : isActive ? 0.7 : 0,
                  x: isCurrentPhoto
                    ? horizontalDrag
                    : isPrevPhoto
                    ? -100 + horizontalDrag * 0.5
                    : isNextPhoto
                    ? 100 + horizontalDrag * 0.5
                    : horizontalDrag * 0.1,
                  y: isCurrentPhoto ? dragPosition : index * -8,
                  rotateY: isCurrentPhoto
                    ? horizontalDrag * 0.05
                    : isPrevPhoto
                    ? 5
                    : isNextPhoto
                    ? -5
                    : 0,
                  transition: springConfig,
                }}
                exit={{
                  scale: exitDirection === "up" ? 1.1 : 0.8,
                  opacity: 0,
                  x:
                    swipeDirection === "left"
                      ? 200
                      : swipeDirection === "right"
                      ? -200
                      : 0,
                  y:
                    exitDirection === "up"
                      ? -screenHeight
                      : exitDirection === "down"
                      ? screenHeight
                      : 0,
                  transition: bounceTransition,
                }}
                drag={isCurrentPhoto}
                dragDirectionLock={false}
                dragConstraints={{
                  top: -screenHeight * 0.5,
                  bottom: screenHeight * 0.5,
                  left: -200,
                  right: 200,
                }}
                dragElastic={0.6}
                dragTransition={{
                  min: 0,
                  max: 100,
                  bounceStiffness: 200,
                  bounceDamping: 40,
                  power: 0.2,
                  timeConstant: 300,
                  restDelta: 0.001,
                  modifyTarget: (target) => Math.round(target * 100) / 100,
                }}
                onDragStart={handleDragStart}
                onDrag={handleDragUpdate}
                onDragEnd={(_, info) => handleDragEnd(photo.id, info)}
              >
                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-2xl bg-black"
                  animate={{
                    rotate: isDragging ? dragPosition * 0.01 : 0,
                    scale: isDragging ? 1.02 : 1,
                  }}
                  transition={dragTransitionConfig}
                >
                  <img
                    src={photo.url}
                    alt="Review"
                    className="w-full aspect-[3/4] object-cover"
                    draggable="false"
                  />

                  {isCurrentPhoto && !isHorizontalDragging && (
                    <>
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: dragPosition < 0 && isDragging ? 1 : 0,
                          background: `linear-gradient(to bottom, ${
                            isOverThreshold && dragPosition < 0
                              ? "rgba(34, 197, 94, 0.9)"
                              : "rgba(34, 197, 94, 0.7)"
                          }, transparent)`,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="flex flex-col items-center"
                          animate={{
                            scale:
                              isNearThreshold && dragPosition < 0 ? 1.2 : 1,
                            y: isNearThreshold && dragPosition < 0 ? -20 : 0,
                          }}
                          transition={springConfig}
                        >
                          <CheckCircle2 className="w-12 h-12 text-white mb-4" />
                          <p className="text-white text-lg font-medium">
                            {isOverThreshold
                              ? "Release to Upload"
                              : "Keep sliding up"}
                          </p>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: dragPosition > 0 && isDragging ? 1 : 0,
                          background: `linear-gradient(to bottom, transparent, ${
                            isOverThreshold && dragPosition > 0
                              ? "rgba(239, 68, 68, 0.9)"
                              : "rgba(239, 68, 68, 0.7)"
                          })`,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="flex flex-col items-center"
                          animate={{
                            scale:
                              isNearThreshold && dragPosition > 0 ? 1.2 : 1,
                            y: isNearThreshold && dragPosition > 0 ? 20 : 0,
                          }}
                          transition={springConfig}
                        >
                          <Trash2 className="w-12 h-12 text-white mb-4" />
                          <p className="text-white text-lg font-medium">
                            {isOverThreshold
                              ? "Release to Delete"
                              : "Keep sliding down"}
                          </p>
                        </motion.div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {photos.length > 1 && (
          <PhotoProgress total={photos.length} current={currentPhotoIndex} />
        )}
      </div>
    </div>
  );
}
