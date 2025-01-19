// hooks/useZoom.ts
import { useState, useRef, useCallback } from 'react';

// Types
interface ZoomCapabilities {
  min: number;
  max: number;
}

export const DEFAULT_ZOOM = 1.0;

export const useZoom = (facingMode: 'user' | 'environment' = 'environment') => {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [deviceZoomCapabilities, setDeviceZoomCapabilities] = useState<ZoomCapabilities | null>(null);
  const initialDeviceZoomRef = useRef<number | null>(null);

  const getDeviceZoomCapabilities = async (track: MediaStreamTrack): Promise<ZoomCapabilities | null> => {
    try {
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
        zoom?: { min: number; max: number; step?: number };
      };
      
      if (capabilities.zoom) {
        const settings = track.getSettings() as any;
        const currentZoom = settings.zoom || capabilities.zoom.min;

        return {
          min: capabilities.zoom.min || currentZoom * 0.5,
          max: capabilities.zoom.max || currentZoom * 2
        };
      }
    } catch (error) {
      console.warn('Error getting zoom capabilities:', error);
    }
    return null;
  };

  const handleZoom = useCallback((newZoom: number) => {
    if (!deviceZoomCapabilities) return;
    setZoomLevel(newZoom);
  }, [deviceZoomCapabilities]);

  const applyZoom = useCallback((track: MediaStreamTrack, zoom: number) => {
    if (!deviceZoomCapabilities || !initialDeviceZoomRef.current) return;
    
    const { min, max } = deviceZoomCapabilities;

    // If returning to default zoom (1.0), use the initial device zoom value
    if (zoom === DEFAULT_ZOOM) {
      track.applyConstraints({
        advanced: [{ zoom: initialDeviceZoomRef.current } as unknown as MediaTrackConstraints]
      }).catch(error => {
        console.warn('Error applying default zoom:', error);
      });
      return;
    }

    let deviceZoom;
    if (facingMode === 'user') {
      if (zoom > DEFAULT_ZOOM) {
        // For selfie camera zoom in (1.1), use a very subtle zoom
        const range = max - initialDeviceZoomRef.current;
        deviceZoom = initialDeviceZoomRef.current + (range * 0.05); // Reduced to just 5% of the available range
      }
    } else {
      // Rear camera behavior
      if (zoom < DEFAULT_ZOOM) {
        // For zooming out (0.5)
        const range = initialDeviceZoomRef.current - min;
        deviceZoom = min + (range * 0.1);
      } else if (zoom > DEFAULT_ZOOM) {
        // For zooming in (1.1)
        const range = max - initialDeviceZoomRef.current;
        deviceZoom = initialDeviceZoomRef.current + (range * 0.2);
      }
    }

    if (deviceZoom !== undefined) {
      track.applyConstraints({
        advanced: [{ zoom: deviceZoom } as unknown as MediaTrackConstraints]
      }).catch(error => {
        console.warn('Error applying zoom:', error);
      });
    }
  }, [deviceZoomCapabilities, facingMode]);

  const initializeZoom = useCallback(async (track: MediaStreamTrack) => {
    const capabilities = await getDeviceZoomCapabilities(track);
    setDeviceZoomCapabilities(capabilities);
    
    if (capabilities) {
      const settings = track.getSettings() as any;
      initialDeviceZoomRef.current = settings.zoom || 
        (capabilities.min + (capabilities.max - capabilities.min) * 0.5);

      // Initialize with default zoom
      await track.applyConstraints({
        advanced: [{ zoom: initialDeviceZoomRef.current } as unknown as MediaTrackConstraints]
      });
    }

    setZoomLevel(DEFAULT_ZOOM);
  }, []);

  const toggleZoomVisibility = useCallback(() => {
    setIsZoomVisible(prev => !prev);
  }, []);

  return {
    zoomLevel,
    isZoomVisible,
    deviceZoomCapabilities,
    handleZoom,
    applyZoom,
    initializeZoom,
    toggleZoomVisibility,
  };
};