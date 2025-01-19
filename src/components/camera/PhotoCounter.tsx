import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import type { Orientation } from "./hooks/useOrientation";

interface PhotoCounterProps {
  count: number;
  limit: number;
  orientation: Orientation;
}

export const PhotoCounter: React.FC<PhotoCounterProps> = ({ count, limit, orientation }) => {
  const positionClass = orientation === 'landscape'
    ? 'top-4 left-4'
    : 'top-4 right-4';

  return (
    <AnimatePresence>
      <motion.div
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`absolute ${positionClass} z-10`}
      >
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full flex items-center gap-2">
            <Camera className="w-4 h-4 text-white opacity-75" />
            <span className={`text-sm font-medium ${
              count >= limit ? "text-red-500" : "text-white"
            }`}>
              {count} / {limit}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};