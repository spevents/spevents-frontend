// File: src/types/event.ts

export interface Event {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  hostEmail: string;
  status: "draft" | "active" | "paused" | "ended";
  photoCount: number;
  guestCount?: number;
  sessionCode: string;
  timestamp?: number;

  // Advanced event fields
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  expectedGuests?: string;
  theme?: string;
  allowDownloads?: boolean;
  moderatePhotos?: boolean;
  customLink?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  slideshowViews?: SlideshowView[];
  liveMetrics?: LiveMetricsConfig;
  venue3D?: Venue3DConfig;
}

export interface CreateEventData {
  name: string;
  description?: string;

  // Advanced event fields (optional)
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  expectedGuests?: string;
  theme?: string;
  allowDownloads?: boolean;
  moderatePhotos?: boolean;
  customLink?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  slideshowViews?: SlideshowView[];
  liveMetrics?: LiveMetricsConfig;
  venue3D?: Venue3DConfig;
}

// Import interfaces from eventTypes for consistency
export interface SlideshowView {
  id: number;
  name: string;
  type: string;
  preset: string;
  isDefault: boolean;
  settings?: SlideshowViewSettings;
}

export interface SlideshowViewSettings {
  metricsEnabled: boolean;
  geolocationEnabled: boolean;
  customLayout: CustomLayout | null;
  model3D: Model3DSettings | null;
  animations: AnimationSettings;
}

export interface LiveMetricsConfig {
  enabled: boolean;
  widgets: MetricsWidget[];
  refreshInterval: number;
  displayOnGuestViews: boolean;
}

export interface MetricsWidget {
  id: string;
  name: string;
  type: "counter" | "percentage" | "chart" | "trend";
  enabled: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface Venue3DConfig {
  creationMode: "2d-transform" | "venue-scan";
  model: Model3DData | null;
  geolocationPins: GeolocationPin[];
  settings: Model3DSettings;
}

export interface Model3DData {
  type: "2d-transformed" | "scanned";
  data: any;
  thumbnail: string;
  createdAt: string;
  metadata: {
    vertices: number;
    faces: number;
    textures: string[];
  };
}

export interface GeolocationPin {
  id: string;
  position: { x: number; y: number; z: number };
  realWorldPosition: { lat: number; lng: number };
  radius: number;
  label: string;
}

export interface Model3DSettings {
  autoRotate: boolean;
  rotationSpeed: number;
  cameraControls: boolean;
  lighting: "ambient" | "directional" | "mixed";
  photoDisplayMode: "floating" | "pinned" | "projected";
  maxPhotosPerPin: number;
}

export interface CustomLayout {
  id: string;
  name: string;
  canvas: {
    width: number;
    height: number;
    gridSize: number;
  };
  photoBlocks: PlacedPhotoBlock[];
  animations: AnimationSettings;
}

export interface PhotoBlock {
  id: string;
  name: string;
  size: { width: number; height: number };
  icon: any;
  category: "single" | "multi" | "special";
}

export interface PlacedPhotoBlock extends PhotoBlock {
  position: { x: number; y: number };
  zIndex: number;
  rotation: number;
  animation: AnimationConfig;
}

export interface AnimationSettings {
  transition: "fade" | "slide" | "scale" | "flip" | "zoom";
  duration: number;
  displayTime: number;
  autoAdvance: boolean;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface AnimationConfig extends AnimationSettings {
  delay: number;
  direction: "up" | "down" | "left" | "right" | "center";
}
