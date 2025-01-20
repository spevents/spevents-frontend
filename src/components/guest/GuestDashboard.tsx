// src/components/guest/GuestDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Download, Award, Grid, WandSparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollageCreator } from './CollageCreator';
import { getSignedPhotoUrl } from '../../lib/aws';
import { shareToInstagram } from './utils/collage';

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
  const { eventId } = useParams(); // Get eventId from URL
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCollageCreator, setShowCollageCreator] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('gallery');

  const tabs: TabConfig[] = [
    { id: 'gallery', icon: <Grid className="w-6 h-6 text-white font-bold" />, label: 'Gallery' },
    { id: 'camera', icon: <Camera className="w-6 h-6 text-white font-bold" />, label: 'Camera' },
    { id: 'create', icon: <WandSparkles className="w-6 h-6 text-white font-bold" />, label: 'Create' },
    { id: 'prize', icon: <Award className="w-6 h-6 text-white font-bold" />, label: 'Prize' },
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



  /*

  useEffect(() => {
    const getSignedUrls = async () => {
      try {
        const urls = await Promise.all(
          limitedPhotos.map(async (photoUrl) => {
            const fileName = photoUrl.split("/").pop();
            if (!fileName) throw new Error("Invalid photo URL");
            return await getSignedPhotoUrl(fileName);
          })
        );
        setSignedUrls(urls);
      } catch (error) {
        console.error("Error getting signed URLs:", error);
      }
    };

    getSignedUrls();
  }, [limitedPhotos]);
  */

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case 'camera':
        navigate(`/${eventId}/guest/camera`);
        break;
      case 'create':
        setShowCollageCreator(true);
        break;
      case 'feedback':
        navigate(`/${eventId}/guest/feedback`);
        break;
      default:
        setActiveTab(tabId);
    }
  };

  const togglePhotoSelection = (photoName: string) => {
    setSelectedPhotos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(photoName)) {
        newSelection.delete(photoName);
      } else {
        newSelection.add(photoName);
      }
      return newSelection;
    });
  };








  const shareSelectedPhotos = async () => {
    const selectedPhotosList = photos.filter(photo => selectedPhotos.has(photo.name));
    
    if (selectedPhotosList.length === 0) return;
    try {
      const collageUrl = selectedPhotosList[0].url; // Assuming a single photo for simplicity
      await shareToInstagram(collageUrl);
    } catch (error) {
      console.error('Error sharing:', error);
      alert(`Error sharing to Instagram: ${error}`);
    }
    setSelectedPhotos(new Set());
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
                {photos.map((photo) => (
                  <motion.div
                    key={photo.name}
                    className="relative aspect-square"
                    onClick={() => togglePhotoSelection(photo.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={photo.url}
                      alt="Your photo"
                      className={`w-full h-full object-cover rounded-lg transition-transform ${
                        selectedPhotos.has(photo.name) ? 'ring-2 ring-white scale-95' : ''
                      }`}
                    />
                    {selectedPhotos.has(photo.name) && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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

            {selectedPhotos.size > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={shareSelectedPhotos}
                className="p-4 rounded-full text-white/60 hover:text-white hover:bg-white/5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-6 h-6 text-white font-bold" />
                <span className="sr-only">Share Selected</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Collage Creator Modal */}
      <AnimatePresence>
        {showCollageCreator && (
          <CollageCreator
            photos={photos}
            onClose={() => setShowCollageCreator(false)}
            initialSelectedPhotos={selectedPhotos}
            onSelectPhotos={setSelectedPhotos}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
