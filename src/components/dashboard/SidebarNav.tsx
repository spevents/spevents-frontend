// src/components/dashboard/SidebarNav.tsx
import { forwardRef, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Folder,
  Globe,
  Images,
  Users,
  Plus,
  ChevronDown,
  Sun,
  Moon,
  UserIcon,
  Bell,
  CreditCard,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { useSidebar } from "@/hooks/useSideBar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAuth } from "../auth/AuthProvider";

import lightIcon from "@/assets/light-icon.svg";
import darkIcon from "@/assets/dark-icon.svg";

interface SidebarNavProps {
  onCreateEvent: () => void;
}

const SidebarNav = forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ onCreateEvent }, ref) => {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebar = useSidebar();
    const darkMode = useDarkMode();
    const { user, signOut } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    ];

    // Get user data from Firebase
    const getUserData = () => {
      if (!user) {
        return {
          firstName: "User",
          lastName: "",
          email: "user@example.com",
          company: "",
        };
      }

      const nameParts = user.name?.trim().split(" ") || [];
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || "";
      return { firstName, lastName, email: user.email, company: "" };
    };

    const userData = getUserData();

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

    // Check mobile on mount and resize
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

    // Inline SidebarItem component
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
          className={`flex items-center w-full px-3 py-2 text-sm text-sp_darkgreen dark:text-sp_eggshell hover:bg-sp_green dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell rounded-lg transition-all duration-200 group ${
            isActive
              ? "bg-sp_lightgreen text-sp_eggshell dark:text-sp_eggshell/100 border border-sp_lightgreen/30"
              : ""
          } ${className}`}
        >
          {children}
        </button>
      );
    };

    // Determine active route based on current path
    const getActiveRoute = () => {
      const path = location.pathname;
      if (path === "/host" || path === "/host/") return "home";
      if (path.includes("/host/library")) return "library";
      if (path.includes("/host/community")) return "community";
      if (path.includes("/host/photos")) return "photos";
      if (path.includes("/host/guest")) return "guests";
      return "home";
    };

    const currentActiveTab = getActiveRoute();

    const handleNavigation = (route: string) => {
      switch (route) {
        case "home":
          navigate("/host");
          break;
        case "library":
          navigate("/host/library");
          break;
        case "community":
          navigate("/host/community");
          break;
        case "photos":
          navigate("/host/photos");
          break;
        case "guests":
          navigate("/host/guest");
          break;
        default:
          navigate("/host");
      }
    };

    if (isMobile && sidebar.collapsed) {
      return null;
    }

    return (
      <>
        {/* Mobile overlay */}
        {isMobile && !sidebar.collapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => sidebar.setCollapsed(true)}
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          className={`
        ${isMobile ? "fixed left-0 top-0 z-50" : "relative"}
        h-screen bg-white dark:bg-sp_darkgreen border-r border-sp_eggshell/30 dark:border-sp_lightgreen/20
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebar.collapsed && !isMobile ? "w-20" : ""}
        ${sidebar.iconMode && !isMobile ? "w-20" : ""}
      `}
          style={{
            width: isMobile ? "280px" : sidebar.iconMode ? "80px" : "280px",
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
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation - Takes up remaining space */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Create Event Button */}
              <SidebarItem
                className="bg-gradient-to-r from-sp_green to-sp_lightgreen hover:from-sp_lightgreen hover:to-sp_darkgreen text-white font-medium"
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
                    onClick={() => handleNavigation(item.id)}
                    isActive={currentActiveTab === item.id}
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
                    className="flex items-center gap-2 w-full px-2 py-1 text-xs text-sp_darkgreen dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell transition-colors"
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
                                      : "bg-sp_darkgreen/50"
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
                    className="flex items-center gap-2 w-full px-2 py-1 text-xs text-sp_darkgreen dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell transition-colors"
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
                    <div className="mt-2 space-y-px max-h-40 overflow-y-auto">
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
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Section */}
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
                      <div className="w-7 h-7 bg-gradient-to-br from-sp_lightgreen to-sp_green rounded-full flex items-center justify-center text-sm font-medium text-white">
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
                            Free plan
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
                      } bg-white dark:bg-sp_dark_surface border border-sp_eggshell/30 dark:border-sp_lightgreen/20 rounded-xl shadow-lg z-50`}
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
          </div>
        </div>
      </>
    );
  },
);

SidebarNav.displayName = "SidebarNav";

export default SidebarNav;
