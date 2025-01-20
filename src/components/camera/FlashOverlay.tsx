import { forwardRef } from 'react';

export const FlashOverlay = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150 z-20"
    style={{ opacity: 0 }}
  />
));

FlashOverlay.displayName = 'FlashOverlay';