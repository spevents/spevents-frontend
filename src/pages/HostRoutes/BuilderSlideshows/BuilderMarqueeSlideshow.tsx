// src/components/slideshow_modes/BuilderMarqueeSlideshow.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Layout,
  LayoutTemplate,
  Presentation,
  Hotel,
  AlignHorizontalSpaceAround,
} from "lucide-react";

interface Photo {
  src: string;
  id: string;
  createdAt: string;
}

interface Props {
  photos: Photo[];
  containerDimensions: { width: number; height: number };
  themeColors: { primary: string; secondary: string };
  selectedMode: string;
  onModeChange: (mode: string) => void;
  hideUI?: boolean;
}

const PHOTOS_PER_STRIP = 6;
const STRIP_COUNT = 3;
const ANIMATION_SECS = 30;
const COLUMN_COUNT = 6;

const slideshowModes = [
  { id: "simple", name: "Classic", icon: Layout },
  { id: "fun", name: "Dynamic", icon: LayoutTemplate },
  { id: "presenter", name: "Presenter", icon: Presentation },
  { id: "model", name: "Elegant", icon: Hotel },
  { id: "marquee", name: "Marquee", icon: AlignHorizontalSpaceAround },
];

export default function BuilderMarqueeSlideshow({
  photos,
  themeColors,
  selectedMode,
  onModeChange,
  hideUI = false,
}: Props) {
  const [columnPhotos, setColumnPhotos] = useState<Photo[][]>([]);
  const previousIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (photos.length === 0) return;

    const sorted = [...photos].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const columns: Photo[][] = Array.from({ length: COLUMN_COUNT }, () => []);
    sorted.forEach((p, idx) => columns[idx % COLUMN_COUNT].push(p));

    const photosNeeded = PHOTOS_PER_STRIP * STRIP_COUNT * 2;
    const padded = columns.map((col) => {
      const out: Photo[] = [];
      for (let i = 0; i < photosNeeded; i++) {
        out.push(col[i % col.length]);
      }
      return out;
    });

    setColumnPhotos(padded);
    previousIds.current = new Set(photos.map((p) => p.id));
  }, [photos]);

  if (photos.length === 0 || columnPhotos.length === 0) {
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

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}20)`,
      }}
    >
      <div className="h-full w-full flex justify-center gap-4 px-4">
        {columnPhotos.map((column, colIdx) => {
          const dir = colIdx % 2 === 0 ? 1 : -1;

          return (
            <div
              key={`column-${colIdx}`}
              className="w-[120px] relative overflow-hidden"
            >
              <motion.div
                className="flex flex-col absolute inset-0 gap-3"
                animate={{ y: dir > 0 ? [0, "-50%"] : ["-50%", 0] }}
                transition={{
                  duration: ANIMATION_SECS,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                {[...column, ...column].map((photo, idx) => (
                  <div
                    key={`${photo.id}-${idx}`}
                    className="relative flex-none w-full aspect-[9/16]"
                  >
                    <img
                      src={photo.src}
                      alt="Event"
                      className="w-full h-full object-cover rounded-lg"
                      style={{
                        border: `2px solid ${themeColors.secondary}`,
                        boxShadow: `0 0 10px ${themeColors.primary}30`,
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
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

      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: themeColors.primary + "80",
          color: "white",
        }}
      >
        Marquee Mode
      </div>
    </div>
  );
}
