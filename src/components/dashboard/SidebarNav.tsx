// src/components/dashboard/SidebarNav.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Folder,
  Globe,
  Images,
  Users,
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
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { useSidebar } from "../../hooks/useSideBar";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useAuth } from "../auth/AuthProvider";
import lightIcon from "../../assets/light-icon.svg";
import darkIcon from "../../assets/dark-icon.svg";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (
    tab: "home" | "library" | "community" | "photos" | "guests"
  ) => void;
  isMobile: boolean;
  darkMode: ReturnType<typeof useDarkMode>;
  sidebar: ReturnType<typeof useSidebar>;
  onCreateEvent?: () => void;
}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ activeTab, onTabChange, isMobile, onCreateEvent }, ref) => {
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
    const [expandedSections, setExpandedSections] = useState({
      starred: true,
      recent: true,
    });

    // Ref for profile menu click-outside detection
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Close profile menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          profileMenuRef.current &&
          !profileMenuRef.current.contains(event.target as Node)
        ) {
          setShowProfileMenu(false);
        }
      };

      if (showProfileMenu) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [showProfileMenu]);

    // Mock starred events data
    const starredEvents = [
      { name: "Summer Wedding Reception", type: "event", status: "active" },
      { name: "Corporate Annual Gala", type: "event", status: "ended" },
      { name: "Birthday Celebration", type: "event", status: "draft" },
      { name: "Anniversary Party", type: "event", status: "active" },
      { name: "Graduation Ceremony", type: "event", status: "ended" },
    ];

    // Mock recent activities
    const recentActivities = [
      "Photo Upload Optimization",
      "Dark Mode Implementation",
      "Event Dashboard Redesign",
      "QR Code Generation Feature",
      "Guest Management System",
      "Photo Gallery Enhancement",
      "Mobile Responsive Updates",
      "User Authentication Flow",
      "Event Analytics Dashboard",
      "Slideshow Feature Development",
      "Social Media Integration",
      "Payment Processing Setup",
      "Email Notification System",
      "Backup & Recovery System",
      "Performance Optimization",
    ];

    const toggleSection = useCallback((section: string) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section as keyof typeof prev],
      }));
    }, []);

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

    const handleEventClick = useCallback((event: any) => {
      console.log("Navigate to event:", event);
    }, []);

    const SidebarItem = ({
      children,
      className = "",
      onClick,
      isActive = false,
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
      isActive?: boolean;
    }) => {
      return (
        <button
          onClick={onClick}
          //                                                      LIGHT TEXT            DARK TEXT
          className={`flex items-center w-full px-3 py-2 text-sm text-sp_green/70 dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell rounded-lg transition-all duration-200 group ${
            isActive
              ? //
                "bg-sp_lightgreen/20 text-sp_darkgreen dark:text-sp_lightgreen border border-sp_lightgreen/30"
              : ""
          } ${className}`}
        >
          {children}
        </button>
      );
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
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
            {!sidebar.iconMode && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center">
                    <img
                      src={darkMode.darkMode ? darkIcon : lightIcon}
                      alt="Spevents"
                      className="w-6 h-6"
                    />
                  </div>
                  <span className="text-lg font-bold bg-sp_darkgreen bg-clip-text text-transparent dark:bg-sp_eggshell">
                    spevents
                  </span>
                </div>
              </>
            )}

            {sidebar.iconMode && (
              <div className="w-full flex justify-center">
                <div className="w-6 h-6 rounded-md flex items-center justify-center">
                  <img
                    src={darkMode.darkMode ? darkIcon : lightIcon}
                    alt="Spevents"
                    className="w-6 h-6"
                  />{" "}
                </div>
              </div>
            )}
          </div>

          {/* Navigation - Takes up remaining space */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Create Event Button */}
              <SidebarItem
                className="bg-gradient-to-r from-sp_midgreen to-sp_green hover:from-sp_green hover:to-sp_darkgreen text-white font-medium"
                onClick={onCreateEvent}
              >
                <div
                  className={`flex items-center ${
                    sidebar.iconMode ? "justify-center" : "gap-3"
                  }`}
                >
                  <div className="w-6 h-6 bg-sp_green/20 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                  {!sidebar.iconMode && <span>Create Event</span>}
                </div>
              </SidebarItem>

              {/* Navigation Items */}
              {[
                { id: "home", label: "Dashboard", icon: Home },
                { id: "library", label: "Event Library", icon: Folder },
                { id: "community", label: "Community", icon: Globe },
                { id: "photos", label: "Photos", icon: Images },
                { id: "guests", label: "Guests", icon: Users },
              ].map((item) => (
                <div key={item.id} className="relative group">
                  <SidebarItem
                    onClick={() => onTabChange(item.id as any)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {!sidebar.iconMode && <span>{item.label}</span>}
                  </SidebarItem>

                  {/* Tooltip for collapsed mode */}
                  {sidebar.iconMode && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-sp_darkgreen dark:bg-sp_dark_surface text-white dark:text-sp_eggshell text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!sidebar.iconMode && (
              <>
                {/* Starred Events Section */}
                <div className="px-2 mt-6">
                  <button
                    onClick={() => toggleSection("starred")}
                    className="flex items-center gap-2 w-full px-2 py-1 text-xs text-sp_green/60 dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell transition-colors"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        expandedSections.starred ? "" : "-rotate-90"
                      }`}
                    />
                    <span className="font-medium uppercase tracking-wide">
                      Starred Events
                    </span>
                  </button>

                  {expandedSections.starred && (
                    <div className="mt-2 space-y-px">
                      {starredEvents.map((event, index) => (
                        <div key={index} className="relative group">
                          <SidebarItem
                            className="text-xs pr-8"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  event.status === "active"
                                    ? "bg-sp_lightgreen"
                                    : event.status === "ended"
                                    ? "bg-sp_green/50"
                                    : "bg-sp_midgreen/50"
                                }`}
                              />
                              <span className="truncate">{event.name}</span>
                            </div>
                          </SidebarItem>
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/10 rounded transition-all">
                            <MoreHorizontal className="w-3 h-3 text-sp_green/60 dark:text-sp_eggshell/70" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activities Section */}
                <div className="px-2 mt-6">
                  <button
                    onClick={() => toggleSection("recent")}
                    className="flex items-center gap-2 w-full px-2 py-1 text-xs text-sp_green/60 dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell transition-colors"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        expandedSections.recent ? "" : "-rotate-90"
                      }`}
                    />
                    <span className="font-medium uppercase tracking-wide">
                      Recent Activity
                    </span>
                  </button>

                  {expandedSections.recent && (
                    <div className="mt-2 space-y-px max-h-80 overflow-y-auto">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="relative group">
                          <SidebarItem className="text-xs pr-8">
                            <span className="truncate">{activity}</span>
                          </SidebarItem>
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/10 rounded transition-all">
                            <MoreHorizontal className="w-3 h-3 text-sp_green/60 dark:text-sp_eggshell/70" />
                          </button>
                        </div>
                      ))}

                      {/* View All Activities */}
                      <SidebarItem className="text-xs justify-center text-sp_green/60 dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell">
                        <MoreHorizontal className="w-4 h-4 mr-2" />
                        <span>View all activities</span>
                      </SidebarItem>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Section*/}
          <div className="flex-shrink-0">
            {/* Dark Mode Toggle */}
            {!sidebar.iconMode && (
              <div className="px-2 pb-2">
                <SidebarItem
                  onClick={() => darkMode.setDarkMode(!darkMode.darkMode)}
                >
                  {darkMode.darkMode ? (
                    <Sun className="w-4 h-4 mr-3" />
                  ) : (
                    <Moon className="w-4 h-4 mr-3" />
                  )}
                  <span>{darkMode.darkMode ? "Light Mode" : "Dark Mode"}</span>
                </SidebarItem>
              </div>
            )}

            {/* User Profile */}
            <div className="p-2 border-t border-sp_eggshell/30 dark:border-sp_lightgreen/20">
              <div className="relative" ref={profileMenuRef}>
                <SidebarItem
                  className="py-3"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div
                    className={`flex items-center w-full ${
                      sidebar.iconMode ? "justify-center" : "gap-3"
                    }`}
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-br from-sp_midgreen to-sp_green rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {getInitials()}
                      </div>
                    )}
                    {!sidebar.iconMode && (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-sp_darkgreen dark:text-sp_eggshell truncate">
                            {userData.firstName} {userData.lastName}
                          </div>
                          <div className="text-xs text-sp_green/60 dark:text-sp_eggshell/70">
                            Pro plan
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-sp_green/60 dark:text-sp_eggshell/70 flex-shrink-0" />
                      </>
                    )}
                  </div>
                </SidebarItem>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute ${
                        sidebar.iconMode ? "left-full ml-2" : "bottom-full mb-2"
                      } ${
                        sidebar.iconMode ? "w-64" : "left-0 right-0"
                      } bg-white dark:bg-sp_darkgreen border border-sp_eggshell/30 dark:border-sp_lightgreen/20 rounded-xl shadow-lg z-50`}
                    >
                      <div className="p-3 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                        <p className="font-medium text-sp_darkgreen dark:text-sp_eggshell">
                          {userData.firstName} {userData.lastName}
                        </p>
                        <p className="text-sm text-sp_green/70 dark:text-sp_eggshell/70">
                          {userData.email}
                        </p>
                        <p className="text-xs text-sp_green/60 dark:text-sp_eggshell/60">
                          Free plan
                        </p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                          <UserIcon className="w-4 h-4" />
                          Profile Settings
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                          <CreditCard className="w-4 h-4" />
                          Subscription
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                          <Bell className="w-4 h-4" />
                          Notifications
                        </button>
                        <button
                          onClick={() =>
                            setShowBrandingPanel(!showBrandingPanel)
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg"
                        >
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
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

            {/* Collapse Toggle - Only show when threshold is met */}
            {!isMobile && sidebar.canCollapse && (
              <div className="px-4 pb-2">
                <button
                  onClick={sidebar.toggleIconMode}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 transition-colors text-sp_green/70 dark:text-sp_eggshell/70 ${
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

            {/* Branding Panel */}
            <AnimatePresence>
              {showBrandingPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-20 left-2 right-2 bg-white dark:bg-sp_dark_surface border border-sp_eggshell/30 dark:border-sp_lightgreen/20 rounded-xl shadow-lg z-50"
                >
                  <div className="p-3 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                    <h3 className="font-semibold text-sp_darkgreen dark:text-sp_eggshell">
                      spevents
                    </h3>
                    <p className="text-sm text-sp_green/70 dark:text-sp_eggshell/70">
                      Event Management Platform
                    </p>
                  </div>
                  <div className="p-2">
                    <a
                      href="https://www.spevents.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Main Website
                    </a>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                      <HelpCircle className="w-4 h-4" />
                      FAQ
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sp_green dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg">
                      <Mail className="w-4 h-4" />
                      Contact Support
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
  }
);

SidebarNav.displayName = "SidebarNav";

export default SidebarNav;
