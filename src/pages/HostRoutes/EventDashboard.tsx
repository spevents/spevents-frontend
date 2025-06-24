// src/pages/HostRoutes/EventDashboard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Users,
  Camera,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  QrCode,
  Presentation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../../contexts/EventContext";
import { Event } from "../../types/event";

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Events</h1>
              <p className="text-gray-400">
                Manage your photo collection events
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No events yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first event to start collecting photos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Create First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-white mb-1 cursor-pointer hover:text-blue-400"
                      onClick={() => handleEventClick(event)}
                    >
                      {event.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === event.id ? null : event.id,
                        )
                      }
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeDropdown === event.id && (
                      <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[150px]">
                        <button
                          onClick={() => navigate(`/host/event/${event.id}/qr`)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/host/event/${event.id}/slideshow`)
                          }
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Presentation className="w-4 h-4" />
                          Slideshow
                        </button>

                        {event.status === "draft" && (
                          <button
                            onClick={() => startEvent(event.id)}
                            className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-gray-600 flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Start Event
                          </button>
                        )}

                        {event.status === "active" && (
                          <button
                            onClick={() => endEvent(event.id)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-400 hover:bg-gray-600 flex items-center gap-2"
                          >
                            <Pause className="w-4 h-4" />
                            End Event
                          </button>
                        )}

                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>{event.photoCount} photos</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Code: {event.sessionCode}</span>
                  </div>

                  <div>
                    Created {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleEventClick(event)}
                  className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  View Gallery
                </button>
              </motion.div>
            ))}
          </div>
        )}
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
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="Wedding Reception, Company Party, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
