// src/config/routes.ts
export const ROUTES = {
  main: 'spevents.live',
  host: 'app.spevents.live',
  guest: 'join.spevents.live'
} as const;

export const getDomain = () => {
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname.includes('ngrok')) {
    return 'local';
  }
  
  // Check which subdomain/domain we're on
  if (hostname === ROUTES.main) return 'main';
  if (hostname === ROUTES.host) return 'host';
  if (hostname === ROUTES.guest) return 'guest';
  
  return 'unknown';
};

export const isHostDomain = () => getDomain() === 'host' || getDomain() === 'local';
export const isGuestDomain = () => getDomain() === 'guest';