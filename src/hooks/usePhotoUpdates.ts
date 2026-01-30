// src/hooks/usePhotoUpdates.ts
// Real-time photo updates using polling with smart diffing
// Can be upgraded to WebSocket/SSE when backend supports it

import { useState, useEffect, useRef, useCallback } from "react";
import { EventPhoto } from "@/services/api";

interface UsePhotoUpdatesOptions {
  eventId: string | undefined;
  fetchPhotos: () => Promise<EventPhoto[]>;
  enabled?: boolean;
  // Adaptive polling: starts fast, slows down when no changes
  initialInterval?: number;
  maxInterval?: number;
  // Callback when new photos are detected
  onNewPhotos?: (newPhotos: EventPhoto[]) => void;
}

interface UsePhotoUpdatesReturn {
  photos: EventPhoto[];
  isLoading: boolean;
  error: Error | null;
  newPhotoIds: Set<string>;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Smart polling hook with adaptive intervals
 * - Polls quickly when activity is detected
 * - Slows down when no changes for a while
 * - Tracks new photos for animations
 */
export function usePhotoUpdates({
  eventId,
  fetchPhotos,
  enabled = true,
  initialInterval = 3000, // 3 seconds when active
  maxInterval = 15000, // 15 seconds when idle
  onNewPhotos,
}: UsePhotoUpdatesOptions): UsePhotoUpdatesReturn {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newPhotoIds, setNewPhotoIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track previous photo IDs for diff detection
  const previousPhotoIdsRef = useRef<Set<string>>(new Set());
  const currentIntervalRef = useRef(initialInterval);
  const noChangeCountRef = useRef(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch and diff photos
  const loadPhotos = useCallback(async () => {
    if (!eventId || !isMountedRef.current) return;

    try {
      const fetchedPhotos = await fetchPhotos();

      if (!isMountedRef.current) return;

      // Create set of current photo IDs
      const currentIds = new Set(fetchedPhotos.map((p) => p.fileName));

      // Find new photos (not in previous set)
      const newIds = new Set<string>();
      fetchedPhotos.forEach((photo) => {
        if (!previousPhotoIdsRef.current.has(photo.fileName)) {
          newIds.add(photo.fileName);
        }
      });

      // Update state
      setPhotos(fetchedPhotos);
      setLastUpdated(new Date());
      setError(null);

      // Handle new photos
      if (newIds.size > 0 && previousPhotoIdsRef.current.size > 0) {
        setNewPhotoIds(newIds);
        const newPhotos = fetchedPhotos.filter((p) => newIds.has(p.fileName));
        onNewPhotos?.(newPhotos);

        // Reset to fast polling when new photos detected
        currentIntervalRef.current = initialInterval;
        noChangeCountRef.current = 0;

        // Clear new photo indicators after animation
        setTimeout(() => {
          if (isMountedRef.current) {
            setNewPhotoIds(new Set());
          }
        }, 3000);
      } else {
        // No new photos - gradually slow down polling
        noChangeCountRef.current++;
        if (noChangeCountRef.current > 3) {
          currentIntervalRef.current = Math.min(
            currentIntervalRef.current * 1.5,
            maxInterval,
          );
        }
      }

      // Update previous IDs
      previousPhotoIdsRef.current = currentIds;
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to load photos"),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [eventId, fetchPhotos, initialInterval, maxInterval, onNewPhotos]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    currentIntervalRef.current = initialInterval;
    noChangeCountRef.current = 0;
    await loadPhotos();
  }, [loadPhotos, initialInterval]);

  // Setup adaptive polling
  useEffect(() => {
    if (!enabled || !eventId) return;

    isMountedRef.current = true;

    // Initial load
    loadPhotos();

    // Adaptive polling function
    const scheduleNextPoll = () => {
      if (intervalIdRef.current) {
        clearTimeout(intervalIdRef.current);
      }

      intervalIdRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          loadPhotos().then(() => {
            if (isMountedRef.current) {
              scheduleNextPoll();
            }
          });
        }
      }, currentIntervalRef.current);
    };

    scheduleNextPoll();

    return () => {
      isMountedRef.current = false;
      if (intervalIdRef.current) {
        clearTimeout(intervalIdRef.current);
      }
    };
  }, [enabled, eventId, loadPhotos]);

  // Reset when eventId changes
  useEffect(() => {
    previousPhotoIdsRef.current = new Set();
    currentIntervalRef.current = initialInterval;
    noChangeCountRef.current = 0;
    setPhotos([]);
    setNewPhotoIds(new Set());
    setIsLoading(true);
  }, [eventId, initialInterval]);

  return {
    photos,
    isLoading,
    error,
    newPhotoIds,
    refresh,
    lastUpdated,
  };
}

/**
 * Future: WebSocket-based real-time updates
 * Uncomment and use when backend supports WebSocket
 */
/*
export function usePhotoUpdatesWebSocket({
  eventId,
  wsUrl,
  onNewPhoto,
}: {
  eventId: string;
  wsUrl: string;
  onNewPhoto?: (photo: EventPhoto) => void;
}) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const ws = new WebSocket(`${wsUrl}/events/${eventId}/photos`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'initial') {
        setPhotos(data.photos);
      } else if (data.type === 'new_photo') {
        setPhotos(prev => [data.photo, ...prev]);
        onNewPhoto?.(data.photo);
      } else if (data.type === 'delete_photo') {
        setPhotos(prev => prev.filter(p => p.fileName !== data.fileName));
      }
    };

    return () => {
      ws.close();
    };
  }, [eventId, wsUrl, onNewPhoto]);

  return { photos, isConnected };
}
*/
