import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Photo {
  id: number;
  url: string;
}

const PhotoGallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    // Clear previous session data
    sessionStorage.removeItem('temp-photos');
    
    // Load gallery photos
    const savedPhotos = JSON.parse(localStorage.getItem('REMOVED') || '[]') as Photo[];
    setPhotos(savedPhotos);
  }, []);

  const deletePhoto = (id: number) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem('REMOVED', JSON.stringify(updatedPhotos));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 inset-x-0 bg-gray-900/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white flex items-center space-x-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back</span>
          </button>
          <h1 className="text-white text-lg font-semibold">Gallery</h1>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="pt-16 px-4 pb-20 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square group">
              <img
                src={photo.url}
                alt="Event photo"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <p className="text-center mb-4">No photos yet</p>
            <button
              onClick={() => navigate('/camera')}
              className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              Start capturing moments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;