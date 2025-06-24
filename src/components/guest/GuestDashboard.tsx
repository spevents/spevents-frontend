// src/components/guest/GuestDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  Trophy,
  Grid,
  WandSparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSignedPhotoUrl } from "../../lib/aws";

interface Photo {
  url: string;
  name: string;
  created_at: string;
}

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export function GuestDashboard() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const tabs: TabConfig[] = [
    {
      id: "gallery",
      icon: <Grid className="w-6 h-6 text-white font-bold" />,
      label: "Gallery",
    },
    {
      id: "camera",
      icon: <Camera className="w-6 h-6 text-white font-bold" />,
      label: "Camera",
    },
    {
      id: "create",
      icon: <WandSparkles className="w-6 h-6 text-white font-bold" />,
      label: "Create",
    },
    {
      id: "prize",
      icon: <Trophy className="w-6 h-6 text-white font-bold" />,
      label: "Prize",
    },
  ];

  useEffect(() => {
    loadGuestPhotos();
  }, [eventId]);

  const loadGuestPhotos = async () => {
    if (!eventId) return;

    try {
      const storedPhotos = JSON.parse(
        localStorage.getItem("uploaded-photos") || "[]",
      );
      if (storedPhotos.length > 0) {
        if (typeof storedPhotos[0] === "object" && storedPhotos[0].url) {
          setPhotos(storedPhotos);
        } else {
          const photoUrls = await Promise.all(
            storedPhotos.map(async (fileName: string) => ({
              url: await getSignedPhotoUrl(eventId, fileName),
              name: fileName,
              created_at: new Date().toISOString(),
            })),
          );
          setPhotos(photoUrls);
        }
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);

    switch (tabId) {
      case "camera":
        navigate(`/${eventId}/guest/camera`);
        break;
      case "create":
        navigate(`/${eventId}/guest/create`);
        break;
      case "prize":
        navigate(`/${eventId}/guest/feedback`);
        break;
      case "gallery":
        // Already on gallery
        break;
    }
  };

  const handlePhotoTap = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (selectedPhotoIndex === null) return;

    if (direction === "prev") {
      setSelectedPhotoIndex(
        selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1,
      );
    } else {
      setSelectedPhotoIndex(
        selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0,
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigatePhoto("next");
    }
    if (isRightSwipe) {
      navigatePhoto("prev");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <h1 className="text-white text-xl font-semibold">Gallery</h1>
        <div className="text-white/60 text-sm">{photos.length} photos</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <Camera className="w-16 h-16 text-white/40 mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">
              No photos yet
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Start capturing memories by taking your first photo!
            </p>
            <button
              onClick={() => navigate(`/${eventId}/guest/camera`)}
              className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium"
            >
              Take Photo
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePhotoTap(index)}
                  className="aspect-square relative overflow-hidden rounded-lg bg-white/10"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={() => navigatePhoto("prev")}
              className="absolute left-4 z-50 p-2 bg-black/50 rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => navigatePhoto("next")}
              className="absolute right-4 z-50 p-2 bg-black/50 rounded-full"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Photo */}
            <motion.img
              key={selectedPhotoIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm">
                {selectedPhotoIndex + 1} of {photos.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
