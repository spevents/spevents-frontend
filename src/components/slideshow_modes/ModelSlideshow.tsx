// src/components/ModelSlideshow.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "../Scene";
import AnimatedBorder from "./AnimatedBorder";

interface ModelSlideshowProps {
  photos: {
    src: string;
    id: string;
    createdAt: string;
  }[];
  hideUI?: boolean;
  containerDimensions: { width: number; height: number };
}

interface TableProps {
  photos: {
    src: string;
    id: string;
    createdAt: string;
  }[];
  tableIndex: number;
  position: [number, number, number];
  camera: THREE.Camera;
}

// Helper component to get camera and convert 3D position to screen coordinates
const PhotoPositioner = ({
  onCameraReady,
}: {
  onCameraReady: (camera: THREE.Camera) => void;
}) => {
  const { camera } = useThree();

  useEffect(() => {
    if (camera) {
      onCameraReady(camera);
    }
  }, [camera, onCameraReady]);

  return null;
};

const OpeningSequence = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: "blur(10px)",
      }}
      transition={{
        duration: 2,
        ease: "easeOut",
      }}
      className="fixed inset-0 flex flex-col items-center justify-center z-40"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(227,100,20,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(191,155,48,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(191,155,48,0.1),_transparent_50%)]" />
      </motion.div>

      <motion.div
        className="absolute inset-16 border-2 border-[#bf9b30] rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
      />

      <motion.div className="text-center z-10 p-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span
            className="text-4xl md:text-5xl font-martel font-light tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, #e8dcc4 0%, #bf9b30 50%, #e8dcc4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(232,220,196,0.2)",
            }}
          >
            Vanderbilt University's First Ever...
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-9xl md:text-[11rem] font-cinzel font-black leading-tight"
          style={{
            background:
              "linear-gradient(135deg, #bf9b30 0%, #e36414 50%, #bf9b30 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 40px rgba(191,155,48,0.3)",
            letterSpacing: "-0.02em",
          }}
        >
          Mock Shaadi
        </motion.h1>

        <motion.div
          className="w-72 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#bf9b30] to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 2.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 3 }}
        >
          <span
            className="text-8xl md:text-[10rem] font-cinzel"
            style={{
              color: "#e8dcc4",
              textShadow: "0 0 20px rgba(232,220,196,0.3)",
            }}
          >
            2025
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="mt-12"
        >
          <span
            className="text-5xl md:text-7xl font-martel font-light tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, #e8dcc4 0%, #bf9b30 50%, #e8dcc4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(232,220,196,0.2)",
            }}
          >
            SLC Ballroom
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-24 flex justify-center items-center gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 4 }}
        >
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#bf9b30] to-transparent" />
          <div className="w-4 h-4 rounded-full bg-[#e36414]" />
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#bf9b30] to-transparent" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const Table: React.FC<TableProps> = ({
  photos,
  tableIndex,
  position,
  camera,
}) => {
  // Distribute photos across tables, each table gets different starting photos
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(
    tableIndex % photos.length,
  );
  const [isVisible, setIsVisible] = useState(true);
  const worldPos = new THREE.Vector3(...position);
  const screenPos = worldPos.clone().project(camera);

  useEffect(() => {
    const baseInterval = 6000; // Slower cycling
    const staggerDelay = tableIndex * 800; // More staggered starts

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => {
          // Cycle through photos in order, but each table starts at different point
          setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
          setIsVisible(true);
        }, 800);
      }, baseInterval);

      return () => clearInterval(interval);
    }, staggerDelay);

    return () => clearTimeout(timeout);
  }, [photos.length, tableIndex]);

  const photo = photos[currentPhotoIndex];
  if (!photo) return null;

  const x = ((screenPos.x + 1) / 2) * window.innerWidth;
  const y = (-(screenPos.y - 1) / 2) * window.innerHeight;

  const baseScale = Math.max(0.4, 0.8 - Math.abs(position[2]) / 60);
  const finalScale = baseScale * 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: tableIndex * 0.1 }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${finalScale})`,
        zIndex: Math.round(1000 - position[2]),
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative w-28 h-20 bg-white rounded-lg overflow-hidden shadow-lg border border-yellow-200"
            style={{
              boxShadow:
                "0 4px 20px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,255,255,0.8)",
            }}
          >
            <img
              src={photo.src}
              alt={`Table ${tableIndex + 1} photo`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/10 to-transparent" />
            <div className="absolute inset-1 border border-yellow-100/50 rounded pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ModelSlideshow: React.FC<ModelSlideshowProps> = ({ photos }) => {
  const [showOpening, setShowOpening] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [tables, setTables] = useState<
    Array<{
      position: [number, number, number];
    }>
  >([]);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);

  const handleCameraReady = (cam: THREE.Camera) => {
    setCamera(cam);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const openingTimer = setTimeout(() => {
      setShowOpening(false);
      const contentTimer = setTimeout(() => {
        setShowContent(true);
        document.body.style.overflow = "auto";
      }, 3500);
      return () => clearTimeout(contentTimer);
    }, 6000);

    return () => {
      clearTimeout(openingTimer);
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    // 9 tables arranged in 3 columns (left, center, right) representing SLC Ballroom layout
    const tablePositions: [number, number, number][] = [
      // Left column (3 tables)
      [-24, 0, -8], // Front left
      [-24, 0, 8], // Middle left
      [-24, 0, 24], // Back left

      // Center column (3 tables)
      [0, 0, 4], // Front center
      [0, 0, 20], // Middle center
      [0, 0, 36], // Back center

      // Right column (3 tables)
      [24, 0, -8], // Front right
      [24, 0, 8], // Middle right
      [24, 0, 24], // Back right
    ];

    setTables(tablePositions.map((position) => ({ position })));
  }, []);

  return (
    <div className="w-full h-screen">
      <AnimatedBorder
        className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden"
        isMainContentVisible={showContent}
      >
        <AnimatePresence>{showOpening && <OpeningSequence />}</AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="relative w-full h-full"
            >
              <Scene>
                <PhotoPositioner onCameraReady={handleCameraReady} />
              </Scene>

              {camera && (
                <div className="absolute inset-0 pointer-events-none">
                  {tables.map((table, tableIndex) => (
                    <Table
                      key={`table-${tableIndex}`}
                      photos={photos}
                      tableIndex={tableIndex}
                      position={table.position}
                      camera={camera}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedBorder>
    </div>
  );
};

export default ModelSlideshow;
