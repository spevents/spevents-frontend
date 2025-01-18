import { motion } from "framer-motion";
import { CheckCircle2, Trash2 } from "lucide-react";


interface SpringConfig {
  type: "spring";
  stiffness: number;
  damping: number;
  mass: number;
  restDelta: number;
}

interface BounceTransition {
  type: "spring";
  bounce: number;
  duration: number;
  restDelta: number;
}

interface DragTransitionConfig {
  type: "spring";
  stiffness: number;
  damping: number;
  mass: number;
  restDelta: number;
}


// Improved animation configs
const cardSpringConfig = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 0.5,
  restDelta: 0.001,
};

const overlayTransition = {
  duration: 0.2,
  ease: "easeOut",
};

interface PhotoCardProps {
  photo: {
    id: number;
    url: string;
  };
  isCurrentPhoto: boolean;
  isPrevPhoto: boolean;
  isNextPhoto: boolean;
  index: number;
  totalPhotos: number;
  currentPhotoIndex: number;
  isDragging: boolean;
  isHorizontalDragging: boolean;
  horizontalDrag: number;
  dragPosition: number;
  swipeDirection: "left" | "right" | null;
  exitDirection: "up" | "down" | null;
  screenHeight: number;
  isNearThreshold: boolean;
  isOverThreshold: boolean;
  dragHandlers: {
    onDragStart: (e: any, info: any) => void;
    onDrag: (e: any, info: any) => void;
    onDragEnd: (e: any, info: any) => void;
  };
  springConfig: SpringConfig;
  bounceTransition: BounceTransition;
  dragTransitionConfig: DragTransitionConfig;
}




export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isCurrentPhoto,
  isPrevPhoto,
  isNextPhoto,
  index,
  totalPhotos,
  currentPhotoIndex,
  isDragging,
  isHorizontalDragging,
  horizontalDrag,
  dragPosition,
  swipeDirection,
  exitDirection,
  screenHeight,
  isNearThreshold,
  isOverThreshold,
  dragHandlers
}) => {
  const isActive = isPrevPhoto || isCurrentPhoto || isNextPhoto;

  // Calculate the current drag progress (0 to 1)
  const dragProgress = Math.abs(dragPosition) / (screenHeight * 0.25);
  const clampedProgress = Math.min(1, dragProgress);

  // Calculate dynamic scale based on drag progress
  const currentScale = isDragging 
    ? 1 - (clampedProgress * 0.1) 
    : 1;

  // Calculate rotation based on horizontal position
  const rotation = isCurrentPhoto 
    ? (horizontalDrag * 0.05)
    : isPrevPhoto
    ? 3
    : isNextPhoto
    ? -3
    : 0;

  return (
    <motion.div
      className={`absolute w-full max-w-md ${
        isCurrentPhoto ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        zIndex: isCurrentPhoto
          ? 20
          : totalPhotos - Math.abs(index - currentPhotoIndex),
        pointerEvents: isActive ? "auto" : "none",
      }}
      initial={{ scale: 0.8, opacity: 0, y: 100 }}
      animate={{
        scale: isCurrentPhoto 
          ? currentScale 
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
        y: isCurrentPhoto 
          ? dragPosition 
          : isPrevPhoto 
          ? -20 
          : isNextPhoto 
          ? 20 
          : 0,
        rotateY: rotation,
        transition: {
          ...cardSpringConfig,
          scale: { duration: 0.2 },
        },
      }}
      exit={{
        scale: exitDirection === "up" ? 1.1 : 0.8,
        opacity: 0,
        x: swipeDirection === "left" ? 200 : swipeDirection === "right" ? -200 : 0,
        y: exitDirection === "up" ? -screenHeight : exitDirection === "down" ? screenHeight : 0,
      }}
      drag={isCurrentPhoto}
      dragDirectionLock={false}
      dragConstraints={{
        top: -screenHeight * 0.5,
        bottom: screenHeight * 0.5,
        left: -200,
        right: 200,
      }}
      dragElastic={0.7}
      {...dragHandlers}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-black"
        animate={{
          scale: isDragging ? 1 + (clampedProgress * 0.05) : 1,
        }}
        transition={cardSpringConfig}
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
                opacity: dragPosition < 0 ? clampedProgress : 0,
                background: `linear-gradient(to bottom, ${
                  isOverThreshold
                    ? "rgba(34, 197, 94, 0.9)"
                    : "rgba(34, 197, 94, 0.7)"
                }, transparent)`,
              }}
              transition={overlayTransition}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  scale: isNearThreshold ? 1.1 : 1,
                  y: isNearThreshold ? -10 : 0,
                }}
                transition={cardSpringConfig}
              >
                <CheckCircle2 className="w-12 h-12 text-white mb-4" />
                <p className="text-white text-lg font-medium">
                  {isOverThreshold ? "Release to Upload" : "Keep sliding up"}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{
                opacity: dragPosition > 0 ? clampedProgress : 0,
                background: `linear-gradient(to bottom, transparent, ${
                  isOverThreshold
                    ? "rgba(239, 68, 68, 0.9)"
                    : "rgba(239, 68, 68, 0.7)"
                })`,
              }}
              transition={overlayTransition}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  scale: isNearThreshold ? 1.1 : 1,
                  y: isNearThreshold ? 10 : 0,
                }}
                transition={cardSpringConfig}
              >
                <Trash2 className="w-12 h-12 text-white mb-4" />
                <p className="text-white text-lg font-medium">
                  {isOverThreshold ? "Release to Delete" : "Keep sliding down"}
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};