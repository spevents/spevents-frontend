import { motion } from "framer-motion";
import { Upload as UploadIcon, Repeat } from "lucide-react";
import type { Orientation } from "./hooks/useOrientation";

interface CameraControlsProps {
  photoCount: number;
  isCapturing: boolean;
  disabled: boolean;
  orientation: Orientation;
  onCapture: () => void;
  onFlip: () => void;
  onNavigateToReview: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  photoCount,
  isCapturing,
  disabled,
  orientation,
  onCapture,
  onFlip,
  onNavigateToReview,
}) => {
  const containerClass = orientation === 'landscape' 
    ? 'absolute right-8 inset-y-0 flex flex-col justify-center items-center gap-8'
    : 'absolute bottom-24 inset-x-0 p-8';

  const controlsWrapperClass = orientation === 'landscape'
    ? 'flex flex-col items-center gap-8'
    : 'flex justify-between items-center max-w-lg mx-auto px-6';

  return (
    <div className={containerClass}>
      <div className={controlsWrapperClass}>
        {photoCount > 0 ? (
          <motion.button
            onClick={onNavigateToReview}
            whileTap={{ scale: 0.95 }}
            className="relative bg-white/20 backdrop-blur-lg p-4 rounded-full text-white"
          >
            <UploadIcon className="w-6 h-6" />
            <motion.span
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {photoCount}
            </motion.span>
          </motion.button>
        ) : (
          <div className="w-14" />
        )}

        <motion.button
          onClick={onCapture}
          disabled={disabled}
          animate={{
            scale: isCapturing ? 0.9 : 1,
            backgroundColor: isCapturing
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(255, 255, 255, 1)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`capture-button w-20 h-20 rounded-full transform relative
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="absolute inset-2 rounded-full border-2 border-gray-200" />
        </motion.button>

        <motion.button
          onClick={onFlip}
          whileTap={{ scale: 0.95 }}
          className="flip-button bg-white/20 backdrop-blur-lg p-4 rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <Repeat className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};
