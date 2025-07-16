// src/components/slideshow_modes/BuilderPresenterSlideshow.tsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  LayoutTemplate,
  Presentation,
  AlignHorizontalSpaceAround,
} from "lucide-react";

interface Props {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  containerDimensions: { width: number; height: number };
  themeColors: { primary: string; secondary: string };
  selectedMode: string;
  onModeChange: (mode: string) => void;
  hideUI?: boolean;
}

const DISPLAY_DURATION = 5000;
const PHOTOS_PER_SET = 3;

const slideshowModes = [
  { id: "simple", name: "Classic", icon: Layout },
  { id: "fun", name: "Dynamic", icon: LayoutTemplate },
  { id: "presenter", name: "Presenter", icon: Presentation },
  { id: "marquee", name: "Marquee", icon: AlignHorizontalSpaceAround },
];

export default function BuilderPresenterSlideshow({
  photos,
  themeColors,
  selectedMode,
  onModeChange,
  hideUI = false,
}: Props) {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const photoSets = useMemo(() => {
    const sets = [];
    let currentSet = [];

    const getWrappedPhoto = (index: number) => photos[index % photos.length];

    for (
      let i = 0;
      i < Math.ceil(photos.length / PHOTOS_PER_SET) * PHOTOS_PER_SET;
      i++
    ) {
      currentSet.push(getWrappedPhoto(i));

      if (currentSet.length === PHOTOS_PER_SET) {
        sets.push(currentSet);
        currentSet = [];
      }
    }

    return sets;
  }, [photos]);

  const totalSets = photoSets.length;

  useEffect(() => {
    if (totalSets <= 1) return;

    const interval = setInterval(() => {
      setCurrentSetIndex((prev) => (prev + 1) % totalSets);
    }, DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, [totalSets]);

  if (photos.length === 0) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ backgroundColor: themeColors.primary + "20" }}
      >
        <p className="text-gray-400 text-lg">No photos available</p>

        {!hideUI && (
          <div className="absolute top-4 right-4">
            <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-lg p-1">
              {slideshowModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`p-2 rounded-md transition-colors ${
                      selectedMode === mode.id
                        ? "bg-white text-black"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    title={mode.name}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}20)`,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSetIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-4xl grid grid-cols-3 gap-6">
            {photoSets[currentSetIndex].map((photo, index) => (
              <motion.div
                key={`${photo.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden"
                style={{
                  boxShadow: `0 0 20px ${themeColors.primary}30`,
                }}
              >
                <img
                  src={photo.src}
                  alt="Event photo"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    border: `2px solid ${themeColors.secondary}80`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {!hideUI && (
        <div className="absolute top-4 right-4">
          <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-lg p-1">
            {slideshowModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  className={`p-2 rounded-md transition-colors ${
                    selectedMode === mode.id
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  title={mode.name}
                >
                  <IconComponent size={16} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hideUI && totalSets > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            {Array.from({ length: totalSets }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSetIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSetIndex
                    ? "w-6 h-2"
                    : "w-2 h-2 hover:bg-white/50"
                }`}
                style={{
                  backgroundColor:
                    index === currentSetIndex
                      ? themeColors.secondary
                      : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
