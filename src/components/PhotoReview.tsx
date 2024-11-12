import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Photo {
  id: number;
  url: string;
}

// Reduced thresholds for easier activation
const SWIPE_THRESHOLD_PERCENTAGE = 0.25; // Reduced from 0.4
const ACTIVATION_THRESHOLD_PERCENTAGE = 0.15; // Reduced from 0.3

// Spring animations config for bouncy feel
const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const bounceTransition = {
  type: "spring",
  bounce: 0.4,
  duration: 0.6,
};

const PhotoReview = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState<Set<number>>(new Set());
  const [dragPosition, setDragPosition] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [exitDirection, setExitDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const updateScreenHeight = () => setScreenHeight(window.innerHeight);
    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    const sessionPhotos = JSON.parse(sessionStorage.getItem("temp-photos") || "[]");
    setPhotos(sessionPhotos);

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, []);

  const handleDragStart = () => setIsDragging(true);

  const handleDragUpdate = (_: any, info: PanInfo) => {
    // Add some elasticity to the drag
    const elasticDrag = info.offset.y * 0.85;
    setDragPosition(elasticDrag);
  };

  const handleDragEnd = async (photoId: number, info: PanInfo) => {
    setIsDragging(false);
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    const swipeThreshold = screenHeight * SWIPE_THRESHOLD_PERCENTAGE;

    if (Math.abs(info.velocity.y) > 400 || Math.abs(info.offset.y) > swipeThreshold) {
      const isUpward = info.offset.y < 0;
      setExitDirection(isUpward ? 'up' : 'down');

      if (isUpward && processingPhotos.has(photo.id)) return;
      handlePhotoAction(photo, isUpward);
    } else {
      // Smooth return to center
      setDragPosition(0);
    }
  };

  const handlePhotoAction = async (photo: Photo, isUpward: boolean) => {
    if (isUpward) {
      setProcessingPhotos(prev => new Set(prev).add(photo.id));
      setIsUploading(true);

      try {
        setPhotos(prev => prev.filter(p => p.id !== photo.id));
        setDragPosition(0);

        const response = await fetch(photo.url);
        const blob = await response.blob();
        const fileName = `photo-${Date.now()}.jpg`;
        
        await supabase.storage
          .from("gallery-photos")
          .upload(fileName, blob, {
            contentType: "image/jpeg",
          });

        const { data: { publicUrl } } = supabase.storage
          .from("gallery-photos")
          .getPublicUrl(fileName);

        await supabase.from("photos").insert([{
          url: publicUrl,
          created_at: new Date().toISOString(),
        }]);

      } catch (error) {
        console.error("Failed to process photo:", error);
        if (processingPhotos.has(photo.id)) {
          setPhotos(prev => prev.some(p => p.id === photo.id) ? prev : [...prev, photo]);
        }
      } finally {
        setProcessingPhotos(prev => {
          const newSet = new Set(prev);
          newSet.delete(photo.id);
          return newSet;
        });
        setIsUploading(false);
        setExitDirection(null);
      }
    } else {
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      setDragPosition(0);
    }
  };

  if (photos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={bounceTransition}
        className="fixed inset-0 bg-black flex flex-col items-center justify-center"
      >
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={bounceTransition}
          className="text-white text-xl mb-8"
        >
          All photos reviewed!
        </motion.h2>
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={springConfig}
          onClick={() => {
            sessionStorage.removeItem("temp-photos");
            navigate("/gallery");
          }}
          className="bg-white/20 backdrop-blur-lg p-3 rounded-full"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {isUploading && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full z-50"
        >
          <span className="text-white text-sm">Uploading photo...</span>
        </motion.div>
      )}

      <div className="h-full flex items-center justify-center p-6 pb-40 -mt-20">
        <div className="relative w-full max-w-md">
          <AnimatePresence mode="popLayout">
            {photos.map((photo, index) => {
              const dragPercentage = Math.abs(dragPosition / screenHeight);
              const isNearThreshold = dragPercentage >= ACTIVATION_THRESHOLD_PERCENTAGE;
              const isOverThreshold = dragPercentage >= SWIPE_THRESHOLD_PERCENTAGE;

              return (
                <motion.div
                  key={photo.id}
                  className="absolute w-full cursor-grab active:cursor-grabbing"
                  style={{ zIndex: photos.length - index }}
                  initial={{ scale: 0.8, opacity: 0, y: index * -8 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1,
                    y: index * -8,
                    transition: {
                      ...springConfig,
                      delay: index * 0.05
                    }
                  }}
                  exit={{
                    scale: dragPosition < 0 ? 1.1 : 0.8,
                    opacity: 0,
                    y: dragPosition < 0 ? -screenHeight : screenHeight,
                    transition: {
                      ...bounceTransition,
                      duration: 0.4
                    }
                  }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.15} // More elastic feel
                  onDragStart={handleDragStart}
                  onDrag={handleDragUpdate}
                  onDragEnd={(_, info) => handleDragEnd(photo.id, info)}
                >
                  <motion.div 
                    className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
                    animate={{
                      rotate: isDragging ? (dragPosition * 0.02) : 0,
                      scale: isDragging ? 1.02 : 1
                    }}
                    transition={springConfig}
                  >
                    <img
                      src={photo.url}
                      alt="Review"
                      className="w-full aspect-[3/4] object-cover"
                      draggable="false"
                    />

                    <motion.div
                      className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-green-500/50 to-transparent 
                               flex items-start justify-center pt-8"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: dragPosition < 0 && isDragging ? 1 : 0,
                        background: isOverThreshold && dragPosition < 0 ? 
                          "linear-gradient(to bottom, rgba(34, 197, 94, 0.7), transparent)" : 
                          "linear-gradient(to bottom, rgba(34, 197, 94, 0.5), transparent)"
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={{
                            y: isNearThreshold && dragPosition < 0 ? -8 : 0,
                            scale: isNearThreshold && dragPosition < 0 ? 1.2 : 1
                          }}
                          transition={springConfig}
                        >
                          <ArrowUp className="w-8 h-8 text-white mb-2" />
                        </motion.div>
                        <motion.p 
                          className="text-white text-sm font-medium"
                          animate={{ 
                            scale: isOverThreshold && dragPosition < 0 ? 1.1 : 1,
                            opacity: isDragging ? 1 : 0.8
                          }}
                          transition={springConfig}
                        >
                          {isOverThreshold && dragPosition < 0 ? "Release to add" : "Keep sliding up"}
                        </motion.p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-red-500/50 to-transparent 
                               flex items-end justify-center pb-8"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: dragPosition > 0 && isDragging ? 1 : 0,
                        background: isOverThreshold && dragPosition > 0 ?
                          "linear-gradient(to top, rgba(239, 68, 68, 0.7), transparent)" :
                          "linear-gradient(to top, rgba(239, 68, 68, 0.5), transparent)"
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={{
                            y: isNearThreshold && dragPosition > 0 ? 8 : 0,
                            scale: isNearThreshold && dragPosition > 0 ? 1.2 : 1
                          }}
                          transition={springConfig}
                        >
                          <ArrowDown className="w-8 h-8 text-white mb-2" />
                        </motion.div>
                        <motion.p 
                          className="text-white text-sm font-medium"
                          animate={{ 
                            scale: isOverThreshold && dragPosition > 0 ? 1.1 : 1,
                            opacity: isDragging ? 1 : 0.8
                          }}
                          transition={springConfig}
                        >
                          {isOverThreshold && dragPosition > 0 ? "Release to delete" : "Keep sliding down"}
                        </motion.p>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PhotoReview;