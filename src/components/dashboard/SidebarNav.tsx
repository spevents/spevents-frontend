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

    // Calculate sidebar width based on state
    const getSidebarWidth = () => {
      if (isMobile) return "280px";
      if (sidebar.iconMode) return "80px";
      return "280px";
    };

    const state = sidebar.collapsed ? "collapsed" : "expanded";

    return (
      <div
        className="group peer hidden md:block"
        data-state={state}
        data-collapsible={sidebar.collapsed ? "offcanvas" : ""}
        data-variant="sidebar"
        data-side="left"
      >
        {/* Mobile overlay */}
        {isMobile && !sidebar.collapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => sidebar.setCollapsed(true)}
          />
        )}

        {/* Sidebar gap/spacer - reserves space for sidebar */}
        <div
          className="relative bg-transparent transition-[width] duration-300 ease-in-out group-data-[collapsible=offcanvas]:w-0"
          style={{
            width: sidebar.collapsed ? "0px" : getSidebarWidth(),
          }}
        />

        {/* Sidebar container */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40 h-screen transition-[left,width] duration-300 ease-in-out md:flex
            ${
              sidebar.collapsed
                ? "left-[calc(var(--sidebar-width)*-1)]"
                : "left-0"
            }
            ${isMobile ? "z-50" : ""}
          `}
          style={
            {
              width: getSidebarWidth(),
              "--sidebar-width": getSidebarWidth(),
            } as React.CSSProperties
          }
        >
          {/* Sidebar content */}
          <div
            ref={ref}
            data-sidebar="sidebar"
            className="h-full bg-white dark:bg-sp_darkgreen border-r border-sp_eggshell/30 dark:border-sp_lightgreen/20 flex flex-col w-full"
          >
            {/* Sidebar Header */}
            <div
              data-sidebar="header"
              className="flex items-center gap-2 p-4 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20"
            >
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

            {/* Sidebar Content */}
            <div
              data-sidebar="content"
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"
            >
              {/* Main Navigation Group */}
              <div
                data-sidebar="group"
                className="relative flex w-full min-w-0 flex-col p-2"
              >
                <div data-sidebar="group-content" className="w-full text-sm">
                  {/* Sidebar Menu */}
                  <ul
                    data-sidebar="menu"
                    className="flex w-full min-w-0 flex-col gap-1"
                  >
                    {/* Create Event Button */}
                    <li
                      data-sidebar="menu-item"
                      className="group/menu-item relative"
                    >
                      <button
                        data-sidebar="menu-button"
                        onClick={onCreateEvent}
                        className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] bg-gradient-to-r from-sp_green to-sp_lightgreen hover:from-sp_lightgreen hover:to-sp_darkgreen text-white font-medium"
                      >
                        <div className="w-6 h-6 bg-sp_green/20 rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </div>
                        {!sidebar.iconMode && (
                          <span className="truncate">Create Event</span>
                        )}
                      </button>
                    </li>

                    {/* Navigation Items */}
                    {[
                      { id: "home", label: "Dashboard", icon: Home },
                      { id: "library", label: "Event Library", icon: Folder },
                      { id: "community", label: "Community", icon: Globe },
                      { id: "photos", label: "Photos", icon: Images },
                      { id: "guests", label: "Guests", icon: Users },
                    ].map((item) => (
                      <li
                        key={item.id}
                        data-sidebar="menu-item"
                        className="group/menu-item relative"
                      >
                        <button
                          data-sidebar="menu-button"
                          data-active={currentActiveTab === item.id}
                          onClick={() => handleNavigation(item.id)}
                          className={`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-sp_green dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell ${
                            currentActiveTab === item.id
                              ? "bg-sp_lightgreen text-sp_eggshell dark:text-sp_eggshell/100 border border-sp_lightgreen/30"
                              : "text-sp_darkgreen dark:text-sp_eggshell"
                          }`}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          {!sidebar.iconMode && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </button>

                        {/* Tooltip for collapsed mode */}
                        {sidebar.iconMode && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-sp_darkgreen dark:bg-sp_dark_surface text-white dark:text-sp_eggshell text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {!sidebar.iconMode && (
                <>
                  {/* Starred Events Group */}
                  <div
                    data-sidebar="group"
                    className="relative flex w-full min-w-0 flex-col p-2"
                  >
                    <button
                      data-sidebar="group-label"
                      onClick={() => toggleSection("starred")}
                      className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 text-sp_darkgreen dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell gap-2"
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
                      <div
                        data-sidebar="group-content"
                        className="w-full text-sm"
                      >
                        <ul
                          data-sidebar="menu"
                          className="flex w-full min-w-0 flex-col gap-1 mt-2"
                        >
                          {starredEvents.map((event, index) => (
                            <li
                              key={index}
                              data-sidebar="menu-item"
                              className="group/menu-item relative"
                            >
                              <button
                                data-sidebar="menu-button"
                                onClick={() => handleEventClick(event)}
                                className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-xs outline-hidden transition-[width,height,padding] hover:bg-sp_green dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell text-sp_darkgreen dark:text-sp_eggshell pr-8"
                              >
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
                              </button>
                              <button
                                data-sidebar="menu-action"
                                className="absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform opacity-0 group-hover:opacity-100 hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/10"
                              >
                                <MoreHorizontal className="w-3 h-3 text-sp_green/60 dark:text-sp_eggshell/70" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recent Activities Group */}
                  <div
                    data-sidebar="group"
                    className="relative flex w-full min-w-0 flex-col p-2"
                  >
                    <button
                      data-sidebar="group-label"
                      onClick={() => toggleSection("recent")}
                      className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 text-sp_darkgreen dark:text-sp_eggshell/70 hover:text-sp_green dark:hover:text-sp_eggshell gap-2"
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
                      <div
                        data-sidebar="group-content"
                        className="w-full text-sm"
                      >
                        <ul
                          data-sidebar="menu"
                          className="flex w-full min-w-0 flex-col gap-1 mt-2 max-h-40 overflow-y-auto"
                        >
                          {recentActivities.map((activity, index) => (
                            <li
                              key={index}
                              data-sidebar="menu-item"
                              className="group/menu-item relative"
                            >
                              <button
                                data-sidebar="menu-button"
                                className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-xs outline-hidden transition-[width,height,padding] hover:bg-sp_green dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell text-sp_darkgreen dark:text-sp_eggshell pr-8"
                              >
                                <span className="truncate">{activity}</span>
                              </button>
                              <button
                                data-sidebar="menu-action"
                                className="absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform opacity-0 group-hover:opacity-100 hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/10"
                              >
                                <MoreHorizontal className="w-3 h-3 text-sp_green/60 dark:text-sp_eggshell/70" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar Footer */}
            <div
              data-sidebar="footer"
              className="flex flex-col gap-2 flex-shrink-0"
            >
              {/* Dark Mode Toggle */}
              {!sidebar.iconMode && (
                <div className="px-2 pb-2">
                  <button
                    onClick={() => darkMode.setDarkMode(!darkMode.darkMode)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-sp_darkgreen dark:text-sp_eggshell hover:bg-sp_green dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell rounded-lg transition-all duration-200"
                  >
                    {darkMode.darkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    <span>
                      {darkMode.darkMode ? "Light Mode" : "Dark Mode"}
                    </span>
                  </button>
                </div>
              )}

              {/* User Profile */}
              <div className="p-2 border-t border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center w-full px-3 py-3 text-sm text-sp_darkgreen dark:text-sp_eggshell hover:bg-sp_green dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell rounded-lg transition-all duration-200"
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
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute ${
                          sidebar.iconMode
                            ? "left-full ml-2"
                            : "bottom-full mb-2"
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
        </div>
      </div>
    );
  },
);

SidebarNav.displayName = "SidebarNav";

export default SidebarNav;
