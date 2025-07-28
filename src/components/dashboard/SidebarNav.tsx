// src/components/dashboard/SidebarNav.tsx
import { forwardRef, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Folder,
  Globe,
  Images,
  TrendingUp,
  Plus,
  ChevronDown,
  Sun,
  Moon,
  UserIcon,
  CreditCard,
  LogOut,
  PanelLeft,
  PanelLeftOpen,
  Boxes,
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
    const [_showToggleButton, setShowToggleButton] = useState(false);
    const [intentionallyCollapsed, setIntentionallyCollapsed] = useState(false);

    console.log("🔄 SidebarNav render:", {
      pathname: location.pathname,
      collapsed: sidebar.collapsed,
      iconMode: sidebar.iconMode,
      isMobile,
      intentionallyCollapsed,
    });

    const profileMenuRef = useRef<HTMLDivElement>(null);

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

    // Check mobile on mount and resize
    useEffect(() => {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        const wasIsMobile = isMobile;
        setIsMobile(mobile);
        if (mobile && !wasIsMobile) {
          console.log("📱 Setting collapsed due to mobile");
          sidebar.setCollapsed(true);
          setIntentionallyCollapsed(true);
        }
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, [sidebar, isMobile]);

    // Reset toggle button visibility when sidebar expands
    useEffect(() => {
      if (!sidebar.collapsed) {
        setShowToggleButton(false);
        setIntentionallyCollapsed(false);
      }
    }, [sidebar.collapsed]);

    // Determine if sidebar should be in icon mode (collapsed on desktop) or completely hidden (mobile)
    const isIconMode = !isMobile && sidebar.collapsed;
    const isHidden = isMobile && sidebar.collapsed;

    // Determine active route based on current path
    const getActiveRoute = () => {
      const path = location.pathname;
      if (path === "/host" || path === "/host/") return "home";
      if (path.includes("/host/library")) return "library";
      if (path.includes("/host/community")) return "community";
      if (path.includes("/host/photos")) return "photos";
      if (path.includes("/host/guest")) return "guests";
      if (path.includes("/host/models")) return "models";
      return "home";
    };

    const currentActiveTab = getActiveRoute();

    const handleNavigation = (route: string) => {
      console.log(
        "🔵 Navigation clicked:",
        route,
        "Sidebar collapsed:",
        sidebar.collapsed,
      );

      // Simply navigate without changing sidebar state
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
        case "models":
          navigate("/host/models");
          break;
        default:
          navigate("/host");
      }

      console.log("🟢 After navigation, Sidebar collapsed:", sidebar.collapsed);
    };

    // Handle middle area click in collapsed mode
    const handleMiddleAreaClick = () => {
      if (isIconMode) {
        sidebar.setCollapsed(false);
        setIntentionallyCollapsed(false);
      }
    };

    // Calculate sidebar width based on state
    const getSidebarWidth = () => {
      if (isIconMode) return "80px";
      if (isHidden) return "280px"; // Keep full width for mobile slide-in
      return "280px";
    };

    const state = isIconMode ? "collapsed" : "expanded";

    // Enhanced navigation items with icons and colors
    const navItems = [
      {
        id: "home",
        label: "Dashboard",
        icon: Home,
        color: "text-sp_green",
        hoverColor: "hover:text-sp_darkgreen",
      },
      {
        id: "library",
        label: "Event Library",
        icon: Folder,
        color: "text-sp_darkgreen",
        hoverColor: "hover:text-sp_green",
      },
      {
        id: "community",
        label: "Community",
        icon: Globe,
        color: "text-sp_darkgreen",
        hoverColor: "hover:text-sp_green",
      },
      {
        id: "photos",
        label: "Photos",
        icon: Images,
        color: "text-sp_green",
        hoverColor: "hover:text-sp_lightgreen",
      },
      {
        id: "guests",
        label: "Guests",
        icon: TrendingUp,
        color: "text-sp_darkgreen",
        hoverColor: "hover:text-sp_darkgreen",
      },
      {
        id: "models",
        label: "Models",
        icon: Boxes,
        color: "text-sp_darkgreen",
        hoverColor: "hover:text-sp_darkgreen",
      },
    ];

    return (
      <div
        className={`group peer ${isMobile ? "block" : "hidden md:block"}`}
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
            width: isHidden ? "0px" : isIconMode ? "80px" : "280px",
          }}
        />

        {/* Sidebar container - FIXED: Removed redundant nested fixed positioning */}
        <div
          className={`
            fixed inset-y-0 z-40 h-screen transition-[left,width] duration-300 ease-in-out group/sidebar
            ${isMobile && sidebar.collapsed ? "-left-full md:left-0" : "left-0"}
            ${isMobile ? "z-50" : ""}
            ${isIconMode ? "cursor-e-resize" : ""}
          `}
          style={
            {
              width: getSidebarWidth(),
              "--sidebar-width": getSidebarWidth(),
            } as React.CSSProperties
          }
          onClick={isIconMode ? handleMiddleAreaClick : undefined}
        >
          {/* Hover overlay with arrow for collapsed state */}
          {isIconMode && (
            <div className="absolute inset-0 bg-sp_darkgreen/10 dark:bg-sp_lightgreen/10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 pointer-events-none">
              {/* Removed chevron right icon blocking off the Guests icon */}
              {/* <div className="absolute right-2 top-1/2 -translate-y-1/2"> */}
              {/* <ChevronRight className="w-4 h-4 text-sp_darkgreen dark:text-sp_eggshell opacity-70" /> */}
              {/* </div> */}
            </div>
          )}

          {/* Sidebar content */}
          <div
            ref={ref}
            data-sidebar="sidebar"
            className="h-full bg-white dark:bg-sp_darkgreen border-r border-sp_eggshell/30 dark:border-sp_lightgreen/20 flex flex-col w-full overflow-hidden"
          >
            {/* Sidebar Header */}
            <div
              data-sidebar="header"
              className="flex flex-col gap-3 p-3 border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20 flex-shrink-0"
            >
              {/* Logo and Title - Fixed transition */}
              <div className="flex items-center justify-center relative overflow-hidden">
                {/* Icon container - always present to maintain layout */}
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0">
                  <img
                    src={darkMode.darkMode ? darkIcon : lightIcon}
                    alt="Spevents"
                    className="w-6 h-6 transition-all duration-300 ease-in-out"
                  />
                </div>

                {/* Text container - animated opacity and width */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isIconMode
                      ? "w-0 opacity-0 ml-0"
                      : "w-auto opacity-100 ml-2"
                  }`}
                >
                  <span className="text-lg font-bold text-sp_darkgreen dark:text-sp_eggshell whitespace-nowrap">
                    spevents
                  </span>
                </div>
              </div>

              {/* Create Event Button */}
              <button
                onClick={onCreateEvent}
                className={`group flex items-center overflow-hidden rounded-md p-2 text-left text-sm bg-gradient-to-r from-sp_green to-sp_lightgreen hover:from-sp_lightgreen hover:to-sp_darkgreen text-white font-medium transition-all duration-300 ${
                  isIconMode ? "justify-center" : "gap-2"
                }`}
              >
                <div
                  className={`bg-sp_green/20 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90 flex-shrink-0 ${
                    isIconMode ? "w-8 h-8" : "w-6 h-6"
                  }`}
                >
                  <Plus
                    className={`transition-all duration-300 ${
                      isIconMode ? "w-5 h-5" : "w-3 h-3"
                    }`}
                  />
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isIconMode
                      ? "w-0 opacity-0 ml-0"
                      : "w-auto opacity-100 ml-0"
                  }`}
                >
                  <span className="whitespace-nowrap">Create Event</span>
                </div>
              </button>
            </div>

            <div
              data-sidebar="content"
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {/* Main Navigation Group */}
              <div
                data-sidebar="group"
                className="relative flex w-full min-w-0 flex-col p-2 overflow-hidden"
              >
                <div data-sidebar="group-content" className="w-full text-sm">
                  <ul
                    data-sidebar="menu"
                    className={`flex w-full min-w-0 flex-col ${
                      isIconMode ? "gap-3" : "gap-1"
                    }`}
                  >
                    {navItems.map((item, index) => (
                      <li
                        key={item.id}
                        data-sidebar="menu-item"
                        className="group/menu-item relative"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: !isIconMode
                            ? "slideInFromLeft 0.5s ease-out forwards"
                            : undefined,
                        }}
                      >
                        <button
                          data-sidebar="menu-button"
                          data-active={currentActiveTab === item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(item.id);
                          }}
                          className={`peer/menu-button flex w-full items-center overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-all duration-300 hover:bg-sp_green/20 dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell ${
                            currentActiveTab === item.id
                              ? "bg-sp_lightgreen text-sp_eggshell dark:text-sp_eggshell/100 border border-sp_lightgreen/30"
                              : "text-sp_darkgreen dark:text-sp_eggshell"
                          } ${
                            isIconMode
                              ? "h-12 justify-center px-0"
                              : "h-9 gap-2"
                          }`}
                        >
                          {/* Icon container */}
                          <div className="relative flex items-center justify-center flex-shrink-0">
                            <item.icon
                              className={`transition-all duration-300 ${
                                currentActiveTab === item.id
                                  ? "text-sp_green"
                                  : `${item.color} dark:text-sp_eggshell group-hover:${item.hoverColor}`
                              } ${isIconMode ? "w-6 h-6" : "w-4 h-4"}`}
                            />
                          </div>

                          {/* Text container */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isIconMode
                                ? "w-0 opacity-0 ml-0"
                                : "w-auto opacity-100 ml-0"
                            }`}
                          >
                            <span className="whitespace-nowrap">
                              {item.label}
                            </span>
                          </div>
                        </button>

                        {/* Tooltip for collapsed mode */}
                        {isIconMode && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-sp_darkgreen dark:bg-sp_eggshell text-white dark:text-sp_darkgreen text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Middle area for click detection when collapsed */}
              {isIconMode && (
                <div
                  className="flex-1 min-h-[100px]"
                  onClick={handleMiddleAreaClick}
                />
              )}
            </div>

            {/* Sidebar Footer */}
            <div
              data-sidebar="footer"
              className="flex flex-col gap-2 flex-shrink-0"
            >
              {/* User Profile with integrated controls */}
              <div className="p-2 border-t border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                <div className="relative" ref={profileMenuRef}>
                  <div
                    className={`flex items-center gap-2 ${
                      isIconMode ? "flex-col gap-1" : ""
                    }`}
                  >
                    {isIconMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          darkMode.setDarkMode(!darkMode.darkMode);
                        }}
                        className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/20 transition-all duration-300"
                      >
                        <div className="relative h-4 w-4">
                          <Sun
                            className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out text-sp_green
                              dark:-rotate-90 dark:scale-0"
                          />
                          <Moon
                            className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out text-sp_eggshell
                              rotate-90 scale-0 dark:rotate-0 dark:scale-100"
                          />
                        </div>
                      </button>
                    )}

                    {/* Profile button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileMenu(!showProfileMenu);
                      }}
                      className={`flex items-center text-sm text-sp_darkgreen dark:text-sp_eggshell hover:bg-sp_lightgreen dark:hover:bg-sp_eggshell/10 hover:text-sp_darkgreen dark:hover:text-sp_eggshell rounded-lg transition-all duration-200 overflow-hidden ${
                        isIconMode
                          ? "px-2 py-2 justify-center"
                          : "flex-1 px-3 py-3 gap-3"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
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
                      </div>

                      {/* Profile info and chevron - FIXED: Better transition handling */}
                      <div
                        className={`flex items-center justify-between transition-all duration-300 ease-in-out overflow-hidden ${
                          isIconMode
                            ? "w-0 opacity-0 transform scale-x-0"
                            : "w-full opacity-100 transform scale-x-100"
                        }`}
                        style={{
                          transitionDelay: isIconMode ? "0ms" : "100ms",
                        }}
                      >
                        <div className="flex-1 min-w-0 whitespace-nowrap">
                          <div className="text-sm font-medium text-sp_darkgreen dark:text-sp_eggshell">
                            {userData.firstName}
                          </div>
                          <div className="text-xs text-sp_green/60 dark:text-sp_eggshell/70">
                            Free plan
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-sp_green/60 dark:text-sp_eggshell/70 flex-shrink-0 ml-2 transition-transform duration-300 ${
                            showProfileMenu ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Control buttons - only show when expanded */}
                    {!isIconMode && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newCollapsedState = !sidebar.collapsed;
                            sidebar.setCollapsed(newCollapsedState);
                            setIntentionallyCollapsed(newCollapsedState);
                            setShowToggleButton(false);
                          }}
                          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/20 transition-all duration-300"
                        >
                          <div className="relative h-4 w-4">
                            <PanelLeft
                              className={`absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out text-sp_darkgreen dark:text-sp_eggshell
                                ${
                                  sidebar.collapsed
                                    ? "opacity-100 scale-100 rotate-0"
                                    : "opacity-0 -rotate-90 scale-75"
                                }`}
                            />
                            <PanelLeftOpen
                              className={`absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out text-sp_darkgreen dark:text-sp_eggshell
                                ${
                                  sidebar.collapsed
                                    ? "opacity-0 rotate-90 scale-75"
                                    : "opacity-100 scale-100 rotate-0"
                                }`}
                            />
                          </div>
                        </button>

                        {/* Dark-mode toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            darkMode.setDarkMode(!darkMode.darkMode);
                          }}
                          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-sp_eggshell/20 dark:hover:bg-sp_lightgreen/20 transition-all duration-300"
                        >
                          <div className="relative h-4 w-4">
                            <Sun
                              className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out text-sp_green
                                dark:-rotate-90 dark:scale-0"
                            />
                            <Moon
                              className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out text-sp_eggshell
                                rotate-90 scale-0 dark:rotate-0 dark:scale-100"
                            />
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute ${
                          isIconMode ? "left-full ml-2" : "bottom-full mb-2"
                        } ${
                          isIconMode ? "w-64" : "left-0 right-0"
                        } bg-white dark:bg-sp_midgreen border border-sp_eggshell/30 dark:border-sp_lightgreen/20 rounded-xl shadow-lg z-50`}
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
                          <NavLink
                            to="/host/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sp_darkgreen dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg transition-colors duration-200"
                          >
                            <UserIcon className="w-4 h-4" />
                            Profile Settings
                          </NavLink>
                          <NavLink
                            to="/host/subscription"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sp_darkgreen dark:text-sp_eggshell hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 rounded-lg transition-colors duration-200"
                          >
                            <CreditCard className="w-4 h-4" />
                            Subscription
                          </NavLink>
                          <hr className="my-1 border-sp_eggshell/30 dark:border-sp_lightgreen/20" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
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
