import { motion } from "framer-motion";
import { MinusCircle } from "lucide-react";
import { useCallback } from "react";

interface ZoomControlProps {
  isVisible: boolean;
  zoomLevel: number;
  onToggleVisibility: () => void;
  onZoomChange: (zoom: number) => void;
}

// Adjusted zoom levels - reduced max zoom
const ZOOM_LEVELS = [0.5, 1.0, 1.1] as const;
type ZoomLevel = typeof ZOOM_LEVELS[number];

export const ZoomControl: React.FC<ZoomControlProps> = ({
  isVisible,
  zoomLevel,
  onToggleVisibility,
  onZoomChange,
}) => {
  const handleZoomClick = useCallback((level: ZoomLevel) => {
    onZoomChange(level);
  }, [onZoomChange]);

  return (
    <>
      <motion.div 
        initial={false}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none" 
        }}
        className="absolute bottom-52 sm:bottom-56 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full p-4 z-10"
      >
        <div className="flex items-center gap-2">
          {ZOOM_LEVELS.map((level) => (
            <motion.button
              key={level}
              onClick={() => handleZoomClick(level)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm transition-colors
                ${zoomLevel === level 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white hover:bg-white/30'
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
        className="absolute bottom-52 sm:bottom-56 right-4 bg-black/50 backdrop-blur-md p-3 rounded-full text-white z-10"
      >
        <MinusCircle className="w-6 h-6" />
      </motion.button>
    </>
  );
};