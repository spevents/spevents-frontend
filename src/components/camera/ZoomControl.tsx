// src/components/camera/ZoomControl.tsx
import { motion } from "framer-motion";
import { MinusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ZoomControlProps {
  isVisible: boolean;
  zoomLevel: number;
  onToggleVisibility: () => void;
  onZoomChange: (zoom: number) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export const ZoomControl: React.FC<ZoomControlProps> = ({
  isVisible,
  zoomLevel,
  onToggleVisibility,
  onZoomChange,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const calculateZoomFromPosition = (clientX: number): number => {
    if (!sliderRef.current) return zoomLevel;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return MIN_ZOOM + (MAX_ZOOM - MIN_ZOOM) * percentage;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return; // Only process when primary button is pressed
    const newZoom = calculateZoomFromPosition(e.clientX);
    onZoomChange(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  };

  const handleClick = (e: React.MouseEvent) => {
    const newZoom = calculateZoomFromPosition(e.clientX);
    onZoomChange(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  };

  return (
    <>
      <motion.div 
        initial={false}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none" 
        }}
        className="absolute bottom-52 sm:bottom-56 left-1/2 transform -translate-x-1/2 w-64 bg-black/50 backdrop-blur-md rounded-full p-4 z-10"
      >
        <div 
          ref={sliderRef}
          className="relative h-1 bg-white/20 rounded-full cursor-pointer touch-none"
          onClick={handleClick}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
        >
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"
            style={{
              x: `calc(${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}% - 12px)`
            }}
          />
        </div>
        <div className="mt-2 text-center text-white/70 text-sm">
          {zoomLevel.toFixed(1)}x
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