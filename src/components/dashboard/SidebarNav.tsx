// src/components/dashboard/SidebarNav.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Folder,
  Globe,
  UserIcon,
  ChevronDown,
  Bell,
  CreditCard,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  HelpCircle,
  Mail,
  GripVertical,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useSidebar } from "../../hooks/useSideBar";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useAuth } from "../auth/AuthProvider";
import lightIcon from "../../assets/light-icon.svg";
import darkIcon from "../../assets/dark-icon.svg";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile: boolean;
}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ activeTab, onTabChange, isMobile }, ref) => {
    const sidebar = useSidebar();
    const darkMode = useDarkMode();
    const { user, signOut } = useAuth();

    const getUserData = () => {
      if (!user) {
        return {
          firstName: "User",
          lastName: "",
          email: "user@example.com",
          company: "",
        };
      }

      const nameParts = user.name.trim().split(" ");
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || "";
      return { firstName, lastName, email: user.email, company: "" };
    };

    const userData = getUserData();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showBrandingPanel, setShowBrandingPanel] = useState(false);

    const getInitials = () => {
      if (userData?.firstName && userData?.lastName) {
        return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
      }
      return user?.email?.[0]?.toUpperCase() || "U";
    };

    const handleSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    };

    return (
      <>
        {/* Mobile Overlay */}
        {isMobile && !sidebar.collapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => sidebar.setCollapsed(true)}
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          className={`${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
                  sidebar.collapsed ? "-translate-x-full" : "translate-x-0"
                }`
              : "relative h-screen"
          } bg-white dark:bg-sp_dark_bg border-r border-sp_eggshell/30 dark:border-sp_lightgreen/20 flex flex-col transition-colors`}
          style={{
            width: isMobile
              ? "280px"
              : sidebar.iconMode
                ? "80px"
                : `${sidebar.width}px`,
            minWidth: sidebar.iconMode ? "80px" : "200px",
          }}
        >
          {/* User Account Section */}
          <div className="p-4 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 transition-colors ${
                  sidebar.iconMode ? "justify-center" : ""
                }`}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-sp_midgreen to-sp_green">
                    {getInitials()}
                  </div>
                )}
                {!sidebar.iconMode && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sp_darkgreen dark:text-sp_dark_text">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-sm text-sp_green/70 dark:text-sp_dark_muted truncate">
                        {userData.email}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-sp_green/50 dark:text-sp_dark_muted" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute ${
                      sidebar.iconMode ? "left-full ml-2" : "top-full mt-2"
                    } ${
                      sidebar.iconMode ? "w-64" : "left-0 right-0"
                    } bg-white dark:bg-sp_dark_surface border border-sp_eggshell/30 dark:border-sp_lightgreen/20 rounded-xl shadow-lg z-50`}
                  >
                    <div className="p-3 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                      <p className="font-medium text-sp_darkgreen dark:text-sp_dark_text">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-sm text-sp_green/70 dark:text-sp_dark_muted">
                        {userData.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_dark_text hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                        <UserIcon className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_dark_text hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                        <CreditCard className="w-4 h-4" />
                        Subscription
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_dark_text hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </button>
                      <hr className="my-1 border-sp_eggshell/30 dark:border-sp_lightgreen/20" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation - Takes up remaining space */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "library", label: "Library", icon: Folder },
                { id: "community", label: "Community", icon: Globe },
              ].map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                      sidebar.iconMode ? "justify-center" : ""
                    } ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-sp_lightgreen/20 to-sp_midgreen/20 text-sp_darkgreen dark:text-sp_lightgreen border border-sp_lightgreen/30 shadow-sm"
                        : "text-sp_green/70 dark:text-sp_dark_muted hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!sidebar.iconMode && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>

                  {/* Tooltip for collapsed mode */}
                  {sidebar.iconMode && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-sp_darkgreen dark:bg-sp_dark_surface text-white dark:text-sp_dark_text text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom Section - Fixed at bottom */}
          <div className="flex-shrink-0">
            {/* Dark Mode Toggle */}
            <div className="p-4 border-t border-sp_eggshell/30 dark:border-sp_lightgreen/20">
              <div className="relative group">
                <button
                  onClick={() => darkMode.setDarkMode(!darkMode.darkMode)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 transition-colors text-sp_green/70 dark:text-sp_dark_muted ${
                    sidebar.iconMode ? "justify-center" : ""
                  }`}
                >
                  {darkMode.darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                  {!sidebar.iconMode && (
                    <span className="font-medium">
                      {darkMode.darkMode ? "Light Mode" : "Dark Mode"}
                    </span>
                  )}
                </button>

                {/* Tooltip for collapsed mode */}
                {sidebar.iconMode && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-sp_darkgreen dark:bg-sp_dark_surface text-white dark:text-sp_dark_text text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {darkMode.darkMode ? "Light Mode" : "Dark Mode"}
                  </div>
                )}
              </div>
            </div>

            {/* Collapse Toggle - Only show when threshold is met */}
            {!isMobile && sidebar.canCollapse && (
              <div className="px-4 pb-2">
                <button
                  onClick={sidebar.toggleIconMode}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 transition-colors text-sp_green/70 dark:text-sp_dark_muted ${
                    sidebar.iconMode ? "justify-center" : ""
                  }`}
                >
                  {sidebar.iconMode ? (
                    <PanelLeftOpen className="w-5 h-5" />
                  ) : (
                    <>
                      <PanelLeftClose className="w-5 h-5" />
                      <span className="text-sm font-medium">Collapse</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Spevents Branding Section - Always at bottom */}
            <div className="p-4 border-t border-sp_eggshell/30 dark:border-sp_lightgreen/20">
              <div className="relative">
                <button
                  onClick={() => setShowBrandingPanel(!showBrandingPanel)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 transition-colors ${
                    sidebar.iconMode ? "justify-center" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <img
                      src={darkMode.darkMode ? darkIcon : lightIcon}
                      alt="Spevents"
                      className="w-6 h-6"
                    />
                  </div>
                  {!sidebar.iconMode && (
                    <div className="flex-1 text-left">
                      <h2 className="text-lg font-bold bg-gradient-to-r from-sp_green to-sp_midgreen bg-clip-text text-transparent dark:from-sp_eggshell dark:to-sp_lightgreen dark:text-transparent">
                        spevents
                      </h2>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showBrandingPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute ${
                        sidebar.iconMode ? "left-full ml-2" : "bottom-full mb-2"
                      } ${
                        sidebar.iconMode ? "w-64" : "left-0 right-0"
                      } bg-white dark:bg-sp_dark_surface border border-sp_eggshell/30 dark:border-sp_lightgreen/20 rounded-xl shadow-lg z-50`}
                    >
                      <div className="p-3 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                        <h3 className="font-semibold text-sp_darkgreen dark:text-sp_dark_text">
                          spevents
                        </h3>
                        <p className="text-sm text-sp_green/70 dark:text-sp_dark_muted">
                          Event Management Platform
                        </p>
                      </div>
                      <div className="p-2">
                        <a
                          href="https://www.spevents.live"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_dark_text hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Main Website
                        </a>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_dark_text hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                          <HelpCircle className="w-4 h-4" />
                          FAQ
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_dark_text hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                          <Mail className="w-4 h-4" />
                          Contact Support
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Resize Handle - Desktop Only */}
          {!isMobile && !sidebar.iconMode && (
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-sp_midgreen/20 transition-colors"
              onMouseDown={sidebar.handleMouseDown}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3 text-sp_midgreen" />
              </div>
            </div>
          )}
        </div>
      </>
    );
  },
);

SidebarNav.displayName = "SidebarNav";

export default SidebarNav;
