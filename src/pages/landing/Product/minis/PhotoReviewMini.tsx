import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface Photo {
  id: number;
  url: string;
}

interface PhotoReviewMiniProps {
  onPhotoAction: (photo: Photo) => void;
  onComplete: () => void;
}

const SWIPE_THRESHOLD = 50;
export const SAMPLE_PHOTOS: Photo[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1730724620842-b1bb8eea6ca0?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/flagged/photo-1620830102229-9db5c00d4afc?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1468359601543-843bfaef291a?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const springConfig = {
  type: "spring" as const,
  stiffness: 250,
  damping: 25,
  mass: 0.8,
  restDelta: 0.001,
};

export default function PhotoReviewMini({
  onPhotoAction,
  onComplete,
}: PhotoReviewMiniProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>(() => [...SAMPLE_PHOTOS]);
  const [exitDirection, setExitDirection] = useState<"up" | "down" | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isProcessing) return;

    const swipeThreshold = SWIPE_THRESHOLD;
    if (Math.abs(info.offset.y) > swipeThreshold) {
      const isUpward = info.offset.y < 0;
      setExitDirection(isUpward ? "up" : "down");
      handlePhotoAction(photos[currentPhotoIndex], isUpward);
    }
    setDragPosition(0);
    setIsDragging(false);
  };

  const handlePhotoAction = async (photo: Photo, isUpward: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (isUpward) {
      // Upload the photo first
      onPhotoAction(photo);


    }

    // Remove the photo and update state
    setPhotos((prevPhotos) => prevPhotos.filter((p) => p.id !== photo.id));

    // Move to next photo or complete if no more photos
    if (photos.length <= 1) {
      onComplete();
    } else if (currentPhotoIndex >= photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }

    // Reset states
    setDragPosition(0);
    setTimeout(() => {
      setIsProcessing(false);
      setExitDirection(null);
    }, 300);
  };

  const handlers = useSwipeable({
    onSwiping: ({ deltaY }) => {
      if (!isProcessing) {
        setDragPosition(deltaY);
        setIsDragging(true);
      }
    },
    onSwipedUp: () => {
      if (!isProcessing) {
        handleDragEnd(null, { offset: { y: -100 } } as PanInfo);
      }
    },
    onSwipedDown: () => {
      if (!isProcessing) {
        handleDragEnd(null, { offset: { y: 100 } } as PanInfo);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentPhotoIndex];
  const dragPercentage = Math.abs(dragPosition / SWIPE_THRESHOLD);
  const isNearThreshold = dragPercentage >= 0.5;

  return (
    <motion.div
      className="w-full h-[24rem] relative rounded-2xl overflow-hidden bg-black/5"
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.id}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.8}
          {...handlers}
          onDragEnd={handleDragEnd}
          style={{ y: dragPosition }}
          animate={{ scale: 1 - Math.abs(dragPosition / 1000) }}
          transition={springConfig}
        >
          <img
            src={currentPhoto.url}
            alt="Review"
            className="w-full h-full object-cover"
            draggable="false"
          />

          {/* Upload Indicator */}
          <motion.div
            className="absolute inset-0 bg-green-500/80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                dragPosition < -SWIPE_THRESHOLD / 2 && isDragging ? 0.8 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-white text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">
                {isNearThreshold && dragPosition < 0
                  ? "Release to Upload"
                  : "Keep sliding up"}
              </p>
            </div>
          </motion.div>

          {/* Delete Indicator */}
          <motion.div
            className="absolute inset-0 bg-red-500/80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                dragPosition > SWIPE_THRESHOLD / 2 && isDragging ? 0.8 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-white text-center">
              <Trash2 className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">
                {isNearThreshold && dragPosition > 0
                  ? "Release to Delete"
                  : "Keep sliding down"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Action Indicators */}
      <div className="absolute inset-y-0 left-4 flex flex-col justify-center items-center space-y-4 text-brunswick-green/30">
        <ArrowUpCircle className="w-8 h-8" />
        <ArrowDownCircle className="w-8 h-8" />
      </div>

      {/* Counter */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
        {currentPhotoIndex + 1} / {photos.length}
      </div>
    </motion.div>
  );
}
