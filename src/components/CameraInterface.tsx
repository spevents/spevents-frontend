import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';  // Changed this line
import { useNavigate } from 'react-router-dom';

interface CameraInterfaceProps {
  initialMode: 'qr' | 'camera';
  onPhotoCapture?: (photoUrl: string) => void;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ 
  initialMode,
  onPhotoCapture 
}) => {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const constraints = {
    video: { 
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  };

  useEffect(() => {
    if (initialMode === 'camera') {
      startCamera();
    }
    return () => cleanup();
  }, [initialMode]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    const newPhoto = { id: Date.now(), url: photoUrl };
    setCapturedPhotos(prev => [...prev, newPhoto]);
    
    if (onPhotoCapture) {
      onPhotoCapture(photoUrl);
    }
  };

  const uploadToGallery = (photoId: number) => {
    const photo = capturedPhotos.find(p => p.id === photoId);
    if (!photo) return;

    // Remove from local state
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
    
    // Add to gallery storage
    const galleryPhotos = JSON.parse(localStorage.getItem('REMOVED') || '[]');
    galleryPhotos.push(photo);
    localStorage.setItem('REMOVED', JSON.stringify(galleryPhotos));
  };

  // QR Code Display Mode
  if (initialMode === 'qr') {
    const origin = window.location.origin;
    const cameraUrl = `${origin}/camera`;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6">
            Scan to Access Camera
          </h2>
          
          <div className="bg-gray-100 p-4 rounded-xl mb-6">
            <QRCodeSVG 
              value={cameraUrl}
              size={256}
              level="H"
              className="w-full h-auto"
              includeMargin
            />
          </div>
          
          <p className="text-gray-600 text-center text-sm">
            Scan this QR code with your mobile device to access the camera interface
          </p>
        </div>
      </div>
    );
  }

  // Photo Review Mode
  if (isReviewMode) {
    return (
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center">
          <button
            onClick={() => setIsReviewMode(false)}
            className="text-white bg-black/20 backdrop-blur-sm p-3 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-medium">Review Photos</span>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>

        <div className="h-full pt-20 pb-16 px-4 flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <AnimatePresence>
              {capturedPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="absolute w-full"
                  style={{
                    zIndex: capturedPhotos.length - index,
                    top: index * 20
                  }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -100) {
                      uploadToGallery(photo.id);
                    }
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
                    <img 
                      src={photo.url} 
                      alt="Captured photo" 
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                      <p className="text-white text-center text-sm mt-4">
                        Swipe up to add to gallery
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Camera Mode
  return (
    <div className="relative h-screen bg-black">
      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 p-8 pb-12 safe-area-bottom">
        <div className="flex justify-between items-center max-w-lg mx-auto px-6">
          {capturedPhotos.length > 0 ? (
            <button
              onClick={() => setIsReviewMode(true)}
              className="bg-white/20 backdrop-blur-lg p-4 rounded-full text-white transform transition hover:scale-110"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {capturedPhotos.length}
              </span>
            </button>
          ) : (
            <div className="w-14" />
          )}

          <button
            onClick={capturePhoto}
            className="bg-white w-20 h-20 rounded-full transform transition hover:scale-105 relative"
          >
            <span className="absolute inset-2 rounded-full border-2 border-gray-200" />
          </button>

          <button
            onClick={() => window.location.href = '/gallery'}
            className="bg-white/20 backdrop-blur-lg p-4 rounded-full text-white transform transition hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Photo Counter */}
      <div className="absolute top-safe-area right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full">
        <span className="text-white text-sm font-medium">
          {capturedPhotos.length}/5
        </span>
      </div>
    </div>
  );
};

export default CameraInterface;