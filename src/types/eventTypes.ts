// File: src/types/eventTypes.ts

export interface EventData {
  name: string;
  date: string;
  startTime: string;
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
  slideshowViews: SlideshowView[];
}

export interface SlideshowView {
  id: number;
  name: string;
  type: string;
  preset: string;
  isDefault: boolean;
}

export interface Theme {
  id: string;
  name: string;
  colors: string[];
}

export interface SlideshowPreset {
  id: string;
  name: string;
  description: string;
  icon: any;
}

export interface Step {
  title: string;
  subtitle: string;
  date: string;
  // startTime: string;
  // endTime: string;
}

// Color palette constants
export const colors = {
  eggshell: "#dad7cd",
  lightGreen: "#a3b18a",
  green: "#3a5a40",
  darkGreen: "#344e41",
};
