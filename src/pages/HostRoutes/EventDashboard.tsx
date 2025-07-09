// src/pages/HostRoutes/EventDashboard.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";

import { useAuth } from "../../components/auth/AuthProvider";
import { useEvent } from "../../contexts/EventContext";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useSidebar } from "../../hooks/useSideBar";

import SidebarNav from "../../components/dashboard/SidebarNav";
import HomeContent from "../../components/dashboard/HomeContent";
import LibraryContent from "../../components/dashboard/LibraryContent";
import CommunityContent from "../../components/dashboard/CommunityContent";
import CreateEventModal from "../../components/dashboard/CreateEventModal";

export function EventDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent, selectEvent } = useEvent();

  const [activeTab, setActiveTab] = useState<
    "home" | "library" | "community" | "photos" | "guests"
  >("home");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sidebar width management
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("sidebarWidth") || "280");
    }
    return 280;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const darkMode = useDarkMode();
  const sidebar = useSidebar();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        sidebar.setCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [sidebar]);

  // Persist sidebar width
  useEffect(() => {
    localStorage.setItem("sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  // Sidebar resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = Math.max(200, Math.min(400, e.clientX));
      setSidebarWidth(newWidth);
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

  const handleCreateEvent = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      const newEvent = await createEvent(data);
      setShowCreateModal(false);
      selectEvent(newEvent.id);
      navigate(`/host/event/${newEvent.id}/gallery`);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-sp_eggshell/30 dark:bg-sp_dark_bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sp_eggshell border-t-sp_green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sp_green/70 dark:text-sp_dark_muted">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sp_eggshell/30 dark:bg-sp_dark_bg flex transition-all duration-300">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => sidebar.setCollapsed(false)}
          className="fixed top-4 left-4 z-30 p-2 bg-white dark:bg-sp_dark_surface rounded-lg shadow-lg border border-sp_eggshell/30 dark:border-sp_lightgreen/20"
        >
          <Menu className="w-5 h-5 text-sp_green dark:text-sp_dark_text" />
        </button>
      )}

      <SidebarNav
        ref={sidebarRef}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobile={isMobile}
        darkMode={darkMode}
        sidebar={{
          ...sidebar,
          width: sidebarWidth,
          handleMouseDown,
        }}
        onCreateEvent={() => setShowCreateModal(true)}
      />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <div
            className={`max-w-6xl mx-auto p-4 md:p-8 ${
              isMobile ? "pt-16" : ""
            }`}
          >
            <AnimatePresence mode="wait">
              {activeTab === "home" && (
                <HomeContent onCreateEvent={() => setShowCreateModal(true)} />
              )}
              {activeTab === "library" && (
                <LibraryContent
                  onCreateEvent={() => setShowCreateModal(true)}
                />
              )}
              {activeTab === "community" && <CommunityContent />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}
