// src/pages/HostRoutes/LibraryPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useSidebar } from "@/hooks/useSideBar";

import SidebarNav from "@/components/dashboard/SidebarNav";
import LibraryContent from "@/components/dashboard/LibraryContent";

export function LibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Sidebar width management
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  // Debug: Track LibraryPage renders and sidebar state
  console.log("📚 LibraryPage render:", {
    collapsed: sidebar.collapsed,
    iconMode: sidebar.iconMode,
    isMobile,
  });

  useEffect(() => {
    console.log("📚 LibraryPage useEffect triggered - before checkMobile");
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      console.log("📚 LibraryPage checkMobile:", {
        mobile,
        currentIsMobile: isMobile,
        windowWidth: window.innerWidth,
        sidebarCollapsed: sidebar.collapsed,
      });

      setIsMobile(mobile);
      if (mobile) {
        console.log("📚 LibraryPage: Setting sidebar collapsed due to mobile");
        sidebar.setCollapsed(true);
      } else {
        console.log("📚 LibraryPage: Not mobile, leaving sidebar as is");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      console.log("📚 LibraryPage: Cleaning up resize listener");
      window.removeEventListener("resize", checkMobile);
    };
  }, [sidebar, isMobile]);

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
          onClick={() => {
            console.log("📚 Mobile menu clicked - opening sidebar");
            sidebar.setCollapsed(false);
          }}
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
            <LibraryContent onCreateEvent={handleCreateEvent} />
          </div>
        </main>
      </div>
    </div>
  );
}
