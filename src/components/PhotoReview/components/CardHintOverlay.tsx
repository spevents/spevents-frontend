import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Info } from "lucide-react";

interface CardHintOverlayProps {
  isFirstVisit: boolean;
}

export const CardHintOverlay: React.FC<CardHintOverlayProps> = ({
  isFirstVisit,
}) => {
  const [showHint, setShowHint] = useState(isFirstVisit);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setShowHint(false);
        setHasInteracted(true);
      }
    };

    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("mousedown", handleInteraction);

    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
    };
  }, [hasInteracted]);

  return (
    <>
      <AnimatePresence>
        {showHint ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 pointer-events-none"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center mb-28"
              >
                <ArrowUp className="w-8 h-8 text-white mb-2" />
                <p className="text-white text-lg">Swipe up to upload</p>
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center mt-28"
              >
                <ArrowDown className="w-8 h-8 text-white mb-2" />
                <p className="text-white text-lg">Swipe down to delete</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          hasInteracted && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 backdrop-blur-sm 
              hover:bg-white/20 transition-colors"
              onClick={() => setShowHint(true)}
            >
              <Info className="w-5 h-5 text-white" />
            </motion.button>
          )
        )}
      </AnimatePresence>
    </>
  );
};
