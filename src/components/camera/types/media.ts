// types/media.ts
export interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export interface ExtendedMediaTrackConstraintSet
  extends MediaTrackConstraintSet {
  torch?: boolean;
}
