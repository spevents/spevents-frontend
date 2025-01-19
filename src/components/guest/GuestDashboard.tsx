// src/components/guest/GuestDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Palette, Download, Award, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollageCreator } from './CollageCreator';
import { getPhotoUrl } from '../../lib/aws';

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
    { id: 'gallery', icon: <Grid className="w-6 h-6" />, label: 'Gallery' },
    { id: 'camera', icon: <Camera className="w-6 h-6" />, label: 'Camera' },
    { id: 'create', icon: <Palette className="w-6 h-6" />, label: 'Create' },
    { id: 'feedback', icon: <Award className="w-6 h-6" />, label: 'Feedback' },
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
            url: getPhotoUrl(fileName),
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

  const downloadSelectedPhotos = async () => {
    const selectedPhotosList = photos.filter(photo => selectedPhotos.has(photo.name));
    
    if (selectedPhotosList.length === 0) return;

    try {
      const photo = selectedPhotosList[0];
      const response = await fetch(photo.url);
      const blob = await response.blob();

      const file = new File([blob], photo.name, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      if (navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: 'Save Photo',
            text: 'Photo from event'
          });
        } catch (error) {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      alert('Unable to download photos at the moment.');
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
                onClick={downloadSelectedPhotos}
                className="p-4 rounded-full text-white/60 hover:text-white hover:bg-white/5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-6 h-6" />
                <span className="sr-only">Download Selected</span>
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}