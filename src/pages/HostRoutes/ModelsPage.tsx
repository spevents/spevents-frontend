// src/pages/HostRoutes/ModelsPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useSidebar } from "@/hooks/useSideBar";

import SidebarNav from "@/components/dashboard/SidebarNav";
import ModelsContent from "./ModelsContent";

export function ModelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Sidebar width management
  const sidebarRef = useRef<HTMLDivElement>(null);
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

  const handleCreateEvent = () => {
    navigate("/host/create");
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

      <SidebarNav ref={sidebarRef} onCreateEvent={handleCreateEvent} />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <div
            className={`max-w-6xl mx-auto p-4 md:p-8 ${
              isMobile ? "pt-16" : ""
            }`}
          >
            <ModelsContent />
          </div>
        </main>
      </div>
    </div>
  );
}
