import { PhotoSlideshow } from "../components";
import SlideshowQRCode from "./SlideshowQRCode";

export default function SlideshowPage() {
  return (
    <div className="relative h-screen">
      <PhotoSlideshow />

      {/* Top Navigation Bar */}
      <div className="absolute top-5 right-1 z-50">
        <SlideshowQRCode />
      </div>
    </div>
  );
}
