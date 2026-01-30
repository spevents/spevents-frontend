// src/components/PhotoReview/PhotoReview.tsx
import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { CheckCircle2, Trash2, Camera, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";

// Backend API calls
import { getPresignedUrl, uploadPhoto } from "@/services/api";
import { checkNSFW } from "@/services/nsfw";

// Local storage utilities for temp photos
const getTempPhotos = (eventId: string): Photo[] => {
  try {
    const stored = localStorage.getItem(`temp_photos_${eventId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting temp photos:", error);
    return [];
  }
};

const storeTempPhotos = (eventId: string, photos: Photo[]): void => {
  try {
    localStorage.setItem(`temp_photos_${eventId}`, JSON.stringify(photos));
  } catch (error) {
    console.error("Error storing temp photos:", error);
  }
};

const storeUploadedPhoto = (
  eventId: string,
  photoUrl: string,
  fileName: string,
  guestId: string,
): void => {
  try {
    const uploaded = JSON.parse(
      localStorage.getItem(`uploaded_photos_${eventId}`) || "[]",
    );

    uploaded.push({
      url: photoUrl,
      fileName: fileName,
      name: fileName,
      guestId: guestId,
      uploadedAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    localStorage.setItem(
      `uploaded_photos_${eventId}`,
      JSON.stringify(uploaded),
    );

    console.log("✅ Stored uploaded photo:", {
      eventId,
      fileName,
      url: photoUrl,
      guestId,
    });
  } catch (error) {
    console.error("Error storing uploaded photo info:", error);
  }
};

import { useNgrok } from "@/contexts/NgrokContext";
import { useActualEventId } from "../session/SessionValidator";

interface Photo {
  id: number;
  url: string;
}

const SWIPE_THRESHOLD_PERCENTAGE = 0.25;
const ACTIVATION_THRESHOLD_PERCENTAGE = 0.15;

// Swipe instruction tooltip - shows on first load
const SwipeTooltip = memo(function SwipeTooltip({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
      onClick={onDismiss}
    >
      <div className="bg-sp_darkgreen/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-lg border border-sp_lightgreen/30">
        <div className="flex flex-col items-center gap-3 text-sp_eggshell">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-sp_lightgreen" />
            <span className="text-sm font-medium">Swipe up to upload</span>
          </div>
          <div className="w-12 h-px bg-sp_lightgreen/30" />
          <div className="flex items-center gap-2">
            <ArrowDown className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium">Swipe down to delete</span>
          </div>
        </div>
        <p className="text-sp_lightgreen/70 text-xs text-center mt-2">
          Tap to dismiss
        </p>
      </div>
    </motion.div>
  );
});

// Optimized spring configs for smoother performance on lower-end devices
const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
  restDelta: 0.5,
};

const bounceTransition = {
  type: "tween" as const,
  duration: 0.25,
  ease: "easeOut" as const,
};

const dragTransitionConfig = {
  type: "tween" as const,
  duration: 0.1,
  ease: "linear" as const,
};

// PhotoProgress Component - Optimized with green theme
const PhotoProgress: React.FC<{ total: number; current: number }> = ({
  total,
  current,
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
      <div className="w-48 h-1.5 bg-sp_lightgreen/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-sp_lightgreen rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((current + 1) / total) * 100}%`,
          }}
          transition={{ type: "tween", duration: 0.2 }}
        />
      </div>
      <div className="text-sp_lightgreen text-sm font-medium">
        {current + 1} of {total}
      </div>
    </div>
  );
};

