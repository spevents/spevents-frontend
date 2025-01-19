// src/components/camera/CameraInterface.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNgrok } from "../../contexts/NgrokContext";
// import { ZoomControl } from "./ZoomControl";
// import { PhotoCounter } from "./PhotoCounter";
// import { CameraControls } from "./CameraControls";

// Types
interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
}

interface Photo {
  id: number;
  url: string;
}

// Extended types for camera constraints
type ExtendedCapabilities = MediaTrackCapabilities & {
  zoom?: { min: number; max: number; step?: number };
};

interface ExtendedConstraints extends MediaTrackConstraintSet {
  zoom?: number;
}

// Constants
const PHOTO_LIMIT = 5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const DEFAULT_ZOOM = 1;
const DOUBLE_TAP_DELAY = 300;

// Helper functions
const getDeviceZoomCapabilities = async (track: MediaStreamTrack): Promise<{ min: number; max: number } | null> => {
  try {
    const capabilities = track.getCapabilities() as ExtendedCapabilities;
    if (capabilities.zoom) {
      return {
        min: capabilities.zoom.min || 1,
        max: capabilities.zoom.max || 8
      };
    }
  } catch (error) {
    console.warn('Error getting zoom capabilities:', error);
  }
  return null;
};

const normalizeZoomForDevice = (
  zoomLevel: number,
  deviceMin: number,
  deviceMax: number,
  uiMin: number,
  uiMax: number
): number => {
  const uiRange = uiMax - uiMin;
  const deviceRange = deviceMax - deviceMin;
  const normalizedZoom = ((zoomLevel - uiMin) / uiRange) * deviceRange + deviceMin;
  return normalizedZoom;
};

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ initialMode }) => {
  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl } = useNgrok();

  // State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [deviceZoomCapabilities, setDeviceZoomCapabilities] = useState<{ min: number; max: number } | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  // Computed values
  const isDemoMode = location.pathname.startsWith("/demo");
  const basePrefix = isDemoMode ? "/demo" : "";

  // Effect to prevent scroll during camera use
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Effect to initialize camera
  useEffect(() => {
    if (initialMode === "camera") {
      startCamera();
    }
    return () => cleanup();
  }, [initialMode]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const getConstraints = (facing: "environment" | "user") => ({
    video: {
      facingMode: facing,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });

  const handleZoom = useCallback((newZoom: number) => {
    if (!streamRef.current) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    // Update UI immediately
    setZoomLevel(newZoom);

    // Apply zoom to device if capabilities are available
    if (deviceZoomCapabilities) {
      const deviceZoom = normalizeZoomForDevice(
        newZoom,
        deviceZoomCapabilities.min,
        deviceZoomCapabilities.max,
        MIN_ZOOM,
        MAX_ZOOM
      );

      // Apply constraints without awaiting to make it more responsive
      track.applyConstraints({
        advanced: [{ zoom: deviceZoom } as ExtendedConstraints]
      }).catch(error => {
        console.warn('Error applying zoom:', error);
      });
    }
  }, [deviceZoomCapabilities]);

  const startCamera = async (facing?: "environment" | "user") => {
    cleanup();
    const currentFacing = facing || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        getConstraints(currentFacing)
      );
      
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setFacingMode(currentFacing);
        
        // Check zoom capabilities
        const track = stream.getVideoTracks()[0];
        const capabilities = await getDeviceZoomCapabilities(track);
        setDeviceZoomCapabilities(capabilities);
        
        // Reset zoom
        setZoomLevel(MIN_ZOOM);
        handleZoom(MIN_ZOOM);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleScreenTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;
    
    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      flipCamera();
    }
    
    setLastTapTime(now);
  };

  const flipCamera = () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    startCamera(newFacingMode);
  };

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

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || photos.length >= PHOTO_LIMIT) return;

    triggerCaptureEffect();

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
    setPhotos((prev) => [...prev, newPhoto]);

    const sessionPhotos = JSON.parse(
      sessionStorage.getItem("temp-photos") || "[]"
    );
    sessionPhotos.push(newPhoto);
    sessionStorage.setItem("temp-photos", JSON.stringify(sessionPhotos));

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
    <div 
      className="relative h-screen bg-black overflow-hidden"
      onClick={handleScreenTap}
    >
      {/* Flash effect overlay */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150 z-20"
        style={{ opacity: 0 }}
      />

      {/* Photo counter */}
      <PhotoCounter count={photos.length} limit={PHOTO_LIMIT} />

      {/* Camera preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`h-full w-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
      />

      {/* Zoom controls */}
      <ZoomControl
        isVisible={isZoomVisible}
        zoomLevel={zoomLevel}
        onToggleVisibility={() => setIsZoomVisible(!isZoomVisible)}
        onZoomChange={handleZoom}
      />

      {/* Camera controls */}
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