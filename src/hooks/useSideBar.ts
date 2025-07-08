// src/hooks/useSidebar.ts

import { useState, useEffect, useRef, useCallback } from "react";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [iconMode, setIconMode] = useState(false);
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("sidebarWidth") || "280");
    }
    return 280;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    setIconMode(!iconMode);
  }, [iconMode]);

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
  };
}
