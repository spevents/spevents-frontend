import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
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
  photos: Photo[];
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

export default function PhotoReviewMini({
  photos,
  onPhotoAction,
  onComplete,
}: PhotoReviewMiniProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isProcessing) return;

    if (Math.abs(info.offset.y) > SWIPE_THRESHOLD) {
      const isUpward = info.offset.y < 0;
      handlePhotoAction(photos[currentPhotoIndex], isUpward);
    }
    setDragPosition(0);
    setIsDragging(false);
  };

  const handlePhotoAction = async (photo: Photo, isUpward: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (isUpward) {
      onPhotoAction(photo);
    }

    if (photos.length <= 1) {
      onComplete();
    } else if (currentPhotoIndex >= photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }

    setDragPosition(0);
    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  if (photos.length === 0) return null;

  const currentPhoto = photos[currentPhotoIndex];
  const dragPercentage = Math.abs(dragPosition / SWIPE_THRESHOLD);
  const isNearThreshold = dragPercentage >= 0.5;

  return (
    <motion.div className="w-full h-96 relative rounded-2xl overflow-hidden bg-black/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.id}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_, info) => setDragPosition(info.offset.y)}
          style={{ y: dragPosition }}
          animate={{ scale: 1 - Math.abs(dragPosition / 1000) }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
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
