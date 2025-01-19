// src/components/camera/PhotoCounter.tsx
import { motion, AnimatePresence } from "framer-motion";

interface PhotoCounterProps {
  count: number;
  limit: number;
}

export const PhotoCounter: React.FC<PhotoCounterProps> = ({ count, limit }) => {
  return (
    <AnimatePresence>
      <motion.div
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full z-10"
      >
        <span className={`text-sm font-medium ${
          count >= limit ? "text-red-500" : "text-white"
        }`}>
          {count} / {limit}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};