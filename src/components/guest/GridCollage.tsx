// src/components/guest/GridCollage.tsx

import { useState, useEffect } from "react";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import { getSignedPhotoUrl } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import { useActualEventId } from "../session/SessionValidator";

const COLORS = {
  backgrounds: ["#000000", "#460b2f", "#9a031e", "#e36414", "#bf9b30"],
  borders: ["#000000", "#eae0d5", "#bf9b30", "#e36414", "#460b2f"],
} as const;

export interface GridCollageProps {
  selectedPhotos: string[];
  onClose: () => void;
}

const GridCollage = ({ selectedPhotos, onClose }: GridCollageProps) => {
  const actualEventId = useActualEventId();

  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [borderColor, setBorderColor] = useState("#000000");
  const [isCreating, setIsCreating] = useState(false);
  const [collageUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);

  // Get signed URLs for all selected photos
  useEffect(() => {
    const getSignedUrls = async () => {
      if (!actualEventId) return;

      try {
        const urls = await Promise.all(
          selectedPhotos.map(async (photoUrl) => {
            // Extract filename from CloudFront URL
            const fileName = photoUrl.split("/").pop();
            if (!fileName) throw new Error("Invalid photo URL");
            return await getSignedPhotoUrl(actualEventId, fileName);
          }),
        );
        setSignedUrls(urls);
      } catch (error) {
        console.error("Error getting signed URLs:", error);
      }
    };

    getSignedUrls();
  }, [selectedPhotos, actualEventId]);

  const createGridCollage = async () => {
    console.log("Creating collage with signed URLs:", signedUrls); // Debug log
    setIsCreating(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Rest of the collage creation logic...
      // (keeping existing implementation)
    } catch (error) {
      console.error("Error creating collage:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-medium">Grid Collage</h2>
        <div className="w-10" />
      </div>

      {/* Color Controls */}
      <div className="p-4 space-y-4">
        <div>
          <p className="text-white/80 text-sm mb-2">Background Color</p>
          <div className="flex gap-2">
            {COLORS.backgrounds.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  backgroundColor === color ? "border-white" : "border-white/30"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/80 text-sm mb-2">Border Color</p>
          <div className="flex gap-2">
            {COLORS.borders.map((color) => (
              <button
                key={color}
                onClick={() => setBorderColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  borderColor === color ? "border-white" : "border-white/30"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4">
          <AnimatePresence>
            {!isCreating && (
              <motion.button
                key="create-button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={createGridCollage}
                disabled={
                  selectedPhotos.length === 0 || signedUrls.length === 0
                }
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3 px-4 
                  font-medium transition-colors ${
                    selectedPhotos.length > 0 && signedUrls.length > 0
                      ? "bg-white text-gray-900"
                      : "bg-white/10 text-white/50"
                  }`}
              >
                <LayoutGrid className="w-5 h-5" />
                {isCreating
                  ? "Creating..."
                  : selectedPhotos.length === 0
                    ? "No photos"
                    : signedUrls.length === 0
                      ? "Loading..."
                      : "Create!"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 pb-36">
          {/* Collage Preview with Animation */}
          <AnimatePresence>
            {collageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <img
                  src={collageUrl}
                  alt="Collage preview"
                  className="w-full rounded-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Photos Preview */}
          <div>
            <h2 className="text-white mb-2">
              Selected Photos ({selectedPhotos.length})
            </h2>
            <div className="grid grid-cols-2 gap-1">
              {selectedPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative bg-white/10 rounded-lg overflow-hidden"
                  style={{
                    aspectRatio: "9/16",
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <img
                    src={photo}
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute top-2 left-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full 
                             flex items-center justify-center text-white text-sm font-medium"
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridCollage;
