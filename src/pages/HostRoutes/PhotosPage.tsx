// src/pages/HostRoutes/PhotosPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Images } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/components/auth/AuthProvider";
import { useEvent } from "@/contexts/EventContext";
import { useSidebar } from "@/hooks/useSideBar";

import SidebarNav from "@/components/dashboard/SidebarNav";
import CreateEventModal from "@/components/dashboard/CreateEventModal";

export function PhotosPage() {
  const { user } = useAuth();
  const { createEvent, selectEvent } = useEvent();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleCreateEvent = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      const newEvent = await createEvent({
        name: data.name,
        description: data.description || "",
      });
      setShowCreateModal(false);
      selectEvent(newEvent.id);
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
        onCreateEvent={() => setShowCreateModal(true)}
      />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <div
            className={`max-w-6xl mx-auto p-4 md:p-8 ${
              isMobile ? "pt-16" : ""
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center py-12 bg-white dark:bg-sp_dark_surface rounded-2xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                <div className="w-24 h-24 bg-gradient-to-br from-sp_lightgreen to-sp_midgreen rounded-full flex items-center justify-center mx-auto mb-6">
                  <Images className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-sp_darkgreen dark:text-sp_dark_text mb-2">
                  All Photos
                </h2>
                <p className="text-sp_green/70 dark:text-sp_dark_muted mb-6">
                  View and manage photos from all your events
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-sp_eggshell/50 dark:bg-sp_lightgreen/10 text-sp_green dark:text-sp_lightgreen rounded-xl">
                  <span className="w-2 h-2 bg-sp_midgreen dark:bg-sp_lightgreen rounded-full mr-2 animate-pulse"></span>
                  Coming Soon
                </div>
              </div>
            </motion.div>
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
