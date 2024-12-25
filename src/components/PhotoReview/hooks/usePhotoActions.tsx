import { useState } from "react";
import { getPresignedUrl } from "../../../lib/aws";

interface Photo {
  id: number;
  url: string;
}

export const usePhotoActions = (
  photos: Photo[],
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>,
  currentPhotoIndex: number,
  setCurrentPhotoIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  const [processingPhotos, setProcessingPhotos] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoAction = async (photo: Photo, isUpward: boolean) => {
    const currentIndex = currentPhotoIndex;
    const totalPhotos = photos.length;

    if (isUpward) {
      setProcessingPhotos((prev) => new Set(prev).add(photo.id));
      setIsUploading(true);

      try {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));

        if (currentIndex === totalPhotos - 1 && currentIndex > 0) {
          setCurrentPhotoIndex(currentIndex - 1);
        }

        const response = await fetch(photo.url);
        const blob = await response.blob();
        const fileName = `photo-${Date.now()}.jpg`;
        const presignedUrl = await getPresignedUrl({
          fileName,
          contentType: "image/jpeg",
        });

        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": "image/jpeg",
          },
        });

        if (!uploadResponse.ok) throw new Error("Upload failed");

        const storedPhotos = JSON.parse(
          localStorage.getItem("uploaded-photos") || "[]"
        );
        storedPhotos.push(fileName);
        localStorage.setItem("uploaded-photos", JSON.stringify(storedPhotos));
      } catch (error) {
        console.error("Upload failed:", error);
        if (processingPhotos.has(photo.id)) {
          setPhotos((prev) => [...prev, photo]);
        }
      } finally {
        setProcessingPhotos((prev) => {
          const newSet = new Set(prev);
          newSet.delete(photo.id);
          return newSet;
        });
        setIsUploading(false);
      }
    } else {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (currentIndex === totalPhotos - 1 && currentIndex > 0) {
        setCurrentPhotoIndex(currentIndex - 1);
      }
    }
  };

  return {
    handlePhotoAction,
    isUploading,
    processingPhotos,
  };
};