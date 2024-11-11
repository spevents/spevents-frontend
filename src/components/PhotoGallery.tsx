import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const savedPhotos = JSON.parse(localStorage.getItem('REMOVED') || '[]') as Photo[];
    setPhotos(savedPhotos);
  }, []);

  const deletePhoto = (id: number) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem('REMOVED', JSON.stringify(updatedPhotos));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="text-white flex items-center space-x-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back</span>
          </button>
          <h1 className="text-white text-2xl font-bold">Event Photos</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo: Photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt="Event photo"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
        
        {photos.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p>No photos yet. Start capturing moments!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;