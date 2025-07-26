// File: src/types/eventTypes.ts

export interface EventData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  description: string;
  expectedGuests: string;
  theme: string;
  allowDownloads: boolean;
  moderatePhotos: boolean;
  customLink: string;
  sessionCode: string;
  colors: {
    primary: string;
    secondary: string;
  };

  customColors: {
    primary: string;
    secondary: string;
  };
  slideshowViews: SlideshowView[];
  liveMetrics?: LiveMetricsConfig;
  venue3D?: Venue3DConfig;
}

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
  refreshInterval: number; // seconds
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
  creationMode: ModelCreationMode;
  model: Model3DData | null;
  geolocationPins: GeolocationPin[];
  settings: Model3DSettings;
}

export interface Model3DData {
  type: "2d-transformed" | "scanned";
  data: any; // Three.js model data
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
  radius: number; // meters
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
  duration: number; // milliseconds
  displayTime: number; // milliseconds
  autoAdvance: boolean;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface AnimationConfig extends AnimationSettings {
  delay: number;
  direction: "up" | "down" | "left" | "right" | "center";
}

export interface Theme {
  id: string;
  name: string;
  colors: string[];
  fonts?: {
    primary: string;
    secondary: string;
  };
  effects?: {
    shadows: boolean;
    gradients: boolean;
    blur: boolean;
  };
}

export interface SlideshowPreset {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: "2D" | "3D" | "Custom";
  features: string[];
  requiresGeolocation?: boolean;
  requires3DModel?: boolean;
}

export interface Step {
  title: string;
  subtitle: string;
  date: string;
}

// Enums and Union Types
export type ModelCreationMode = "2d-transform" | "venue-scan";

export type DisplayMode =
  | "grid"
  | "mosaic"
  | "carousel"
  | "collage"
  | "3d-model"
  | "custom";

export type MetricsType =
  | "live-count"
  | "photo-count"
  | "upload-rate"
  | "engagement"
  | "time-trend";

// Color palette constants
export const colors = {
  eggshell: "#dad7cd",
  lightGreen: "#a3b18a",
  green: "#3a5a40",
  darkGreen: "#344e41",
};

// Default configurations
export const defaultLiveMetrics: LiveMetricsConfig = {
  enabled: true,
  widgets: [
    {
      id: "live-count",
      name: "Live Guests",
      type: "counter",
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 100 },
    },
    {
      id: "photo-count",
      name: "Total Photos",
      type: "counter",
      enabled: true,
      position: { x: 220, y: 0 },
      size: { width: 200, height: 100 },
    },
    {
      id: "upload-rate",
      name: "Photos/Min",
      type: "trend",
      enabled: true,
      position: { x: 440, y: 0 },
      size: { width: 300, height: 150 },
    },
  ],
  refreshInterval: 5,
  displayOnGuestViews: false,
};

export const defaultAnimationSettings: AnimationSettings = {
  transition: "fade",
  duration: 1000,
  displayTime: 5000,
  autoAdvance: true,
  easing: "ease-in-out",
};

export const defaultModel3DSettings: Model3DSettings = {
  autoRotate: true,
  rotationSpeed: 0.5,
  cameraControls: true,
  lighting: "mixed",
  photoDisplayMode: "floating",
  maxPhotosPerPin: 10,
};
