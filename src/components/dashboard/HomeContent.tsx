// src/components/dashboard/HomeContent.tsx

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Camera, Users, Plus, ArrowRight, Zap } from "lucide-react";

import { useEvent } from "../../contexts/EventContext";
import { useAuth } from "../../components/auth/AuthProvider";
import Carousel from "./Carousel";

interface HomeContentProps {
  onCreateEvent: () => void;
}

// Mock photos for carousel
const mockPhotos = [
  {
    id: 1,
    url: "/placeholder.svg?height=200&width=300",
    event: "Summer Wedding",
  },
  {
    id: 2,
    url: "/placeholder.svg?height=200&width=300",
    event: "Corporate Gala",
  },
  {
    id: 3,
    url: "/placeholder.svg?height=200&width=300",
    event: "Birthday Party",
  },
  { id: 4, url: "/placeholder.svg?height=200&width=300", event: "Anniversary" },
  { id: 5, url: "/placeholder.svg?height=200&width=300", event: "Graduation" },
];

const HomeContent = memo(({ onCreateEvent }: HomeContentProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, isLoading, error, selectEvent } = useEvent();

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

  const stats = useMemo(() => {
    const activeEvents = events.filter((e) => e.status === "active").length;
    const totalPhotos = events.reduce((sum, e) => sum + (e.photoCount || 0), 0);
    const totalGuests = events.reduce((sum, e) => sum + (e.guestCount || 0), 0);
    return { activeEvents, totalPhotos, totalGuests };
  }, [events]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-sp_lightgreen/20 text-sp_darkgreen dark:text-sp_lightgreen border-sp_lightgreen/30";
      case "ended":
        return "bg-sp_eggshell/20 text-sp_darkgreen dark:text-sp_dark_text border-sp_eggshell/30";
      default:
        return "bg-sp_midgreen/20 text-sp_green dark:text-sp_lightgreen border-sp_midgreen/30";
    }
  };

  const handleEventClick = (event: any) => {
    selectEvent(event.id);
    navigate(`/host/event/${event.id}/gallery`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-sp_eggshell/50 dark:bg-sp_dark_surface rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-sp_eggshell/50 dark:bg-sp_dark_surface rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-sp_dark_surface p-6 rounded-xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20"
              >
                <div className="h-4 bg-sp_eggshell/50 dark:bg-sp_dark_bg rounded mb-2"></div>
                <div className="h-8 bg-sp_eggshell/50 dark:bg-sp_dark_bg rounded"></div>
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
            Error Loading Events
          </h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sp_lightgreen/10 to-sp_midgreen/10 dark:from-sp_lightgreen/20 dark:to-sp_midgreen/20 rounded-2xl p-6 border border-sp_lightgreen/20">
        <h2 className="text-3xl font-bold text-sp_darkgreen dark:text-sp_dark_text mb-2">
          Welcome back, {userData.firstName}! 👋
        </h2>
        <p className="text-sp_green/80 dark:text-sp_dark_muted">
          Here's what's happening with your events today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Events",
            value: events.length.toString(),
            icon: Calendar,
            gradient: "from-sp_lightgreen to-sp_midgreen",
          },
          {
            label: "Active Events",
            value: stats.activeEvents.toString(),
            icon: Zap,
            gradient: "from-sp_midgreen to-sp_green",
          },
          {
            label: "Total Photos",
            value: stats.totalPhotos.toLocaleString(),
            icon: Camera,
            gradient: "from-sp_green to-sp_darkgreen",
          },
          {
            label: "Total Guests",
            value: stats.totalGuests.toLocaleString(),
            icon: Users,
            gradient: "from-sp_darkgreen to-sp_green",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-sp_dark_surface p-6 rounded-xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sp_green/70 dark:text-sp_dark_muted">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-sp_darkgreen dark:text-sp_dark_text mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_dark_text">
            Recent Events
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateEvent}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sp_midgreen to-sp_green text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </motion.button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-sp_dark_surface rounded-2xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20">
            <Calendar className="w-16 h-16 text-sp_green/50 dark:text-sp_dark_muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-sp_darkgreen dark:text-sp_dark_text mb-6">
              You're no fun...
            </h3>
            <button
              onClick={onCreateEvent}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sp_midgreen to-sp_green text-white rounded-xl hover:shadow-lg transition-all mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.slice(0, 3).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleEventClick(event)}
                className="bg-white dark:bg-sp_dark_surface p-6 rounded-xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-sp_darkgreen dark:text-sp_dark_text group-hover:text-sp_green dark:group-hover:text-sp_lightgreen transition-colors">
                        {event.name}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-sp_green/50 dark:text-sp_dark_muted group-hover:text-sp_green dark:group-hover:text-sp_lightgreen group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sp_green/70 dark:text-sp_dark_muted text-sm mb-3">
                      Created {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-sp_green/60 dark:text-sp_dark_muted">
                      <span>🔢 {event.sessionCode}</span>
                      <span>📸 {event.photoCount || 0} photos</span>
                      <span>👥 {event.guestCount || 0} guests</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      event.status,
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Photos Carousel */}
      {events.length > 0 && (
        <Carousel title="Recent Photos">
          {mockPhotos.map((photo) => (
            <div key={photo.id} className="w-1/3 flex-shrink-0 px-2">
              <div className="bg-white dark:bg-sp_dark_surface rounded-xl overflow-hidden border border-sp_eggshell/30 dark:border-sp_lightgreen/20">
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={`Photo from ${photo.event}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-medium text-sp_darkgreen dark:text-sp_dark_text">
                    {photo.event}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}
    </motion.div>
  );
});

HomeContent.displayName = "HomeContent";

export default HomeContent;
