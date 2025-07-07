// file: src/pages/HostRoutes/EventDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Camera,
  Eye,
  Plus,
  Pause,
  Play,
  Presentation,
  Trash2,
  LogOut,
  Folder,
  Globe,
  Moon,
  Sun,
  QrCode,
  User,
  CreditCard,
  Bell,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Event, useEvent } from "../../contexts/EventContext";

// const colors = {
//   EGGSHELL: "#dad7cd",
//   LIGHTGREEN: "#a3b18a",
//   GREEN: "#3a5a40",
//   DARKGREEN: "#344e41",
// };

export function EventDashboard() {
  const navigate = useNavigate();
  const {
    events,
    isLoading,
    error,
    createEvent,
    selectEvent,
    startEvent,
    endEvent,
    deleteEvent,
  } = useEvent();

  const [activeTab, setActiveTab] = useState<"home" | "library" | "community">(
    "home",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  // Mock user data - replace with real auth data
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    company: "Example Corp",
  };

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const activeEvents = events.filter((e) => e.status === "active").length;
  const totalPhotos = events.reduce((sum, e) => sum + (e.photoCount || 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + (e.guestCount || 0), 0);

  const getInitials = () => {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
  };

  const getDisplayName = () => {
    return `${userData.firstName} ${userData.lastName}`.trim();
  };

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

  const handleEventClick = (event: Event) => {
    selectEvent(event.id);
    navigate(`/host/event/${event.id}/gallery`);
  };

  const handleSignOut = async () => {
    // Implement sign out logic
    navigate("/login");
  };

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "ended":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
    }
  };

  const SidebarNav = () => (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-600 dark:bg-green-500">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
            spevents
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "library", label: "Library", icon: Folder },
            { id: "community", label: "Community", icon: Globe },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          <span className="font-medium">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium bg-green-500 dark:bg-green-600">
              {getInitials()}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                {getDisplayName()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {userData.email}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">
                  {getDisplayName()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.email}
                </p>
                {userData.company && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userData.company}
                  </p>
                )}
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const HomeContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Events
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userData.firstName}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your events today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Events",
              value: events.length.toString(),
              icon: Calendar,
              color: "blue",
            },
            {
              label: "Active Events",
              value: activeEvents.toString(),
              icon: Eye,
              color: "green",
            },
            {
              label: "Total Photos",
              value: totalPhotos.toLocaleString(),
              icon: Camera,
              color: "purple",
            },
            {
              label: "Total Guests",
              value: totalGuests.toLocaleString(),
              icon: Users,
              color: "orange",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}
                >
                  <stat.icon
                    className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Events
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No events yet, you're no fun! 😄
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating your first event.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {event.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Created {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>🔢 Code: {event.sessionCode}</span>
                        <span>📸 {event.photoCount || 0} photos</span>
                        <span>👥 {event.guestCount || 0} guests</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          event.status,
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const LibraryContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Events
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Event Library
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all your created events
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No events created yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start building amazing photo experiences for your events. Create
              your first event to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-green-600 dark:hover:text-green-400"
                      onClick={() => handleEventClick(event)}
                    >
                      {event.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status,
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Created {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span>🔢 {event.sessionCode}</span>
                      <span className="mx-2">•</span>
                      <span>📸 {event.photoCount || 0}</span>
                      <span className="mx-2">•</span>
                      <span>👥 {event.guestCount || 0}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => handleEventClick(event)}
                      className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/host/event/${event.id}/qr`)}
                      className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <QrCode className="w-4 h-4" />
                      QR
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {event.status === "draft" && (
                      <button
                        onClick={() => startEvent(event.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-600"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    )}
                    {event.status === "active" && (
                      <button
                        onClick={() => endEvent(event.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                      >
                        <Pause className="w-4 h-4" />
                        End
                      </button>
                    )}
                    <button
                      onClick={() =>
                        navigate(`/host/event/${event.id}/slideshow`)
                      }
                      className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Presentation className="w-4 h-4" />
                      Show
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CommunityContent = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Community Templates
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Discover and share beautiful event presentation designs
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
          Coming Soon
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      <SidebarNav />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {activeTab === "home" && <HomeContent />}
            {activeTab === "library" && <LibraryContent />}
            {activeTab === "community" && <CommunityContent />}
          </div>
        </main>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}

// Create Event Modal Component
function CreateEventModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Event Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Wedding Reception, Company Party, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
            >
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
