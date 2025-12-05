// File: src/pages/HostRoutes/types.ts

export interface DisplayPhoto {
  url: string;
  fileName: string;
  created_at: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
  aiCaption?: string;
captionGeneratedAt?: string;
}
