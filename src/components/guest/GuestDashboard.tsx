import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Trophy, Grid, WandSparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSignedPhotoUrl } from '../../lib/aws';

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
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const tabs: TabConfig[] = [
    { id: 'gallery', icon: <Grid className="w-6 h-6 text-white font-bold" />, label: 'Gallery' },
    { id: 'camera', icon: <Camera className="w-6 h-6 text-white font-bold" />, label: 'Camera' },
    { id: 'create', icon: <WandSparkles className="w-6 h-6 text-white font-bold" />, label: 'Create' },
    { id: 'prize', icon: <Trophy className="w-6 h-6 text-white font-bold" />, label: 'Prize' },
  ];

  useEffect(() => {
    loadGuestPhotos();
  }, []);

  const loadGuestPhotos = async () => {
    try {
      const storedPhotos = JSON.parse(localStorage.getItem('uploaded-photos') || '[]');
      if (storedPhotos.length > 0) {
        if (typeof storedPhotos[0] === 'object' && storedPhotos[0].url) {
          setPhotos(storedPhotos);
        } else {
          const photoUrls = storedPhotos.map((fileName: string) => ({
            url: getSignedPhotoUrl(fileName),
            name: fileName,
            created_at: new Date().toISOString()
          }));
          setPhotos(photoUrls);
        }
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    switch (tabId) {
      case 'camera':
        navigate(`/${eventId}/guest/camera`);
        break;
      case 'create':
        navigate(`/${eventId}/guest/create`);
        break;
      case 'prize':
        navigate(`/${eventId}/guest/feedback`);
        break;
      case 'gallery':
        navigate(`/${eventId}/guest`);
        break;
    }
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleNext = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrevious = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const minSwipeDistance = 50;
    const swipeDistance = touchStart - touchEnd;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left
        handleNext();
      } else {
        // Swiped right
        handlePrevious();
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="pb-24">
        {activeTab === 'gallery' && (
          <div className="px-4 pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No photos yet</p>
                <button
                  onClick={() => navigate(`/${eventId}/guest/camera`)}
                  className="mt-4 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20"
                >
                  Take Photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.name}
                    className="relative aspect-square cursor-pointer"
                    onClick={() => handlePhotoClick(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={photo.url}
                      alt="Your photo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedPhotoIndex(null);
              }
            }}
          >
            <div 
              className="relative max-w-4xl w-full mx-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute right-2 top-2 z-10 p-2 bg-black/50 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.img
                key={selectedPhotoIndex}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                src={photos[selectedPhotoIndex].url}
                alt="Selected photo"
                className="w-full h-full object-contain max-h-96 rounded-lg"
              />

              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white/80 hover:text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Photo counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-4 rounded-full relative ${
                  activeTab === tab.id
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