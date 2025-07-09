// src/components/dashboard/LibraryContent.tsx

import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Plus,
  Eye,
  QrCode,
  Play,
  Pause,
  Trash2,
  Presentation,
} from "lucide-react";

import { useEvent } from "../../contexts/EventContext";

interface LibraryContentProps {
  onCreateEvent: () => void;
}

const LibraryContent = memo(({ onCreateEvent }: LibraryContentProps) => {
  const navigate = useNavigate();
  const {
    events,
    isLoading,
    error,
    startEvent,
    endEvent,
    deleteEvent,
    selectEvent,
  } = useEvent();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-sp_dark_surface rounded-xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20 overflow-hidden"
              >
                <div className="h-32 bg-sp_eggshell/50 dark:bg-sp_dark_bg"></div>
                <div className="p-6">
                  <div className="h-6 bg-sp_eggshell/50 dark:bg-sp_dark_bg rounded mb-2"></div>
                  <div className="h-4 bg-sp_eggshell/50 dark:bg-sp_dark_bg rounded mb-4"></div>
                  <div className="h-10 bg-sp_eggshell/50 dark:bg-sp_dark_bg rounded"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-sp_darkgreen dark:text-sp_dark_text mb-2">
            Event Library
          </h2>
          <p className="text-sp_green/80 dark:text-sp_dark_muted">
            Manage all your created events
          </p>
        </div>
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
        <div className="text-center py-16 bg-white dark:bg-sp_dark_surface rounded-2xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20">
          <Folder className="w-20 h-20 text-sp_green/50 dark:text-sp_dark_muted mx-auto mb-6" />
          <h3 className="text-xl font-medium text-sp_darkgreen dark:text-sp_dark_text mb-2">
            No events created yet
          </h3>
          <p className="text-sp_green/70 dark:text-sp_dark_muted mb-8 max-w-md mx-auto">
            Start building amazing photo experiences for your events.
          </p>
          <button
            onClick={onCreateEvent}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sp_midgreen to-sp_green text-white rounded-xl hover:shadow-lg transition-all mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-sp_dark_surface rounded-xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Event Header with Gradient */}
              <div className="h-32 bg-gradient-to-br from-sp_lightgreen via-sp_midgreen to-sp_green relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">
                    {event.photoCount || 0}
                  </div>
                  <div className="text-sm opacity-90">Photos</div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3
                    className="font-semibold text-sp_darkgreen dark:text-sp_dark_text cursor-pointer hover:text-sp_green dark:hover:text-sp_lightgreen transition-colors mb-1"
                    onClick={() => handleEventClick(event)}
                  >
                    {event.name}
                  </h3>
                  <p className="text-sp_green/70 dark:text-sp_dark_muted text-sm">
                    Created {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Session Code and Guest Count */}
                <div className="flex justify-between items-center mb-4 text-sm text-sp_green/60 dark:text-sp_dark_muted">
                  <span>🔢 {event.sessionCode}</span>
                  <span>👥 {event.guestCount || 0} guests</span>
                </div>

                {/* Action Menu */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleEventClick(event)}
                    className="flex items-center gap-2 px-4 py-2 bg-sp_eggshell/50 hover:bg-sp_eggshell dark:bg-sp_dark_surface dark:hover:bg-sp_lightgreen/20 text-sp_darkgreen dark:text-sp_dark_text rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Status Control Button */}
                    {event.status === "draft" && (
                      <button
                        onClick={() => startEvent(event.id)}
                        className="p-2 bg-sp_lightgreen/20 hover:bg-sp_lightgreen/30 text-sp_green dark:text-sp_lightgreen rounded-lg transition-colors"
                        title="Start Event"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {event.status === "active" && (
                      <button
                        onClick={() => endEvent(event.id)}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-lg transition-colors"
                        title="End Event"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {event.status === "ended" && (
                      <button
                        onClick={() =>
                          navigate(`/host/event/${event.id}/slideshow`)
                        }
                        className="p-2 bg-sp_eggshell/50 hover:bg-sp_eggshell dark:bg-sp_dark_surface dark:hover:bg-sp_lightgreen/20 text-sp_darkgreen dark:text-sp_dark_text rounded-lg transition-colors"
                        title="View Slideshow"
                      >
                        <Presentation className="w-4 h-4" />
                      </button>
                    )}

                    {/* QR Code Button */}
                    <button
                      onClick={() => navigate(`/host/event/${event.id}/qr`)}
                      className="p-2 bg-sp_eggshell/50 hover:bg-sp_eggshell dark:bg-sp_dark_surface dark:hover:bg-sp_lightgreen/20 text-sp_darkgreen dark:text-sp_dark_text rounded-lg transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

LibraryContent.displayName = "LibraryContent";

export default LibraryContent;
