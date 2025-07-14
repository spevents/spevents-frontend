// src/hooks/useSidebar.ts

import { useState, useEffect, useRef, useCallback } from "react";

const COLLAPSE_THRESHOLD = 1024;

export function useSidebar() {
  // Initialize collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [iconMode, setIconMode] = useState(false);
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("sidebarWidth") || "280");
    }
    return 280;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [screenWidth, setScreenWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 1920;
  });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);

      // Auto-collapse when screen gets too small
      if (window.innerWidth < 768) {
        setIconMode(true);
      }
      // Auto-expand when screen gets large enough and was previously auto-collapsed
      else if (window.innerWidth >= COLLAPSE_THRESHOLD && iconMode) {
        setIconMode(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [iconMode]);

  // Check if collapse functionality should be available
  const canCollapse = screenWidth < COLLAPSE_THRESHOLD;

  useEffect(() => {
    localStorage.setItem("sidebarWidth", width.toString());
  }, [width]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(400, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const toggleIconMode = useCallback(() => {
    // Only allow toggle if screen is below threshold or if user manually wants to expand
    if (canCollapse || iconMode) {
      setIconMode(!iconMode);
    }
  }, [iconMode, canCollapse]);

  return {
    collapsed,
    setCollapsed,
    iconMode,
    setIconMode,
    width,
    setWidth,
    isResizing,
    sidebarRef,
    handleMouseDown,
    toggleIconMode,
    canCollapse,
    screenWidth,
  };
}
