import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LayoutGrid, Clapperboard } from "lucide-react";
import GridCollage from "./GridCollage";
import MockShaadiCollage from "./MockShaadiCollage";

interface Photo {
  url: string;
  name: string;
}

interface CollageCreatorProps {
  photos: Photo[];
  onClose: () => void;
  initialSelectedPhotos: Set<string>;
  onSelectPhotos: (photos: Set<string>) => void;
}

type CollageType = "grid" | "mockShaadi" | null;

export function CollageCreator({
  photos,
  onClose,
  initialSelectedPhotos,
  onSelectPhotos,
}: CollageCreatorProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(
    initialSelectedPhotos
  );
  const [activeCollage, setActiveCollage] = useState<CollageType>(null);
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});

  // Create a map of photo names to URLs on mount
  useEffect(() => {
    const urlMap: { [key: string]: string } = {};
    photos.forEach((photo) => {
      urlMap[photo.name] = photo.url;
    });
    setPhotoUrls(urlMap);
  }, [photos]);

  const handlePhotoSelect = (photoName: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoName)) {
      newSelection.delete(photoName);
    } else {
      newSelection.add(photoName);
    }
    setSelectedPhotos(newSelection);
    onSelectPhotos(newSelection);
  };

  const getSelectedUrls = () => {
    return Array.from(selectedPhotos)
      .map((name) => photoUrls[name])
      .filter(Boolean);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50"
    >
      <AnimatePresence mode="wait">
        {activeCollage ? (
          activeCollage === "grid" ? (
            <GridCollage
              selectedPhotos={getSelectedUrls()}
              onClose={() => setActiveCollage(null)}
            />
          ) : (
            <MockShaadiCollage
              selectedPhotos={getSelectedUrls()}
              onClose={() => setActiveCollage(null)}
            />
          )
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-white font-medium">
                Select Photos ({selectedPhotos.size})
              </h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <motion.button
                    key={photo.name}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePhotoSelect(photo.name)}
                    className="relative aspect-square"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {selectedPhotos.has(photo.name) && (
                      <div className="absolute inset-0 bg-white/20 rounded-lg border-2 border-white">
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-900 font-medium">
                          {Array.from(selectedPhotos).indexOf(photo.name) + 1}
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-2 border-t border-white/10">
              <button
                onClick={() => setActiveCollage("grid")}
                disabled={selectedPhotos.size === 0}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3 px-6 
                  font-medium transition-colors ${
                    selectedPhotos.size > 0
                      ? "bg-white text-gray-900 hover:bg-white/90"
                      : "bg-white/10 text-white/50"
                  }`}
              >
                <LayoutGrid className="w-5 h-5" />
                Grid Collage
              </button>

              <button
                onClick={() => setActiveCollage("mockShaadi")}
                disabled={selectedPhotos.size === 0}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3 px-6 
                  font-medium transition-colors ${
                    selectedPhotos.size > 0
                      ? "bg-[#9a031e] text-yellow-400 hover:bg-white/90"
                      : "bg-white/10 text-white/50"
                  }`}
              >
                <Clapperboard className="w-5 h-5" />
                Mock Shaadi Collage
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
