import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Repeat } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNgrok } from '../contexts/NgrokContext';

const PHOTO_LIMIT = 5;

interface CameraInterfaceProps {
  initialMode: 'qr' | 'camera';
}

interface ExtendedCapabilities extends MediaTrackCapabilities {
  zoom?: {
    min: number;
    max: number;
    step: number;
  };
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl } = useNgrok();
  const [photos, setPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isZoomDialVisible, setIsZoomDialVisible] = useState(false);
  const [dialAngle, setDialAngle] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const cameraViewRef = useRef<HTMLDivElement>(null);
  const currentZoom = useRef(1);
  const startAngle = useRef(0);
  const isDragging = useRef(false);

  const isDemoMode = location.pathname.startsWith('/demo');
  const basePrefix = isDemoMode ? '/demo' : '';

  // Prevent page scrolling when in camera interface
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const getConstraints = (facing: 'environment' | 'user') => ({
    video: { 
      facingMode: facing,
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  });

  useEffect(() => {
    if (initialMode === 'camera') {
      startCamera();
    }

    return () => {
      cleanup();
    };
  }, [initialMode]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async (facing?: 'environment' | 'user') => {
    cleanup();
    const currentFacing = facing || facingMode;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getConstraints(currentFacing));
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setFacingMode(currentFacing);

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities() as ExtendedCapabilities;
        if (capabilities.zoom) {
          currentZoom.current = capabilities.zoom.min;
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const flipCamera = () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(newFacingMode);
  };

  const triggerCaptureEffect = () => {
    if (flashRef.current) {
      flashRef.current.style.opacity = '0.3';
      setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.opacity = '0';
        }
      }, 150);
    }

    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 150);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || photos.length >= PHOTO_LIMIT) return;

    triggerCaptureEffect();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
    context.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    const newPhoto = { id: Date.now(), url: photoUrl };
    setPhotos(prev => [...prev, newPhoto]);
    
    const sessionPhotos = JSON.parse(sessionStorage.getItem('temp-photos') || '[]');
    sessionPhotos.push(newPhoto);
    sessionStorage.setItem('temp-photos', JSON.stringify(sessionPhotos));

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const navigateWithBaseUrl = (path: string) => {
    if (window.innerWidth <= 768 && baseUrl) {
      window.location.href = `${baseUrl}${path}`;
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera View Area */}
      <div 
        ref={cameraViewRef}
        className="relative flex-1 overflow-hidden"
      >
        <div
          ref={flashRef}
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150 z-20"
          style={{ opacity: 0 }}
        />

        {/* Top Controls */}
        <div className="absolute top-safe-area left-0 right-0 flex justify-between items-start p-4 z-10">
          <button
            onClick={() => navigateWithBaseUrl(`${basePrefix}/gallery`)}
            className="bg-black/20 backdrop-blur-lg p-3 rounded-full text-white"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-end space-y-2">
            <motion.div 
              key={photos.length}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full"
            >
              <span className={`text-sm font-medium ${photos.length >= PHOTO_LIMIT ? 'text-red-500' : 'text-white'}`}>
                {photos.length} / {PHOTO_LIMIT}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Camera Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 200ms ease-out'
          }}
        />

        {/* Zoom Dial */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onPointerDown={(e) => {
              setIsZoomDialVisible(true);
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top;
              startAngle.current = Math.atan2(
                e.clientY - centerY,
                e.clientX - centerX
              );
              isDragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!isDragging.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top;
              const angle = Math.atan2(
                e.clientY - centerY,
                e.clientX - centerX
              );
              const deltaAngle = angle - startAngle.current;
              const newZoom = Math.min(Math.max(1 + deltaAngle, 0.5), 3);
              setZoom(newZoom);
              setDialAngle(deltaAngle * 180 / Math.PI);

              if (streamRef.current) {
                const videoTrack = streamRef.current.getVideoTracks()[0];
                const capabilities = videoTrack.getCapabilities() as ExtendedCapabilities;
                if (capabilities.zoom) {
                  try {
                    videoTrack.applyConstraints({
                      advanced: [{ 'zoom': newZoom } as MediaTrackConstraintSet]
                    }).catch(console.error);
                  } catch (error) {
                    console.error('Error applying zoom:', error);
                  }
                }
              }
            }}
            onPointerUp={(e) => {
              isDragging.current = false;
              setIsZoomDialVisible(false);
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            className="relative bg-black/20 backdrop-blur-lg px-4 py-2 rounded-full text-white"
          >
            <span className="text-sm font-medium">{zoom.toFixed(1)}×</span>

            {/* Semicircle Dial */}
            <AnimatePresence>
              {isZoomDialVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4"
                >
                  <div className="relative w-48 h-24 overflow-hidden">
                    {/* Semicircle Background */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-lg rounded-t-full" />
                    
                    {/* Zoom Labels */}
                    <div className="absolute inset-0 flex justify-between items-end px-6 pb-2">
                      <span className="text-white/60 text-xs">0.5×</span>
                      <span className="text-white/60 text-xs">3.0×</span>
                    </div>

                    {/* Zoom Indicator */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        height: '3px',
                        width: '24px',
                        backgroundColor: 'white',
                        transformOrigin: 'center bottom',
                        rotate: dialAngle
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black py-6 px-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {photos.length > 0 ? (
            <motion.button
              onClick={() => navigateWithBaseUrl(`${basePrefix}/review`)}
              whileTap={{ scale: 0.95 }}
              className="relative bg-white/20 backdrop-blur-lg p-4 rounded-full text-white"
            >
              <ImageIcon className="w-6 h-6" />
              <motion.span
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                {photos.length}
              </motion.span>
            </motion.button>
          ) : (
            <div className="w-14" />
          )}

          <motion.button
            onClick={capturePhoto}
            disabled={photos.length >= PHOTO_LIMIT}
            animate={{
              scale: isCapturing ? 0.9 : 1,
              backgroundColor: isCapturing ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 1)"
            }}
            transition={{ duration: 0.15 }}
            className={`w-20 h-20 rounded-full transform relative
              ${photos.length >= PHOTO_LIMIT ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="absolute inset-2 rounded-full border-2 border-gray-200" />
          </motion.button>

          <motion.button
            onClick={flipCamera}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-lg p-4 rounded-full text-white"
          >
            <Repeat className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CameraInterface;