import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';

interface Photo {
  id: number;
  url: string;
  created_at: string;
}

const PhotoGallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear previous session data
    sessionStorage.removeItem("temp-photos");

    // Initial load of photos
    const loadPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();

    // Subscribe to real-time updates
    const channel = supabase.channel('gallery_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (insert, update, delete)
          schema: 'public',
          table: 'photos'
        },
        async (payload) => {
          // Reload all photos to ensure consistency
          const { data } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });
          
          setPhotos(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      // Get all photos
      const { data: photosToDelete } = await supabase
        .from('photos')
        .select('url');

      if (photosToDelete) {
        // Delete from storage
        for (const photo of photosToDelete) {
          const fileName = photo.url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('gallery-photos')
              .remove([fileName]);
          }
        }
      }

      // Delete all records from the database
      const { error } = await supabase
        .from('photos')
        .delete()
        .not('id', 'is', null); // Delete all records

      if (error) throw error;
      
      setPhotos([]);
    } catch (error) {
      console.error('Error clearing gallery:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleStartCapturing = () => {
    navigate('/qr', { state: { from: 'gallery' } });
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 bg-gray-900/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white flex items-center space-x-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back</span>
          </button>
          <h1 className="text-white text-lg font-semibold">Gallery</h1>
          {photos.length > 0 && (
            <button
              onClick={clearAllData}
              disabled={isClearing}
              className={`p-2 rounded-full transition-all duration-300 
                ${isClearing ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {isClearing ? (
                <RefreshCw className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square group">
                <img
                  src={photo.url}
                  alt="Event photo"
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <p className="text-center mb-4">No photos yet</p>
            <button
              onClick={handleStartCapturing}
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