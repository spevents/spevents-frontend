// src/components/slideshow_modes/SimpleSlideshow.tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "lucide-react";

interface GridPhoto {
  src: string;
  id: string;
  createdAt: string;
  gridPosition: { row: number; col: number };
  gridSize: { rows: number; cols: number };
  fadeInTime: number;
}

interface SimpleSlideshowProps {
  photos: Array<{ src: string; id: string; createdAt: string }>;
  containerDimensions: { width: number; height: number };
  themeColors: { primary: string; secondary: string };
  hideUI?: boolean;
}

const PHOTO_DISPLAY_TIME = 3000;
const FADE_DURATION = 800;
const GRID_COLS = 6;
const GRID_ROWS = 4;
const GAP = 8;

// Photo size variants (in grid cells)
const gridSizes = [
  { rows: 1, cols: 1, weight: 4 }, // 1x1
  { rows: 1, cols: 2, weight: 3 }, // 1x2
  { rows: 2, cols: 1, weight: 3 }, // 2x1
  { rows: 2, cols: 2, weight: 2 }, // 2x2
  { rows: 1, cols: 3, weight: 1 }, // 1x3
  { rows: 3, cols: 1, weight: 1 }, // 3x1
  { rows: 2, cols: 3, weight: 1 }, // 2x3
];

function getRandomGridSize() {
  const totalWeight = gridSizes.reduce((sum, size) => sum + size.weight, 0);
  let random = Math.random() * totalWeight;

  for (const size of gridSizes) {
    random -= size.weight;
    if (random <= 0) {
      return size;
    }
  }
  return gridSizes[0];
}

function findValidGridPosition(
  gridSize: { rows: number; cols: number },
  occupiedCells: boolean[][],
  maxAttempts = 50,
): { row: number; col: number } | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const maxRow = GRID_ROWS - gridSize.rows;
    const maxCol = GRID_COLS - gridSize.cols;

    const row = Math.floor(Math.random() * (maxRow + 1));
    const col = Math.floor(Math.random() * (maxCol + 1));

    // Check if area is free
    let canPlace = true;
    for (let r = row; r < row + gridSize.rows && canPlace; r++) {
      for (let c = col; c < col + gridSize.cols && canPlace; c++) {
        if (occupiedCells[r]?.[c]) {
          canPlace = false;
        }
      }
    }

    if (canPlace) {
      return { row, col };
    }
  }
  return null;
}

function markCellsOccupied(
  occupiedCells: boolean[][],
  position: { row: number; col: number },
  size: { rows: number; cols: number },
  occupied: boolean,
) {
  for (let r = position.row; r < position.row + size.rows; r++) {
    for (let c = position.col; c < position.col + size.cols; c++) {
      if (!occupiedCells[r]) occupiedCells[r] = [];
      occupiedCells[r][c] = occupied;
    }
  }
}

export default function SimpleSlideshow({
  photos,
  containerDimensions,
  themeColors,
}: SimpleSlideshowProps) {
  const [gridPhotos, setGridPhotos] = useState<GridPhoto[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [_occupiedCells, setOccupiedCells] = useState<boolean[][]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const cellWidth =
    (containerDimensions.width - GAP * (GRID_COLS + 1)) / GRID_COLS;
  const cellHeight =
    (containerDimensions.height - GAP * (GRID_ROWS + 1)) / GRID_ROWS;

  // Initialize grid
  useEffect(() => {
    if (photos.length === 0) {
      setGridPhotos([]);
      setOccupiedCells([]);
      return;
    }

    const newOccupiedCells: boolean[][] = Array(GRID_ROWS)
      .fill(null)
      .map(() => Array(GRID_COLS).fill(false));
    const initialPhotos: GridPhoto[] = [];

    // Fill initial grid
    let currentPhotoIndex = 0;
    while (currentPhotoIndex < photos.length && initialPhotos.length < 12) {
      const photo = photos[currentPhotoIndex];
      const gridSize = getRandomGridSize();
      const position = findValidGridPosition(gridSize, newOccupiedCells);

      if (position) {
        markCellsOccupied(newOccupiedCells, position, gridSize, true);
        initialPhotos.push({
          ...photo,
          gridPosition: position,
          gridSize,
          fadeInTime: Date.now() + currentPhotoIndex * 200,
        });
      }

      currentPhotoIndex++;
    }

    setGridPhotos(initialPhotos);
    setOccupiedCells(newOccupiedCells);
    setPhotoIndex(currentPhotoIndex);
  }, [photos, containerDimensions]);

  // Auto-advance photos
  useEffect(() => {
    if (photos.length <= 1) return;

    const scheduleNextPhoto = () => {
      timeoutRef.current = setTimeout(() => {
        setGridPhotos((prev) => {
          if (prev.length === 0) return prev;

          // Find oldest photo
          let oldestIndex = 0;
          let oldestTime = prev[0].fadeInTime;
          prev.forEach((photo, index) => {
            if (photo.fadeInTime < oldestTime) {
              oldestTime = photo.fadeInTime;
              oldestIndex = index;
            }
          });

          const oldPhoto = prev[oldestIndex];

          // Update occupied cells
          setOccupiedCells((currentCells) => {
            const newCells = currentCells.map((row) => [...row]);
            markCellsOccupied(
              newCells,
              oldPhoto.gridPosition,
              oldPhoto.gridSize,
              false,
            );

            // Try to place new photo
            const newPhoto = photos[photoIndex % photos.length];
            const gridSize = getRandomGridSize();
            const position = findValidGridPosition(gridSize, newCells);

            if (position) {
              markCellsOccupied(newCells, position, gridSize, true);

              const newGridPhoto: GridPhoto = {
                ...newPhoto,
                gridPosition: position,
                gridSize,
                fadeInTime: Date.now(),
              };

              // Update photos
              setTimeout(() => {
                setGridPhotos((current) => {
                  const updated = [...current];
                  updated[oldestIndex] = newGridPhoto;
                  return updated;
                });
              }, 100);
            }

            return newCells;
          });

          return prev;
        });

        setPhotoIndex((prev) => prev + 1);
        scheduleNextPhoto();
      }, PHOTO_DISPLAY_TIME);
    };

    scheduleNextPhoto();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [photos.length, photoIndex]);

  if (photos.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-24 h-24 rounded-lg mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${themeColors.primary}20` }}
          >
            <Layout size={32} style={{ color: themeColors.primary }} />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Waiting for photos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ padding: GAP }}
    >
      <AnimatePresence mode="popLayout">
        {gridPhotos.map((photo) => {
          const x = photo.gridPosition.col * (cellWidth + GAP);
          const y = photo.gridPosition.row * (cellHeight + GAP);
          const width =
            photo.gridSize.cols * cellWidth + (photo.gridSize.cols - 1) * GAP;
          const height =
            photo.gridSize.rows * cellHeight + (photo.gridSize.rows - 1) * GAP;

          return (
            <motion.div
              key={`${photo.id}-${photo.fadeInTime}`}
              className="absolute rounded-lg overflow-hidden shadow-xl"
              style={{
                left: x,
                top: y,
                width,
                height,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                opacity: { duration: FADE_DURATION / 1000 },
                scale: { duration: 0.4, ease: "easeOut" },
              }}
            >
              <div
                className="w-full h-full p-2 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden"
                style={{
                  backgroundColor: themeColors.secondary + "90",
                  border: `2px solid ${themeColors.primary}60`,
                  boxShadow: `0 0 20px ${themeColors.primary}30`,
                }}
              >
                <img
                  src={photo.src}
                  alt="Event photo"
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
