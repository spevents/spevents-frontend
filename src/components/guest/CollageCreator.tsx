import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LayoutGrid, Clapperboard, Camera, Award, Grid, WandSparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import GridCollage from "./GridCollage";
import MockShaadiCollage from "./MockShaadiCollage";

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
}

type CollageType = "grid" | "mockShaadi" | null;

export function CollageCreator() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [activeCollage, setActiveCollage] = useState<CollageType>(null);
  const [photos, setPhotos] = useState<Array<{ url: string; name: string }>>([]);
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});

  const tabs: TabConfig[] = [
    { id: 'gallery', icon: <Grid className="w-6 h-6 text-white font-bold" />, label: 'Gallery' },
    { id: 'camera', icon: <Camera className="w-6 h-6 text-white font-bold" />, label: 'Camera' },
    { id: 'create', icon: <WandSparkles className="w-6 h-6 text-white font-bold" />, label: 'Create' },
    { id: 'prize', icon: <Award className="w-6 h-6 text-white font-bold" />, label: 'Prize' },
  ];

  useEffect(() => {
    // Load photos from localStorage
    try {
      const storedPhotos = JSON.parse(localStorage.getItem('uploaded-photos') || '[]');
      setPhotos(storedPhotos);
      
      const urlMap: { [key: string]: string } = {};
      storedPhotos.forEach((photo: { url: string; name: string }) => {
        urlMap[photo.name] = photo.url;
      });
      setPhotoUrls(urlMap);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  }, []);

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case 'camera':
        navigate(`/${eventId}/guest/camera`);
        break;
      case 'create':
        // Already on create page
        break;
      case 'prize':
        navigate(`/${eventId}/guest/feedback`);
        break;
      case 'gallery':
        navigate(`/${eventId}/guest`);
        break;
    }
  };

  const handlePhotoSelect = (photoName: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoName)) {
      newSelection.delete(photoName);
    } else {
      newSelection.add(photoName);
    }
    setSelectedPhotos(newSelection);
  };

  const getSelectedUrls = () => {
    return Array.from(selectedPhotos)
      .map((name) => photoUrls[name])
      .filter(Boolean);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col">
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
                onClick={() => navigate(`/${eventId}/guest`)}
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
              <div className="grid grid-cols-3 gap-2 pb-24">
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

            <div className="p-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3 mb-20">
                <button
                  onClick={() => setActiveCollage("grid")}
                  disabled={selectedPhotos.size === 0}
                  className={`flex items-center justify-center gap-2 rounded-full py-3 px-4 
                    font-medium transition-colors ${
                      selectedPhotos.size > 0
                        ? "bg-white text-gray-900 hover:bg-white/90"
                        : "bg-white/10 text-white/50"
                    }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  Grid
                </button>

                <button
                  onClick={() => setActiveCollage("mockShaadi")}
                  disabled={selectedPhotos.size === 0}
                  className={`flex items-center justify-center gap-2 rounded-full py-3 px-4 
                    font-medium transition-colors ${
                      selectedPhotos.size > 0
                        ? "bg-[#9a031e] text-yellow-400 hover:bg-white/90"
                        : "bg-white/10 text-white/50"
                    }`}
                >
                  <Clapperboard className="w-5 h-5" />
                  Shaadi
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-4 rounded-full relative ${
                  tab.id === 'create'
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span className="sr-only">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}