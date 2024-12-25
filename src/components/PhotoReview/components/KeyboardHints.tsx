import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const KeyboardHints: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 
            bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg text-white/70
            text-sm space-y-1"
        >
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border border-white/30 rounded flex items-center justify-center">←</div>
              <div className="w-6 h-6 border border-white/30 rounded flex items-center justify-center">→</div>
              <span>Navigate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border border-white/30 rounded flex items-center justify-center">↑</div>
              <span>Upload</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border border-white/30 rounded flex items-center justify-center">↓</div>
              <span>Delete</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};