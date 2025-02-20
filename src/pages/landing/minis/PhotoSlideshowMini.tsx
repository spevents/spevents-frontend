// src/components/PhotoSlideshowMini.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import MiniPresenterSlideshow from "./MiniPresenterSlideshow";

interface Photo {
  id: number;
  url: string;
}

interface PhotoSlideshowMiniProps {
  photos: Photo[];
  expanded?: boolean;
  onPhotoDelete?: (photo: Photo) => void;
}

export default function PhotoSlideshowMini({
  photos,
  expanded = false,
  onPhotoDelete,
}: PhotoSlideshowMiniProps) {
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);

  const handleDelete = (photo: Photo) => {
    setDeletingPhotoId(photo.id);
    setTimeout(() => {
      if (onPhotoDelete) {
        onPhotoDelete(photo);
      }
      setDeletingPhotoId(null);
    }, 300);
  };

  if (photos.length === 0) {
    return (
      <motion.div
        className={`w-full relative rounded-2xl overflow-hidden bg-black/5`}
        animate={{ height: expanded ? 672 : 384 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex items-center justify-center text-brunswick-green/50">
          Swipe up on photos below to add them to the gallery
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full relative rounded-2xl overflow-hidden bg-black/5"
      animate={{ height: expanded ? 672 : 384 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="absolute inset-0">
        <MiniPresenterSlideshow
          photos={photos}
          deletingPhotoId={deletingPhotoId}
          onDeletePhoto={handleDelete}
        />
      </div>
    </motion.div>
  );
}
