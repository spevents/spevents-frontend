// src/components/camera/types.ts
export interface Photo {
  id: number;
  url: string;
}

export interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
}
