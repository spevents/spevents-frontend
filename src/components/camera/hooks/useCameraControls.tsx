import { useCallback, useRef } from "react";

interface CameraControlsOptions {
  stream: MediaStream | null;
}

export const useCameraControls = ({ stream }: CameraControlsOptions) => {
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const setFocusPoint = useCallback(
    async (x: number, y: number) => {
      if (!stream) return;

      const track = stream.getVideoTracks()[0];
      if (!track) return;

      trackRef.current = track;

      try {
        const capabilities = track.getCapabilities();

        if (
          "focusMode" in capabilities &&
          Array.isArray(capabilities.focusMode) &&
          capabilities.focusMode.includes("manual")
        ) {
          await track.applyConstraints({
            advanced: [
              {
                focusMode: "manual",
                focusDistance: Math.min(1, Math.max(0, x)), // Normalize to 0-1
                pointsOfInterest: [{ x, y }],
              } as MediaTrackConstraintSet,
            ],
          });
        }
      } catch (error) {
        console.warn("Error setting focus point:", error);
      }
    },
    [stream],
  );

  const setExposure = useCallback(
    async (value: number) => {
      if (!stream) return;

      const track = stream.getVideoTracks()[0];
      if (!track) return;

      try {
        const capabilities = track.getCapabilities();

        if (
          "exposureMode" in capabilities &&
          Array.isArray(capabilities.exposureMode) &&
          capabilities.exposureMode.includes("manual")
        ) {
          const { exposureCompensation } = capabilities as any;
          if (exposureCompensation) {
            const { min, max, step } = exposureCompensation;
            const normalizedValue = (value + 2) / 4; // Convert from -2:2 to 0:1
            const exposureValue = min + normalizedValue * (max - min);

            await track.applyConstraints({
              advanced: [
                {
                  exposureMode: "manual",
                  exposureCompensation: Math.round(exposureValue / step) * step,
                } as MediaTrackConstraintSet,
              ],
            });
          }
        }
      } catch (error) {
        console.warn("Error setting exposure:", error);
      }
    },
    [stream],
  );

  return {
    setFocusPoint,
    setExposure,
  };
};
