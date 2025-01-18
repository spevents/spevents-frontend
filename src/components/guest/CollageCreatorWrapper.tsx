// src/components/guest/CollageCreatorWrapper.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CollageCreator } from './CollageCreator';
import { getPhotoUrl } from '../../lib/aws';

export function CollageCreatorWrapper() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [photos, setPhotos] = useState([]);

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
    }
  };

  const handleClose = () => {
    navigate(`/${eventId}/guest`);
  };

  return (
    <CollageCreator
      photos={photos}
      onClose={handleClose}
    />
  );
}