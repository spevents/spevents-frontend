import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNgrok } from "../../contexts/NgrokContext";
import { ZoomControl } from "./ZoomControl";
import { PhotoCounter } from "./PhotoCounter";
import { CameraControls } from "./CameraControls";

// Types
interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
}

interface Photo {
  id: number;
  url: string;
}

interface ZoomCapabilities {
  min: number;
  max: number;
}

type ExtendedMediaTrack = MediaStreamTrack & {
  zoomHandler?: (zoom: number) => void;
};

// Constants
const PHOTO_LIMIT = 5;
const DOUBLE_TAP_DELAY = 300;
const ZOOM_LEVELS = [0.5, 1.0, 1.1] as const;
const DEFAULT_ZOOM = 1.0;

// Camera zoom helper
const getDeviceZoomCapabilities = async (track: MediaStreamTrack): Promise<ZoomCapabilities | null> => {
  try {
    const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
      zoom?: { min: number; max: number; step?: number };
    };
    
    if (capabilities.zoom) {
      return {
        min: capabilities.zoom.min || ZOOM_LEVELS[0],
        max: capabilities.zoom.max || ZOOM_LEVELS[2]
      };
    }
  } catch (error) {
    console.warn('Error getting zoom capabilities:', error);
  }
  return null;
};

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ initialMode }) => {
  // Router and context
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl } = useNgrok();
  const isDemoMode = location.pathname.startsWith("/demo");
  const basePrefix = isDemoMode ? "/demo" : "";

  // State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [deviceZoomCapabilities, setDeviceZoomCapabilities] = useState<ZoomCapabilities | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const initialDeviceZoomRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: ExtendedMediaTrack) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  // Effect to initialize camera
  useEffect(() => {
    if (initialMode === "camera") {
      startCamera();
    }
    return cleanup;
  }, [initialMode, cleanup]);

  // Effect to prevent scroll during camera use
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleZoom = useCallback((newZoom: number) => {
    if (!streamRef.current) return;
    
    const track = streamRef.current.getVideoTracks()[0] as ExtendedMediaTrack;
    if (!track || !deviceZoomCapabilities) return;
  
    // Update UI immediately
    setZoomLevel(newZoom);
  
    // Create or use existing zoom handler
    if (!track.zoomHandler) {
      track.zoomHandler = (zoom: number) => {
        const { min, max } = deviceZoomCapabilities;
  
        // If returning to default zoom (1.0), use the initial device zoom value
        if (zoom === DEFAULT_ZOOM && initialDeviceZoomRef.current !== null) {
          track.applyConstraints({
            advanced: [{ zoom: initialDeviceZoomRef.current } as unknown as MediaTrackConstraints]
          }).catch(error => {
            console.warn('Error applying zoom:', error);
          });
          return;
        }
  
        let deviceZoom;
        if (zoom < DEFAULT_ZOOM) {
          // For zooming out (0.5), keep the existing calculation as it works well
          deviceZoom = min + (initialDeviceZoomRef.current! - min) * (zoom / DEFAULT_ZOOM);
        } else if (zoom > DEFAULT_ZOOM) {
          // For zooming in (1.1), use a gentler scale
          const zoomInRatio = (zoom - DEFAULT_ZOOM) / (ZOOM_LEVELS[2] - DEFAULT_ZOOM);
          // Only use 20% of the remaining zoom range above the initial zoom
          const maxZoomIncrease = (max - initialDeviceZoomRef.current!) * 0.2;
          deviceZoom = initialDeviceZoomRef.current! + (maxZoomIncrease * zoomInRatio);
        } else {
          deviceZoom = initialDeviceZoomRef.current!;
        }
  
        track.applyConstraints({
          advanced: [{ zoom: deviceZoom } as unknown as MediaTrackConstraints]
        }).catch(error => {
          console.warn('Error applying zoom:', error);
        });
      };
    }
  
    track.zoomHandler(newZoom);
  }, [deviceZoomCapabilities]);

  const startCamera = async (facing?: "environment" | "user") => {
    cleanup();
    const currentFacing = facing || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setFacingMode(currentFacing);
        
        const track = stream.getVideoTracks()[0];
        const capabilities = await getDeviceZoomCapabilities(track);
        setDeviceZoomCapabilities(capabilities);
        
        // Store the initial device zoom level
        if (capabilities) {
          const currentSettings = track.getSettings() as any;
          initialDeviceZoomRef.current = currentSettings.zoom || 
            (capabilities.min + (capabilities.max - capabilities.min) * 0.5);
        }
        
        setZoomLevel(DEFAULT_ZOOM);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleScreenTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      flipCamera();
    }
    setLastTapTime(now);
  }, [lastTapTime]);

  const flipCamera = useCallback(() => {
    startCamera(facingMode === "environment" ? "user" : "environment");
  }, [facingMode]);

  const triggerCaptureEffect = () => {
    if (flashRef.current) {
      flashRef.current.style.opacity = "0.3";
      setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.opacity = "0";
        }
      }, 150);
    }

    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 150);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || photos.length >= PHOTO_LIMIT) return;

    triggerCaptureEffect();

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL("image/jpeg", 0.8);
    const newPhoto = { id: Date.now(), url: photoUrl };

    // Update state and storage
    setPhotos(prev => [...prev, newPhoto]);
    const sessionPhotos = JSON.parse(sessionStorage.getItem("temp-photos") || "[]");
    sessionStorage.setItem("temp-photos", JSON.stringify([...sessionPhotos, newPhoto]));

    // Haptic feedback
    navigator.vibrate?.(50);
  }, [photos.length, facingMode]);

  const navigateWithBaseUrl = useCallback((path: string) => {
    if (window.innerWidth <= 768 && baseUrl) {
      window.location.href = `${baseUrl}${path}`;
    } else {
      navigate(path);
    }
  }, [navigate, baseUrl]);

  return (
    <div 
      className="relative h-screen bg-black overflow-hidden"
      onClick={handleScreenTap}
    >
      <div
        ref={flashRef}
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150 z-20"
        style={{ opacity: 0 }}
      />

      <PhotoCounter count={photos.length} limit={PHOTO_LIMIT} />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
      />

      <ZoomControl
        isVisible={isZoomVisible}
        zoomLevel={zoomLevel}
        onToggleVisibility={() => setIsZoomVisible(!isZoomVisible)}
        onZoomChange={handleZoom}
      />

      <CameraControls
        photoCount={photos.length}
        isCapturing={isCapturing}
        disabled={photos.length >= PHOTO_LIMIT}
        onCapture={capturePhoto}
        onFlip={flipCamera}
        onNavigateToReview={() => navigateWithBaseUrl(`${basePrefix}/review`)}
      />
    </div>
  );
};

export default CameraInterface;