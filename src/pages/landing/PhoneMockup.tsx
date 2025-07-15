// src/components/landing/PhoneMockup.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface PhoneMockupProps {
  isDark: boolean;
  mode: string;
  onSwipeAction?: (action: SwipeAction) => void;
}

interface SwipeAction {
  photoIndex: number;
  action: "upload" | "delete";
  direction: "left" | "right";
  timestamp: number;
}

const DEMO_PHOTOS = [
  "/placeholder.svg?height=200&width=200&text=Photo1",
  "/placeholder.svg?height=200&width=200&text=Photo2",
  "/placeholder.svg?height=200&width=200&text=Photo3",
  "/placeholder.svg?height=200&width=200&text=Photo4",
  "/placeholder.svg?height=200&width=200&text=Photo5",
  "/placeholder.svg?height=200&width=200&text=Photo6",
];

type SwipeState = "idle" | "ready" | "swiping" | "transitioning";
type ActionType = "upload" | "delete";
type SwipeDirection = "left" | "right";

export const PhoneMockup = ({ isDark, onSwipeAction }: PhoneMockupProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>("idle");
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(
    null
  );
  const [_isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      // Initial delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show ready state
      const actions: ActionType[] = ["upload", "delete"];
      const directions: SwipeDirection[] = ["left", "right"];
      const selectedAction =
        actions[Math.floor(Math.random() * actions.length)];
      const selectedDirection =
        directions[Math.floor(Math.random() * directions.length)];

      setActionType(selectedAction);
      setSwipeDirection(selectedDirection);
      setSwipeState("ready");

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Start swiping
      setSwipeState("swiping");
      setIsAnimating(true);

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Transition to next photo
      setSwipeState("transitioning");

      // Notify parent of swipe action
      if (onSwipeAction) {
        onSwipeAction({
          photoIndex: currentPhotoIndex,
          action: selectedAction,
          direction: selectedDirection,
          timestamp: Date.now(),
        });
      }

      setCurrentPhotoIndex((prev) => (prev + 1) % DEMO_PHOTOS.length);

      await new Promise((resolve) => setTimeout(resolve, 400));

      // Reset state
      setSwipeState("idle");
      setActionType(null);
      setSwipeDirection(null);
      setIsAnimating(false);
    };

    sequence();
    const interval = setInterval(sequence, 6000);
    return () => clearInterval(interval);
  }, []);

  const getSwipeTransform = () => {
    if (swipeState !== "swiping" || !swipeDirection)
      return { x: 0, y: 0, rotate: 0 };

    const isUpload = actionType === "upload";
    const isLeft = swipeDirection === "left";

    return {
      x: isLeft ? -300 : 300,
      y: isUpload ? -350 : 250,
      rotate: isLeft ? -25 : 25,
    };
  };

  const getNextPhotoTransform = () => {
    if (swipeState !== "transitioning") return { x: 0, y: 0, scale: 0.95 };
    return { x: 0, y: 0, scale: 1 };
  };

  return (
    <div className="relative mx-auto">
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
                  {swipeState !== "transitioning" && (
                    <motion.div
                      key={`current-${currentPhotoIndex}`}
                      className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg border-4 border-white"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{
                        ...getSwipeTransform(),
                        scale: 1,
                        opacity: swipeState === "swiping" ? 0.8 : 1,
                      }}
                      exit={{
                        ...getSwipeTransform(),
                        opacity: 0,
                        scale: 0.8,
                      }}
                      transition={{
                        duration: swipeState === "swiping" ? 0.8 : 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <img
                        src={DEMO_PHOTOS[currentPhotoIndex]}
                        alt="Current photo"
                        className="w-full h-full object-cover"
                      />

                      {/* Action overlays */}
                      <AnimatePresence>
                        {swipeState === "ready" && actionType && (
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
                              Release to{" "}
                              {actionType === "upload" ? "Upload" : "Delete"}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next photo (appears during transition) */}
                <AnimatePresence>
                  {swipeState === "transitioning" && (
                    <motion.div
                      key={`next-${currentPhotoIndex}`}
                      className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg border-4 border-white"
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{
                        ...getNextPhotoTransform(),
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <img
                        src={DEMO_PHOTOS[currentPhotoIndex]}
                        alt="Next photo"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
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
                  {currentPhotoIndex + 1} of {DEMO_PHOTOS.length}
                </span>
              </div>

              {/* Swipe indicators */}
              <div className="flex items-center gap-6">
                {/* Left swipe */}
                <motion.div
                  className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                    swipeState === "ready" && swipeDirection === "left"
                      ? actionType === "upload"
                        ? isDark
                          ? "text-sp_lightgreen"
                          : "text-sp_green"
                        : "text-red-400"
                      : isDark
                      ? "text-sp_eggshell/50"
                      : "text-sp_darkgreen/50"
                  }`}
                  animate={{
                    x: swipeState === "idle" ? [-3, 3, -3] : 0,
                    scale:
                      swipeState === "ready" && swipeDirection === "left"
                        ? 1.1
                        : 1,
                  }}
                  transition={{
                    x: { duration: 2, repeat: Number.POSITIVE_INFINITY },
                    scale: { duration: 0.3 },
                  }}
                >
                  <div className="w-6 h-1 bg-current opacity-50 rounded-full transform -rotate-45"></div>
                  <span>Swipe</span>
                </motion.div>

                {/* Center indicator */}
                <motion.div
                  className={`flex flex-col items-center gap-1 text-xs ${
                    isDark ? "text-sp_eggshell/60" : "text-sp_darkgreen/60"
                  }`}
                  animate={{ y: swipeState === "idle" ? [0, -8, 0] : 0 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="w-1 h-6 bg-current opacity-50 rounded-full"></div>
                  <span>to act</span>
                </motion.div>

                {/* Right swipe */}
                <motion.div
                  className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                    swipeState === "ready" && swipeDirection === "right"
                      ? actionType === "upload"
                        ? isDark
                          ? "text-sp_lightgreen"
                          : "text-sp_green"
                        : "text-red-400"
                      : isDark
                      ? "text-sp_eggshell/50"
                      : "text-sp_darkgreen/50"
                  }`}
                  animate={{
                    x: swipeState === "idle" ? [3, -3, 3] : 0,
                    scale:
                      swipeState === "ready" && swipeDirection === "right"
                        ? 1.1
                        : 1,
                  }}
                  transition={{
                    x: { duration: 2, repeat: Number.POSITIVE_INFINITY },
                    scale: { duration: 0.3 },
                  }}
                >
                  <div className="w-6 h-1 bg-current opacity-50 rounded-full transform rotate-45"></div>
                  <span>Swipe</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
