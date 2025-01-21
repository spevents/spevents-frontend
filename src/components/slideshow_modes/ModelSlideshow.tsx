import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Scene from "../Scene";
import AnimatedBorder from "./AnimatedBorder";

interface ModelSlideshowProps {
  photos: {
    src: string;
    id: string;
    createdAt: string;
  }[];
  hideUI?: boolean;
}

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
      {/* Background gradients */}
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

      {/* Decorative frame */}
      <motion.div
        className="absolute inset-16 border-2 border-[#bf9b30] rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
      />

      {/* Main content container */}
      <motion.div
        className="text-center z-10 p-12 space-y-8"
      >
        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span 
            className="text-4xl md:text-5xl font-martel font-light tracking-wide"
            style={{
              background: "linear-gradient(135deg, #e8dcc4 0%, #bf9b30 50%, #e8dcc4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(232,220,196,0.2)",
            }}
          >
            Vanderbilt University's First Ever...
          </span>
        </motion.div>

        {/* Mock Shaadi title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-9xl md:text-[11rem] font-cinzel font-black leading-tight"
          style={{
            background: "linear-gradient(135deg, #bf9b30 0%, #e36414 50%, #bf9b30 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 40px rgba(191,155,48,0.3)",
            letterSpacing: "-0.02em"
          }}
        >
          Mock Shaadi
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          className="w-72 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#bf9b30] to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 2.5 }}
        />

        {/* Year 2025 */}
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

        {/* Venue */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="mt-12"
        >
          <span 
            className="text-5xl md:text-7xl font-martel font-light tracking-wide"
            style={{
              background: "linear-gradient(135deg, #e8dcc4 0%, #bf9b30 50%, #e8dcc4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(232,220,196,0.2)",
            }}
          >
            SLC Ballroom
          </span>
        </motion.div>

        {/* Decorative flourishes */}
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

interface TableProps {
  photos: {
    src: string;
    id: string;
    createdAt: string;
  }[];
  tableIndex: number;
  position: [number, number, number];
  side: "bride" | "groom";
}

const Table: React.FC<TableProps> = ({ photos, tableIndex, position }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length]);

  const photo = photos[currentPhotoIndex];
  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: tableIndex * 0.1,
      }}
      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        transform: `translate(${position[0] * 15}px, ${position[2] * 15}px)`,
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-48 h-32 bg-white/90 rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={photo.src}
              alt={`Event photo ${tableIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
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
      side: "bride" | "groom";
    }>
  >([]);

  useEffect(() => {
    // Lock scroll initially
    document.body.style.overflow = "hidden";

    const openingTimer = setTimeout(() => {
      setShowOpening(false);

      // Added 2 seconds to the content delay (from 1500 to 3500)
      const contentTimer = setTimeout(() => {
        setShowContent(true);
        // Unlock scroll after content appears
        document.body.style.overflow = "auto";
      }, 3500);

      return () => clearTimeout(contentTimer);
    }, 6000); // Increased from 4000 to 6000 to give more time to read

    return () => {
      clearTimeout(openingTimer);
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const groomTables: [number, number, number][] = [
      [-25, 0, -15],
      [-28, 0, 5],
      [-20, 0, -25],
      [-23, 0, 25],
    ];

    const brideTables: [number, number, number][] = [
      [25, 0, -15],
      [28, 0, 5],
      [20, 0, -25],
      [23, 0, 25],
    ];

    setTables([
      ...groomTables.map((position) => ({ position, side: "groom" as const })),
      ...brideTables.map((position) => ({ position, side: "bride" as const })),
    ]);
  }, []);

  return (
    <div className="w-full h-screen">
      <AnimatedBorder
        className="min-h-screen bg-[#790015] relative overflow-hidden"
        isMainContentVisible={showContent}
      >
        <AnimatePresence>
          {showOpening && (
            <OpeningSequence />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="relative w-full h-full"
            >
              <Scene />

              <div className="absolute inset-0 pointer-events-none">
                {tables.map((table, tableIndex) => (
                  <Table
                    key={`${table.side}-${tableIndex}`}
                    photos={photos}
                    tableIndex={tableIndex}
                    position={table.position}
                    side={table.side}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedBorder>
    </div>
  );
};

export default ModelSlideshow;