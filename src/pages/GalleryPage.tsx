import { PhotoGallery } from "../components";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function GalleryPage(): JSX.Element {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    };

    // Set mobile state
    const mobile = checkMobile();
    setIsMobile(mobile);

    // If on mobile, redirect to guest page
    if (mobile) {
      navigate("/guest", { replace: true });
    }
  }, [navigate]);

  // If we're on mobile and in the process of redirecting, render nothing
  if (isMobile) return null as any;

  // For non-mobile users, render the gallery
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <PhotoGallery />
    </div>
  );
}