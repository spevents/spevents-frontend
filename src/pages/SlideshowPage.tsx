import { PhotoSlideshow } from "../components";
import SlideshowQRCode from "./SlideshowQRCode";

export default function SlideshowPage() {
  return (
    <div className="relative h-screen">
      <PhotoSlideshow />

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-5 bg-black/2 z-50">
        <SlideshowQRCode />
      </div>
    </div>
  );
}
