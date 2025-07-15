// src/components/slideshow_modes/MarqueeSlideshow.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Photo {
  src: string;
  id: string;
  createdAt: string;
}

interface MarqueeSlideshowProps {
  photos: Photo[];
  containerDimensions: { width: number; height: number }; // ← still accepted for API parity
  hideUI?: boolean;
}

const PHOTOS_PER_STRIP = 8; // photos rendered before pattern repeats once
const STRIP_COUNT = 3; // visible vertical strips per column
const ANIMATION_SECS = 50; // time for one full travel
const COLUMN_COUNT = 10; // how many columns across
const PHOTOS_NEEDED_PER_COLUMN = PHOTOS_PER_STRIP * STRIP_COUNT * 2; // double for seamless loop

export default function MarqueeSlideshow({ photos }: MarqueeSlideshowProps) {
  const [columnPhotos, setColumnPhotos] = useState<Photo[][]>([]);
  const previousIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (photos.length === 0) return;

    // newest first
    const sorted = [...photos].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // round‑robin into columns
    const columns: Photo[][] = Array.from({ length: COLUMN_COUNT }, () => []);
    sorted.forEach((p, idx) => columns[idx % COLUMN_COUNT].push(p));

    // pad / repeat so each column has enough for the loop
    const padded = columns.map((col) => {
      const out: Photo[] = [];
      for (let i = 0; i < PHOTOS_NEEDED_PER_COLUMN; i++) {
        out.push(col[i % col.length]);
      }
      return out;
    });

    setColumnPhotos(padded);
    previousIds.current = new Set(photos.map((p) => p.id));
  }, [photos]);

  /** When new photos arrive, splice them to the top of columns */
  useEffect(() => {
    if (photos.length === 0 || columnPhotos.length === 0) return;

    const currentIds = new Set(photos.map((p) => p.id));
    const newOnes = photos.filter((p) => !previousIds.current.has(p.id));
    if (newOnes.length === 0) return; // nothing new

    setColumnPhotos((prevCols) => {
      const next = prevCols.map((col) => [...col]); // shallow copy

      // add new photos round‑robin to the *front* of each column
      newOnes.forEach((p, idx) => {
        const cIdx = idx % COLUMN_COUNT;
        next[cIdx].unshift(p);
        // keep the array length stable
        if (next[cIdx].length > PHOTOS_NEEDED_PER_COLUMN) {
          next[cIdx] = next[cIdx].slice(0, PHOTOS_NEEDED_PER_COLUMN);
        }
      });

      return next;
    });

    previousIds.current = currentIds;
  }, [photos, columnPhotos.length]);

  /* ────────────────── render ────────────────── */
  if (photos.length === 0 || columnPhotos.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div className="h-full w-full flex justify-center gap-12 px-8">
        {columnPhotos.map((column, colIdx) => {
          const dir = colIdx % 2 === 0 ? 1 : -1; // alternate scroll direction

          return (
            <div
              key={`column-${colIdx}`}
              className="w-[300px] relative overflow-hidden"
            >
              <motion.div
                className="flex flex-col absolute inset-0 gap-4"
                animate={{ y: dir > 0 ? [0, "-50%"] : ["-50%", 0] }}
                transition={{
                  duration: ANIMATION_SECS,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                {/* duplicate for seamless loop */}
                {[...column, ...column].map((photo, idx) => (
                  <div
                    key={`${photo.id}-${idx}`}
                    className="relative flex-none w-full aspect-[9/16]"
                  >
                    <img
                      src={photo.src}
                      alt="Event"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
