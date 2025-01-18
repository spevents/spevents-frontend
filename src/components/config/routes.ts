// src/config/routes.ts
export const ROUTES = {
  main: 'spevents.live',
  host: 'app.spevents.live',
  guest: 'join.spevents.live'
} as const;

export type Domain = 'main' | 'host' | 'guest' | 'local' | 'unknown';

export const getDomain = (): Domain => {
  const hostname = window.location.hostname;
  
  // Local development - includes both localhost and ngrok
  if (hostname === 'localhost' || hostname.includes('ngrok')) {
    // Check if the path includes /guest/ to determine if it's a guest route in development
    const isGuestPath = window.location.pathname.includes('/guest/');
    return isGuestPath ? 'guest' : 'local';
  }
  
  // Production domain checks
  if (hostname === ROUTES.main) return 'main';
  if (hostname === ROUTES.host) return 'host';
  if (hostname === ROUTES.guest) return 'guest';
  
  return 'unknown';
};

export const isHostDomain = () => {
  const domain = getDomain();
  // Host domain in production or local development (but not guest routes)
  return domain === 'host' || (domain === 'local' && !window.location.pathname.includes('/guest/'));
};

export const isGuestDomain = () => {
  const domain = getDomain();
  // Guest domain in production or guest routes in development
  return domain === 'guest' || (domain === 'local' && window.location.pathname.includes('/guest/'));
};

// Helper function to get the event ID from the URL
export const getEventIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  // Find the part before /guest/ in the path
  const guestIndex = pathParts.findIndex(part => part === 'guest');
  if (guestIndex > 0) {
    return pathParts[guestIndex - 1];
  }
  return null;
};