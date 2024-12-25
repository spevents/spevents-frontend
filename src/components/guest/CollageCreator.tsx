// src/components/guest/CollageCreator.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, ChevronLeft } from 'lucide-react';
import { createCollage, shareToInstagram } from '../../utils/collage';
import { getSignedPhotoUrl } from '../../lib/aws';

interface Photo {
  url: string;
  name: string;
}

interface CollageCreatorProps {
  photos: Photo[];
  onClose: () => void;
}

export function CollageCreator({ photos, onClose }: CollageCreatorProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isCreatingCollage, setIsCreatingCollage] = useState(false);
  const [collagePreview, setCollagePreview] = useState<string | null>(null);

  const handlePhotoSelect = (photoName: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoName)) {
        newSet.delete(photoName);
      } else if (newSet.size < 9) { // Limit to 9 photos for a 3x3 grid
        newSet.add(photoName);
      }
      return newSet;
    });
  };

  const handleCreateCollage = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      setIsCreatingCollage(true);
      console.log('Getting signed URLs for photos...');

      // Get signed URLs for selected photos
      const selectedPhotoUrls = await Promise.all(
        Array.from(selectedPhotos).map(async name => {
          console.log('Getting signed URL for:', name);
          const signedUrl = await getSignedPhotoUrl(name);
          console.log('Received signed URL:', signedUrl.substring(0, 100) + '...');
          return signedUrl;
        })
      );

      console.log('Creating collage with signed URLs...');
      const collageDataUrl = await createCollage(selectedPhotoUrls);
      console.log('Collage created successfully');
      setCollagePreview(collageDataUrl);
    } catch (error) {
      console.error('Error in handleCreateCollage:', error);
    } finally {
      setIsCreatingCollage(false);
    }
  };

  const handleShare = async () => {
    if (!collagePreview) return;

    try {
      await shareToInstagram(collagePreview);
    } catch (error) {
      console.error('Error sharing collage:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-white font-medium">Create Collage</h2>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          {collagePreview ? (
            <div className="h-full flex flex-col items-center justify-center">
              <img
                src={collagePreview}
                alt="Collage preview"
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
              <button
                onClick={() => setCollagePreview(null)}
                className="mt-4 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
              >
                Create New Collage
              </button>
            </div>
          ) : (
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
                    alt="Your photo"
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
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          {collagePreview ? (
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 
                rounded-full py-3 px-6 font-medium hover:bg-white/90 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share to Instagram</span>
            </button>
          ) : (
            <button
              onClick={handleCreateCollage}
              disabled={selectedPhotos.size === 0 || isCreatingCollage}
              className={`w-full flex items-center justify-center gap-2 rounded-full py-3 px-6 
                font-medium transition-colors ${
                  selectedPhotos.size > 0 && !isCreatingCollage
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'bg-white/10 text-white/50'
                }`}
            >
              {isCreatingCollage ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Create Collage {selectedPhotos.size > 0 ? `(${selectedPhotos.size})` : ''}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}