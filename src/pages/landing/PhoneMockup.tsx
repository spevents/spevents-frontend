// src/components/landing/PhoneMockup.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface PhoneMockupProps {
  isDark: boolean;
  mode: string;
  samplePhotos: string[];
  onSwipeAction?: (action: SwipeAction) => void;
  onComplete?: () => void;
  shouldReset?: boolean;
}

interface SwipeAction {
  photoIndex: number;
  action: "upload" | "delete";
  direction: "left" | "right";
  timestamp: number;
}

type SwipeState = "idle" | "ready" | "swiping" | "completed";
type ActionType = "upload" | "delete";

export const PhoneMockup = ({
  isDark,
  samplePhotos,
  onSwipeAction,
  onComplete,
  shouldReset,
}: PhoneMockupProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>("idle");
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [_isAnimating, setIsAnimating] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // Limit to 6 photos max
  const limitedPhotos = samplePhotos.slice(0, 6);

  // Reset when shouldReset changes
  useEffect(() => {
    if (shouldReset) {
      setCurrentPhotoIndex(0);
      setSwipeState("idle");
      setActionType(null);
      setIsAnimating(false);
      setCycleCount(0);
    }
  }, [shouldReset]);

  useEffect(() => {
    if (swipeState === "completed") return;

    const sequence = async () => {
      // Initial delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Alternate between upload and delete actions
      const isUploadTurn = currentPhotoIndex % 3 !== 2; // Upload 2 out of 3 times
      const selectedAction: ActionType = isUploadTurn ? "upload" : "delete";

      setActionType(selectedAction);
      setSwipeState("ready");

      // Ready state
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Start swiping
      setSwipeState("swiping");
      setIsAnimating(true);

      // Swiping animation
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Only notify parent for uploads (to sync with LivePhotoWall)
      if (selectedAction === "upload" && onSwipeAction) {
        onSwipeAction({
          photoIndex: currentPhotoIndex,
          action: selectedAction,
          direction: "left", // Direction doesn't matter for demo
          timestamp: Date.now(),
        });
      }

      // Update photo index and cycle count
      const nextIndex = (currentPhotoIndex + 1) % limitedPhotos.length;
      const newCycleCount = nextIndex === 0 ? cycleCount + 1 : cycleCount;

      setCurrentPhotoIndex(nextIndex);
      setCycleCount(newCycleCount);

      // Reset delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if we've completed all 6 photos
      if (newCycleCount >= 1) {
        setSwipeState("completed");
        setActionType(null);
        setIsAnimating(false);
        onComplete?.();
        return;
      }

      // Reset state
      setSwipeState("idle");
      setActionType(null);
      setIsAnimating(false);
    };

    const interval = setInterval(sequence, 2500);
    return () => clearInterval(interval);
  }, [
    currentPhotoIndex,
    onSwipeAction,
    limitedPhotos.length,
    cycleCount,
    swipeState,
    onComplete,
  ]);

  const getSwipeTransform = () => {
    if (swipeState !== "swiping" || !actionType)
      return { x: 0, y: 0, rotate: 0 };

    const isUpload = actionType === "upload";

    return {
      x: 0,
      y: isUpload ? -400 : 400,
      rotate: 0,
    };
  };

  const getExitTransform = () => {
    if (!actionType) return { x: 0, y: 0, rotate: 0 };

    const isUpload = actionType === "upload";

    return {
      x: 0,
      y: isUpload ? -500 : 500,
      rotate: 0,
    };
  };

  return (
    <div className="relative mx-auto -mt-8">
      {" "}
      {/* Moved up with negative margin */}
      <div className="relative w-56 h-[480px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

        <div
          className={`w-full h-full rounded-[2rem] overflow-hidden relative ${
            isDark ? "bg-sp_darkgreen" : "bg-sp_eggshell"
          }`}
        >
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 text-xs font-medium z-20">
            <span className={isDark ? "text-sp_eggshell" : "text-sp_darkgreen"}>
              4:33
            </span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-current rounded-sm">
                <div className="w-3/4 h-full bg-current rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Main photo display area */}
          <div className="absolute inset-0 pt-12">
            {/* Photo stack background */}
            <div className="absolute inset-4 top-16">
              {/* Background cards */}
              {[3, 2, 1].map((offset) => (
                <div
                  key={offset}
                  className={`absolute inset-0 rounded-2xl transform ${
                    isDark ? "bg-sp_green/15" : "bg-sp_lightgreen/25"
                  } border-2 ${
                    isDark ? "border-sp_green/25" : "border-sp_lightgreen/40"
                  }`}
                  style={{
                    transform: `translateY(${offset * 3}px) scale(${
                      1 - offset * 0.015
                    })`,
                    zIndex: 10 - offset,
                  }}
                />
              ))}

              {/* Photo stack container */}
              <div className="absolute inset-0 z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`photo-${currentPhotoIndex}`}
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg border-4 border-white"
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={
                      swipeState === "swiping"
                        ? {
                            ...getSwipeTransform(),
                            scale: 0.9,
                            opacity: 0.7,
                          }
                        : {
                            x: 0,
                            y: 0,
                            rotate: 0,
                            scale: 1,
                            opacity: 1,
                          }
                    }
                    exit={{
                      ...getExitTransform(),
                      opacity: 0,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: swipeState === "swiping" ? 1.0 : 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <img
                      src={limitedPhotos[currentPhotoIndex]}
                      alt="Current photo"
                      className="w-full h-full object-cover"
                    />

                    {/* Completion overlay */}
                    {swipeState === "completed" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.95 }}
                        className={`absolute inset-0 flex flex-col items-center justify-center ${
                          isDark ? "bg-sp_darkgreen" : "bg-sp_eggshell"
                        }`}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.6 }}
                          className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 ${
                            isDark
                              ? "border-sp_lightgreen bg-sp_green"
                              : "border-sp_green bg-sp_lightgreen"
                          }`}
                        >
                          <CheckCircle
                            className={`w-8 h-8 ${
                              isDark ? "text-sp_lightgreen" : "text-sp_green"
                            }`}
                          />
                        </motion.div>
                        <p
                          className={`font-semibold text-lg ${
                            isDark ? "text-sp_lightgreen" : "text-sp_darkgreen"
                          }`}
                        >
                          Demo Complete!
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            isDark
                              ? "text-sp_eggshell/80"
                              : "text-sp_darkgreen/70"
                          }`}
                        >
                          All photos processed
                        </p>
                      </motion.div>
                    )}

                    {/* Action overlays - only show during ready and swiping states */}
                    <AnimatePresence>
                      {(swipeState === "ready" ||
                        (swipeState === "swiping" && actionType)) &&
                        actionType && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.92 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 flex flex-col items-center justify-center ${
                              actionType === "upload"
                                ? isDark
                                  ? "bg-sp_green"
                                  : "bg-sp_lightgreen"
                                : "bg-red-500"
                            }`}
                          >
                            <motion.div
                              initial={{
                                scale: 0,
                                rotate: actionType === "upload" ? -180 : 180,
                              }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", bounce: 0.6 }}
                              className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center mb-4 ${
                                actionType === "upload"
                                  ? isDark
                                    ? "bg-sp_lightgreen"
                                    : "bg-white"
                                  : "bg-white"
                              }`}
                            >
                              {actionType === "upload" ? (
                                <CheckCircle
                                  className={`w-8 h-8 ${
                                    isDark
                                      ? "text-sp_darkgreen"
                                      : "text-sp_green"
                                  }`}
                                />
                              ) : (
                                <X className="w-8 h-8 text-red-500" />
                              )}
                            </motion.div>
                            <p className="text-white font-semibold text-lg">
                              {swipeState === "ready" ? "Release to" : ""}
                              {swipeState === "swiping"
                                ? actionType === "upload"
                                  ? "Uploading..."
                                  : "Deleting..."
                                : ` ${
                                    actionType === "upload"
                                      ? "Upload"
                                      : "Delete"
                                  }`}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom UI */}
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4">
              {/* Photo counter */}
              <div
                className={`px-3 py-1 rounded-full ${
                  isDark ? "bg-sp_green/80" : "bg-sp_lightgreen/80"
                } backdrop-blur-sm`}
              >
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                  }`}
                >
                  {currentPhotoIndex + 1} of {limitedPhotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
