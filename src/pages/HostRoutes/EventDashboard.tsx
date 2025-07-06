// src/pages/HostRoutes/EventDashboard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Users,
  Camera,
  Play,
  Pause,
  Trash2,
  Eye,
  QrCode,
  Presentation,
  Settings,
  User,
  LogOut,
  CreditCard,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event, useEvent } from "../../contexts/EventContext";

// Color palette constants
const colors = {
  eggshell: "#dad7cd",
  lightGreen: "#a3b18a",
  green: "#3a5a40",
  darkGreen: "#344e41",
};

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  // Calculate metrics
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "active").length;
  const totalPhotos = events.reduce(
    (sum, event) => sum + (event.photoCount || 0),
    0,
  );
  const totalGuests = events.length * 50; // Estimated, adjust based on your data structure

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return `bg-blue-100 text-blue-800`;
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.eggshell }}
      >
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.eggshell }}>
      {/* Header */}
      <header
        className="bg-white border-b"
        style={{ borderColor: `${colors.lightGreen}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/icon.svg" alt="spevents" className="w-10 h-10" />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.green }}
              >
                spevents
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="border border-opacity-30 text-sm px-3 py-1 rounded-md hover:bg-opacity-10 flex items-center gap-2"
                style={{
                  borderColor: colors.lightGreen,
                  color: colors.darkGreen,
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              {/* User Profile Component */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-offset-2"
                  style={{
                    backgroundColor: `${colors.lightGreen}20`,
                    color: colors.green,
                  }}
                >
                  <span className="text-sm font-medium">JD</span>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg z-50 min-w-[200px]"
                    style={{ borderColor: `${colors.lightGreen}30` }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: `${colors.lightGreen}20` }}
                    >
                      <p
                        className="font-medium"
                        style={{ color: colors.green }}
                      >
                        John Doe
                      </p>
                      <p className="text-sm text-gray-500">john@example.com</p>
                    </div>

                    <div className="py-1">
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        style={{ color: colors.darkGreen }}
                      >
                        <User className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        style={{ color: colors.darkGreen }}
                      >
                        <CreditCard className="w-4 h-4" />
                        Subscription
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        style={{ color: colors.darkGreen }}
                      >
                        <Bell className="w-4 h-4" />
                        Notifications
                      </button>
                      <hr
                        className="my-1"
                        style={{ borderColor: `${colors.lightGreen}20` }}
                      />
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: colors.green }}
          >
            Welcome back, John!
          </h2>
          <p style={{ color: colors.darkGreen }}>
            Manage your events and create amazing photo experiences.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Events",
              value: totalEvents.toString(),
              icon: Calendar,
            },
            {
              label: "Active Events",
              value: activeEvents.toString(),
              icon: Eye,
            },
            {
              label: "Total Photos",
              value: totalPhotos.toLocaleString(),
              icon: Camera,
            },
            {
              label: "Total Guests",
              value: totalGuests.toLocaleString(),
              icon: Users,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="border bg-white/80 backdrop-blur-sm rounded-lg p-6"
                style={{ borderColor: `${colors.lightGreen}20` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: colors.darkGreen }}>
                      {stat.label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: colors.green }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon
                    className="w-8 h-8"
                    style={{ color: colors.lightGreen }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Events Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold" style={{ color: colors.green }}>
              Your Events
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: colors.green }}
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>

          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${colors.lightGreen}20` }}
              >
                <Camera
                  className="w-12 h-12"
                  style={{ color: colors.lightGreen }}
                />
              </div>
              <h4
                className="text-xl font-semibold mb-2"
                style={{ color: colors.green }}
              >
                No events yet, you're no fun! 😄
              </h4>
              <p className="mb-6" style={{ color: colors.darkGreen }}>
                Create your first event and start collecting amazing photos from
                your guests.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 mx-auto"
                style={{ backgroundColor: colors.green }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Event
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: Event, index: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="border hover:border-opacity-80 transition-colors bg-white/80 backdrop-blur-sm rounded-lg"
                    style={{ borderColor: `${colors.lightGreen}20` }}
                  >
                    <div className="p-6 pb-3">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3
                            className="text-lg font-semibold cursor-pointer hover:opacity-80"
                            style={{ color: colors.green }}
                            onClick={() => handleEventClick(event)}
                          >
                            {event.name}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: colors.darkGreen }}
                          >
                            Created{" "}
                            {new Date(event.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          event.status,
                        )}`}
                      >
                        {event.status}
                      </div>
                    </div>

                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Users
                            className="w-4 h-4"
                            style={{ color: colors.lightGreen }}
                          />
                          <span style={{ color: colors.darkGreen }}>
                            Code: {event.sessionCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera
                            className="w-4 h-4"
                            style={{ color: colors.lightGreen }}
                          />
                          <span style={{ color: colors.darkGreen }}>
                            {event.photoCount || 0} photos
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => handleEventClick(event)}
                          className="border border-opacity-30 text-sm py-2 rounded-md hover:bg-opacity-10 flex items-center justify-center gap-1"
                          style={{
                            borderColor: colors.lightGreen,
                            color: colors.darkGreen,
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Gallery
                        </button>
                        <button
                          onClick={() => navigate(`/host/event/${event.id}/qr`)}
                          className="border border-opacity-30 text-sm py-2 rounded-md hover:bg-opacity-10 flex items-center justify-center gap-1"
                          style={{
                            borderColor: colors.lightGreen,
                            color: colors.darkGreen,
                          }}
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {event.status === "draft" && (
                          <button
                            onClick={() => startEvent(event.id)}
                            className="text-white text-sm py-2 rounded-md hover:opacity-90 flex items-center justify-center gap-1"
                            style={{ backgroundColor: colors.green }}
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </button>
                        )}

                        {event.status === "active" && (
                          <button
                            onClick={() => endEvent(event.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 rounded-md flex items-center justify-center gap-1"
                          >
                            <Pause className="w-4 h-4" />
                            End
                          </button>
                        )}

                        <button
                          onClick={() =>
                            navigate(`/host/event/${event.id}/slideshow`)
                          }
                          className="border border-opacity-30 text-sm py-2 rounded-md hover:bg-opacity-10 flex items-center justify-center gap-1"
                          style={{
                            borderColor: colors.lightGreen,
                            color: colors.darkGreen,
                          }}
                        >
                          <Presentation className="w-4 h-4" />
                          Show
                        </button>

                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-md flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
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
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: colors.green }}>
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.darkGreen }}
            >
              Event Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              style={{
                backgroundColor: colors.eggshell,
                borderColor: colors.lightGreen,
                color: colors.darkGreen,
              }}
              placeholder="Wedding Reception, Company Party, etc."
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.darkGreen }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              style={{
                backgroundColor: colors.eggshell,
                borderColor: colors.lightGreen,
                color: colors.darkGreen,
              }}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-lg hover:bg-opacity-10"
              style={{
                borderColor: colors.lightGreen,
                color: colors.darkGreen,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 text-white py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: colors.green }}
            >
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