// Review Complete Component - Spevents green theme
const ReviewComplete: React.FC = () => {
  const params = useParams();
  const sessionCode = params.sessionCode || params.eventId;
  const { baseUrl } = useNgrok();
  const navigate = useNavigate();

  const navigateWithBaseUrl = (path: string) => {
    const fullPath =
      path === "/" ? `/${sessionCode}/guest` : `/${sessionCode}/guest${path}`;
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
      className="fixed inset-0 bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="w-full max-w-xs space-y-6 text-center"
      >
        <div className="w-16 h-16 bg-sp_midgreen rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-8 h-8 text-sp_eggshell" />
        </div>
        <h2 className="text-sp_eggshell text-xl font-semibold">
          All photos reviewed!
        </h2>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateWithBaseUrl("/")}
            className="w-full px-6 py-3 bg-sp_eggshell text-sp_darkgreen rounded-xl font-medium
              transition-colors active:bg-sp_lightgreen"
          >
            View Gallery
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateWithBaseUrl("/camera")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3
              bg-sp_midgreen text-sp_eggshell rounded-xl font-medium
              transition-colors active:bg-sp_lightgreen active:text-sp_darkgreen"
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
  const params = useParams();
  const sessionCode = params.sessionCode || params.eventId;
  const actualEventId = useActualEventId();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState<Set<number>>(
    new Set(),
  );
  const [dragPosition, setDragPosition] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"up" | "down" | null>(
    null,
  );

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [horizontalDrag, setHorizontalDrag] = useState(0);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    console.log("🔍 PhotoReview Debug:");
    console.log("  sessionCode from URL:", sessionCode);
    console.log("  actualEventId from context:", actualEventId);
  }, [sessionCode, actualEventId]);

  useEffect(() => {
    const updateScreenHeight = () => setScreenHeight(window.innerHeight);
    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    if (actualEventId) {
      console.log("📸 Loading temp photos for actualEventId:", actualEventId);
      const tempPhotos = getTempPhotos(actualEventId);
      console.log("📸 Found temp photos:", tempPhotos);
      setPhotos(tempPhotos);
    }

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, [actualEventId]);

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
    setShowTooltip(false); // Dismiss tooltip on first drag
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
    if (!actualEventId) {
      console.error("❌ No actualEventId available for photo action");
      return;
    }

    const currentIndex = currentPhotoIndex;
    const totalPhotos = photos.length;

    if (isUpward) {
      setProcessingPhotos((prev) => new Set(prev).add(photo.id));
      setIsUploading(true);

      try {
        console.log("🚀 Starting upload for photo:", photo.id);
        console.log("📍 Using actualEventId:", actualEventId);
        console.log("📍 Using sessionCode:", sessionCode);

        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setDragPosition(0);

        if (currentIndex === totalPhotos - 1 && currentIndex > 0) {
          setCurrentPhotoIndex(currentIndex - 1);
        }

        console.log("📥 Fetching photo blob...");
        const response = await fetch(photo.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch photo: ${response.status}`);
        }
        const blob = await response.blob();
        console.log("✅ Blob created, size:", blob.size);

        const fileName = `photo-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: "image/jpeg" });
        console.log("📦 Created File object:", fileName);

        // NSFW Check
        console.log("🛡️ Checking for NSFW content...");
        const nsfwResult = await checkNSFW(file);

        if (nsfwResult.isNSFW) {
          console.warn("🚫 NSFW content detected:", nsfwResult);
          alert(
            "This photo cannot be uploaded as it was detected as inappropriate.",
          );

          // Stop upload process
          setIsUploading(false);
          setProcessingPhotos((prev) => {
            const newSet = new Set(prev);
            newSet.delete(photo.id);
            return newSet;
          });
          setExitDirection(null);

          // Add back to photos list if it was removed (it was filtered out at start of function)
          setPhotos((prev) => [...prev, photo]);
          return;
        }
        console.log("✅ NSFW check passed:", nsfwResult);

        console.log("☁️ Starting upload...");

        // Get upload params
        const uploadParams = await getPresignedUrl({
          eventId: actualEventId,
          fileName,
          contentType: "image/jpeg",
          isGuestPhoto: true,
          sessionCode: sessionCode,
        });

        // Upload and get the Vercel Blob URL from response
        const uploadResponse = await uploadPhoto({
          presignedUrl: uploadParams,
          file: file,
          onProgress: (progress) => {
            console.log(`📊 Upload progress: ${progress}%`);
          },
        });

        console.log("✅ Upload response:", uploadResponse);

        // Extract Vercel Blob URL from response
        // uploadResponse should contain { url: "https://..." }
        const blobUrl = uploadResponse.photoUrl;

        if (!blobUrl) {
          throw new Error("No URL returned from upload");
        }

        // Get guestId from localStorage
        const guestId = localStorage.getItem("spevents-guest-id") || "";

        console.log("✅ Storing photo with:");
        console.log("  Vercel Blob URL:", blobUrl);
        console.log("  Guest ID:", guestId);

        // Store with complete data
        storeUploadedPhoto(actualEventId, blobUrl, fileName, guestId);

        // Update local temp storage to remove uploaded photo
        const tempPhotos = getTempPhotos(actualEventId).filter(
          (p: Photo) => p.id !== photo.id,
        );
        storeTempPhotos(actualEventId, tempPhotos);

        console.log("🎉 Photo upload completed successfully");
      } catch (error: any) {
        console.error("💥 Upload failed with error:", error);
        console.error("🔍 Error details:", error.message);
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

      if (actualEventId) {
        const tempPhotos = getTempPhotos(actualEventId).filter(
          (p: Photo) => p.id !== photo.id,
        );
        storeTempPhotos(actualEventId, tempPhotos);
      }

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

  if (!actualEventId) {
    return (
      <div className="min-h-screen bg-sp_darkgreen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sp_lightgreen/30 border-t-sp_eggshell rounded-full animate-spin" />
      </div>
    );
  }

  if (photos.length === 0) {
    return <ReviewComplete />;
  }

  const dragPercentage = Math.abs(dragPosition / screenHeight);
  const isNearThreshold = dragPercentage >= ACTIVATION_THRESHOLD_PERCENTAGE;
  const isOverThreshold = dragPercentage >= SWIPE_THRESHOLD_PERCENTAGE;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen">
      {/* Swipe instruction tooltip */}
      <AnimatePresence>
        {showTooltip && !isDragging && (
          <SwipeTooltip onDismiss={() => setShowTooltip(false)} />
        )}
      </AnimatePresence>

      {isUploading && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "tween", duration: 0.15 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-sp_midgreen/90 backdrop-blur-sm px-4 py-2 rounded-full z-50 flex items-center gap-2"
        >
          <div className="w-4 h-4 border-2 border-sp_eggshell/30 border-t-sp_eggshell rounded-full animate-spin" />
          <span className="text-sp_eggshell text-sm font-medium">
            Uploading...
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
                      {/* Upload overlay - Spevents green */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: dragPosition < 0 && isDragging ? 1 : 0,
                          background: `linear-gradient(to bottom, ${
                            isOverThreshold && dragPosition < 0
                              ? "rgba(58, 90, 64, 0.95)"
                              : "rgba(88, 129, 87, 0.85)"
                          }, transparent)`,
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        <motion.div
                          className="flex flex-col items-center"
                          animate={{
                            scale:
                              isNearThreshold && dragPosition < 0 ? 1.15 : 1,
                            y: isNearThreshold && dragPosition < 0 ? -15 : 0,
                          }}
                          transition={{ type: "tween", duration: 0.1 }}
                        >
                          <CheckCircle2 className="w-12 h-12 text-sp_eggshell mb-3" />
                          <p className="text-sp_eggshell text-lg font-semibold">
                            {isOverThreshold
                              ? "Release to Upload"
                              : "Swipe up to upload"}
                          </p>
                        </motion.div>
                      </motion.div>

                      {/* Delete overlay - red */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: dragPosition > 0 && isDragging ? 1 : 0,
                          background: `linear-gradient(to bottom, transparent, ${
                            isOverThreshold && dragPosition > 0
                              ? "rgba(220, 38, 38, 0.95)"
                              : "rgba(239, 68, 68, 0.85)"
                          })`,
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        <motion.div
                          className="flex flex-col items-center"
                          animate={{
                            scale:
                              isNearThreshold && dragPosition > 0 ? 1.15 : 1,
                            y: isNearThreshold && dragPosition > 0 ? 15 : 0,
                          }}
                          transition={{ type: "tween", duration: 0.1 }}
                        >
                          <Trash2 className="w-12 h-12 text-white mb-3" />
                          <p className="text-white text-lg font-semibold">
                            {isOverThreshold
                              ? "Release to Delete"
                              : "Swipe down to delete"}
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
