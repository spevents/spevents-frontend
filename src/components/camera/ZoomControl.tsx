import { motion } from "framer-motion";
import { MinusCircle, ZoomIn } from "lucide-react";
import { useCallback } from "react";
import type { Orientation } from "./hooks/useOrientation";

interface ZoomControlProps {
  isVisible: boolean;
  zoomLevel: number;
  facingMode: "user" | "environment";
  orientation: Orientation;
  onToggleVisibility: () => void;
  onZoomChange: (zoom: number) => void;
}

const REAR_ZOOM_LEVELS = [0.5, 1.0, 1.2] as const;
const FRONT_ZOOM_LEVELS = [1.0, 1.2] as const;

export const ZoomControl: React.FC<ZoomControlProps> = ({
  isVisible,
  zoomLevel,
  facingMode,
  orientation,
  onToggleVisibility,
  onZoomChange,
}) => {
  const zoomLevels =
    facingMode === "user" ? FRONT_ZOOM_LEVELS : REAR_ZOOM_LEVELS;

  const handleZoomClick = useCallback(
    (level: number) => {
      onZoomChange(level);
    },
    [onZoomChange],
  );

  const controlsPosition =
    orientation === "landscape"
      ? "left-8 top-1/2 -translate-y-1/2"
      : "bottom-52 sm:bottom-56 left-1/2 -translate-x-1/2";

  const togglePosition =
    orientation === "landscape"
      ? "left-8 bottom-8"
      : "bottom-52 sm:bottom-56 right-4";

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
        className={`absolute ${controlsPosition} bg-black/50 backdrop-blur-md rounded-full p-4 z-10`}
      >
        <div
          className={`flex ${
            orientation === "landscape" ? "flex-col" : "flex-row"
          } items-center gap-2`}
        >
          {zoomLevels.map((level) => (
            <motion.button
              key={level}
              onClick={() => handleZoomClick(level)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm transition-colors
                ${
                  zoomLevel === level
                    ? "bg-white text-black"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              whileTap={{ scale: 0.95 }}
            >
              {level}x
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.button
        onClick={onToggleVisibility}
        whileTap={{ scale: 0.95 }}
        className={`absolute ${togglePosition} bg-black/50 backdrop-blur-md p-3 rounded-full text-white z-10 hover:bg-black/60 transition-colors`}
      >
        {isVisible ? (
          <MinusCircle className="w-6 h-6" />
        ) : (
          <ZoomIn className="w-6 h-6" />
        )}
      </motion.button>
    </>
  );
};
