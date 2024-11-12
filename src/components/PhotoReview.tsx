import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Photo {
  id: number;
  url: string;
}

const SWIPE_THRESHOLD_PERCENTAGE = 0.4;
const ACTIVATION_THRESHOLD_PERCENTAGE = 0.3;

const PhotoReview = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragPosition, setDragPosition] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    const sessionPhotos = JSON.parse(
      sessionStorage.getItem("temp-photos") || "[]"
    );
    setPhotos(sessionPhotos);

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragUpdate = (_: any, info: PanInfo) => {
    setDragPosition(info.offset.y);
  };

  const handleDragEnd = async (photoId: number, info: PanInfo) => {
    setIsDragging(false);
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    const swipeThreshold = screenHeight * SWIPE_THRESHOLD_PERCENTAGE;

    if (Math.abs(info.velocity.y) > 500) {
      // Fast swipe - trigger action regardless of distance
      handlePhotoAction(photo, info.offset.y < 0);
    } else if (Math.abs(info.offset.y) > swipeThreshold) {
      // Regular swipe - check threshold
      handlePhotoAction(photo, info.offset.y < 0);
    } else {
      // Not swiped far enough - spring back
      setDragPosition(0);
    }
  };

  const handlePhotoAction = async (photo: Photo, isUpward: boolean) => {
    if (isUpward) {
      setIsUploading(true);
      try {
        // First remove the photo from local state to prevent multiple uploads
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setDragPosition(0);

        // Convert base64 to blob
        const response = await fetch(photo.url);
        const blob = await response.blob();

        // Upload to Supabase Storage
        const fileName = `photo-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("gallery-photos")
          .upload(fileName, blob, {
            contentType: "image/jpeg",
          });

        if (uploadError) {
          // If upload fails, add the photo back to the state
          setPhotos((prev) => [...prev, photo]);
          throw uploadError;
        }

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("gallery-photos").getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase.from("photos").insert([
          {
            url: publicUrl,
            created_at: new Date().toISOString(),
          },
        ]);

        if (dbError) {
          // If database insert fails, add the photo back to the state
          setPhotos((prev) => [...prev, photo]);
          throw dbError;
        }
      } catch (error) {
        console.error("Failed to upload photo:", error);
        // You might want to add an error toast here
      } finally {
        setIsUploading(false);
      }
    } else {
      // For delete, immediately remove from state
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setDragPosition(0);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <h2 className="text-white text-xl mb-8">All photos reviewed!</h2>
        <button
          onClick={() => {
            sessionStorage.removeItem("temp-photos");
            navigate("/gallery");
          }}
          className="bg-white/20 backdrop-blur-lg p-3 rounded-full"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {isUploading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full z-50">
          <span className="text-white text-sm">Uploading photo...</span>
        </div>
      )}

      <div className="h-full flex items-center justify-center p-6 pb-40 -mt-20">
        <div className="relative w-full max-w-md">
          <AnimatePresence mode="popLayout">
            {photos.map((photo, index) => {
              const dragPercentage = Math.abs(dragPosition / screenHeight);
              const isNearThreshold =
                dragPercentage >= ACTIVATION_THRESHOLD_PERCENTAGE;
              const isOverThreshold =
                dragPercentage >= SWIPE_THRESHOLD_PERCENTAGE;

              return (
                <motion.div
                  key={photo.id}
                  className="absolute w-full cursor-grab active:cursor-grabbing"
                  style={{
                    zIndex: photos.length - index,
                  }}
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                    y: index * -8,
                    rotateZ: index * -2,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: index * -8,
                    rotateZ: index * -2,
                  }}
                  exit={{
                    scale: dragPosition < 0 ? 1.1 : 0.8,
                    opacity: 0,
                    y: dragPosition < 0 ? -1000 : 500,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={1}
                  onDragStart={handleDragStart}
                  onDrag={handleDragUpdate}
                  onDragEnd={(_, info) => handleDragEnd(photo.id, info)}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
                    <img
                      src={photo.url}
                      alt="Review"
                      className="w-full aspect-[3/4] object-cover"
                      draggable="false"
                    />

                    <motion.div
                      className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-green-500/50 to-transparent 
                               flex items-start justify-center pt-8 transition-colors duration-200
                               ${
                                 isOverThreshold && dragPosition < 0
                                   ? "from-green-400"
                                   : ""
                               }`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: dragPosition < 0 && isDragging ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col items-center">
                        <ArrowUp
                          className={`w-8 h-8 text-white mb-2 transition-transform duration-200
                          ${
                            isNearThreshold && dragPosition < 0
                              ? "scale-125"
                              : ""
                          }`}
                        />
                        <p className="text-white text-sm font-medium">
                          {isOverThreshold && dragPosition < 0
                            ? "Release to add"
                            : "Keep sliding up"}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-red-500/50 to-transparent 
                               flex items-end justify-center pb-8 transition-colors duration-200
                               ${
                                 isOverThreshold && dragPosition > 0
                                   ? "from-red-400"
                                   : ""
                               }`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: dragPosition > 0 && isDragging ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col items-center">
                        <ArrowDown
                          className={`w-8 h-8 text-white mb-2 transition-transform duration-200
                          ${
                            isNearThreshold && dragPosition > 0
                              ? "scale-125"
                              : ""
                          }`}
                        />
                        <p className="text-white text-sm font-medium">
                          {isOverThreshold && dragPosition > 0
                            ? "Release to delete"
                            : "Keep sliding down"}
                        </p>
                      </div>
                    </motion.div>
                  </div>
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
