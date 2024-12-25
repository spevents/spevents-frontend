import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { PhotoCard } from "./components/PhotoCard";
import { PhotoProgress } from "./components/PhotoProgress";
import { KeyboardHints } from "./components/KeyboardHints";
import { UploadingIndicator } from "./components/UploadingIndicator";
import { ReviewComplete } from "./components/ReviewComplete";
import { usePhotoActions } from "./hooks/usePhotoActions";

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
export default function PhotoReview() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragPosition, setDragPosition] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"up" | "down" | null>(
    null
  );
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [horizontalDrag, setHorizontalDrag] = useState(0);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);

  const { handlePhotoAction, isUploading } = usePhotoActions(
    photos,
    setPhotos,
    currentPhotoIndex,
    setCurrentPhotoIndex
  );

  useEffect(() => {
    const updateScreenHeight = () => setScreenHeight(window.innerHeight);
    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    const sessionPhotos = JSON.parse(
      sessionStorage.getItem("temp-photos") || "[]"
    );
    setPhotos(sessionPhotos);

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

  const handleDragStart = (_: any, info: any) => {
    const horizontalMovement =
      Math.abs(info.offset.x) > Math.abs(info.offset.y);
    setIsHorizontalDragging(horizontalMovement);
    if (!horizontalMovement) {
      setIsDragging(true);
    }
  };

  const handleDragUpdate = (_: any, info: any) => {
    if (isHorizontalDragging) {
      setHorizontalDrag(info.offset.x);
    } else {
      setDragPosition(info.offset.y);
    }
  };

  const handleDragEnd = async (photoId: number, info: any) => {
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
      {isUploading && <UploadingIndicator />}

      <div
        className="relative h-full flex items-center justify-center p-6 scale-90"
        {...handlers}
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => {
            const isCurrentPhoto = index === currentPhotoIndex;
            const isPrevPhoto = index === currentPhotoIndex - 1;
            const isNextPhoto = index === currentPhotoIndex + 1;

            return (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isCurrentPhoto={isCurrentPhoto}
                isPrevPhoto={isPrevPhoto}
                isNextPhoto={isNextPhoto}
                index={index}
                totalPhotos={photos.length}
                currentPhotoIndex={currentPhotoIndex}
                isDragging={isDragging}
                isHorizontalDragging={isHorizontalDragging}
                horizontalDrag={horizontalDrag}
                dragPosition={dragPosition}
                swipeDirection={swipeDirection}
                exitDirection={exitDirection}
                screenHeight={screenHeight}
                isNearThreshold={isNearThreshold}
                isOverThreshold={isOverThreshold}
                dragHandlers={{
                  onDragStart: handleDragStart,
                  onDrag: handleDragUpdate,
                  onDragEnd: (_, info) => handleDragEnd(photo.id, info),
                }}
                springConfig={springConfig}
                bounceTransition={bounceTransition}
                dragTransitionConfig={dragTransitionConfig}
              />
            );
          })}
        </AnimatePresence>

        {photos.length > 1 && (
          <PhotoProgress total={photos.length} current={currentPhotoIndex} />
        )}
      </div>

      {!window.matchMedia("(pointer: coarse)").matches && <KeyboardHints />}
    </div>
  );
}
