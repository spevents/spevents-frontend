// src/components/slideshow_modes/BuilderModelSlideshow.tsx
import { useState, useEffect } from "react";
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

const DISPLAY_DURATION = 6000;

const slideshowModes = [
  { id: "simple", name: "Classic", icon: Layout },
  { id: "fun", name: "Dynamic", icon: LayoutTemplate },
  { id: "presenter", name: "Presenter", icon: Presentation },
  { id: "marquee", name: "Marquee", icon: AlignHorizontalSpaceAround },
];

export default function BuilderModelSlideshow({
  photos,
  themeColors,
  selectedMode,
  onModeChange,
  hideUI = false,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}20)`,
        }}
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

  const mainPhoto = photos[currentIndex];
  const sidePhotos =
    photos.length > 1
      ? [
          photos[(currentIndex + 1) % photos.length],
          photos[(currentIndex + 2) % photos.length],
        ]
      : [mainPhoto, mainPhoto];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}20)`,
      }}
    >
      <div className="h-full flex p-4 gap-4">
        {/* Main photo */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={mainPhoto.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full rounded-lg overflow-hidden"
              style={{
                boxShadow: `0 0 20px ${themeColors.primary}40`,
              }}
            >
              <img
                src={mainPhoto.src}
                alt="Main photo"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  border: `3px solid ${themeColors.secondary}60`,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side photos */}
        <div className="w-1/3 grid grid-rows-2 gap-4">
          {sidePhotos.map((photo, index) => (
            <AnimatePresence key={`side-${index}`} mode="wait">
              <motion.div
                key={`${photo.id}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: (index + 1) * 0.2, duration: 0.5 }}
                className="w-full h-full rounded-lg overflow-hidden"
                style={{
                  boxShadow: `0 0 15px ${themeColors.primary}30`,
                }}
              >
                <img
                  src={photo.src}
                  alt={`Side photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    border: `2px solid ${themeColors.secondary}40`,
                  }}
                />
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      </div>

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

      {!hideUI && photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-6 h-2"
                    : "w-2 h-2 hover:bg-white/50"
                }`}
                style={{
                  backgroundColor:
                    index === currentIndex
                      ? themeColors.secondary
                      : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: themeColors.primary + "80",
          color: "white",
        }}
      >
        Elegant Mode
      </div>
    </div>
  );
}
