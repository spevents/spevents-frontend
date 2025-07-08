// src/components/dashboard/Carousel.tsx

import React, { memo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode;
  title: string;
}

const Carousel = memo(({ children, title }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextPhoto = useCallback(() => {
    const childrenArray = React.Children.toArray(children);
    setCurrentIndex((prev) => (prev + 1) % childrenArray.length);
  }, [children]);

  const prevPhoto = useCallback(() => {
    const childrenArray = React.Children.toArray(children);
    setCurrentIndex(
      (prev) => (prev - 1 + childrenArray.length) % childrenArray.length,
    );
  }, [children]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-sp_darkgreen dark:text-sp_dark_text">
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevPhoto}
            className="p-2 rounded-full bg-sp_eggshell/50 hover:bg-sp_eggshell dark:bg-sp_dark_surface dark:hover:bg-sp_lightgreen/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-sp_darkgreen dark:text-sp_dark_text" />
          </button>
          <button
            onClick={nextPhoto}
            className="p-2 rounded-full bg-sp_eggshell/50 hover:bg-sp_eggshell dark:bg-sp_dark_surface dark:hover:bg-sp_lightgreen/20 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-sp_darkgreen dark:text-sp_dark_text" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl">
        <motion.div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${
              currentIndex * (isMobile ? 100 : 33.333)
            }%)`,
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
});

Carousel.displayName = "Carousel";

export default Carousel;
