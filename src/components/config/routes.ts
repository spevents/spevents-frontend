// src/config/routes.ts
export const ROUTES = {
  main: 'spevents.live',
  host: 'app.spevents.live',
  guest: 'join.spevents.live'
} as const;

export const getDomain = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Debug logs
  console.log('Checking domain for:', { hostname, pathname });
  
  // Local development - includes both localhost and ngrok
  if (hostname === 'localhost' || hostname.includes('ngrok')) {
    const isGuestPath = pathname.includes('/guest/');
    console.log('Development environment:', { isGuestPath });
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
  const result = domain === 'host' || (domain === 'local' && !window.location.pathname.includes('/guest/'));
  console.log('isHostDomain check:', result);
  return result;
};

export const isGuestDomain = () => {
  const domain = getDomain();
  const result = domain === 'guest' || (domain === 'local' && window.location.pathname.includes('/guest/'));
  console.log('isGuestDomain check:', result);
  return result;
};