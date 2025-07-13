// src/pages/HostRoutes/CreateEventSimplePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";
import { useEvent } from "@/contexts/EventContext";

export function CreateEventSimplePage() {
  const navigate = useNavigate();
  const { createEvent, selectEvent } = useEvent();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const newEvent = await createEvent({
        name: formData.name.trim(),
        description: formData.description.trim() || "",
      });
      selectEvent(newEvent.id);
      navigate(`/host/event/${newEvent.id}/gallery`);
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvanced = () => {
    navigate("/host/create/advanced");
  };

  return (
    <div className="min-h-screen bg-sp_eggshell/30 dark:bg-sp_dark_bg">
      {/* Header */}
      <header className="bg-white dark:bg-sp_dark_surface border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/host")}
              className="flex items-center gap-2 text-sp_green dark:text-sp_dark_text hover:text-sp_midgreen dark:hover:text-sp_lightgreen transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_dark_text">
              Create New Event
            </h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-sp_dark_surface rounded-2xl shadow-lg border border-sp_eggshell/30 dark:border-sp_lightgreen/20 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-sp_darkgreen dark:text-sp_dark_text mb-2">
              Quick Event Setup
            </h2>
            <p className="text-sp_green dark:text-sp_dark_muted">
              Get started with the essentials, or use advanced mode for more
              customization
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-sp_green dark:text-sp_dark_muted">
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border border-sp_eggshell/50 dark:border-sp_lightgreen/30 rounded-xl px-4 py-3 bg-white dark:bg-sp_dark_bg text-sp_darkgreen dark:text-sp_dark_text focus:ring-2 focus:ring-sp_midgreen focus:border-transparent transition-all"
                placeholder="Wedding Reception, Company Party, Birthday..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-sp_green dark:text-sp_dark_muted">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full border border-sp_eggshell/50 dark:border-sp_lightgreen/30 rounded-xl px-4 py-3 bg-white dark:bg-sp_dark_bg text-sp_darkgreen dark:text-sp_dark_text focus:ring-2 focus:ring-sp_midgreen focus:border-transparent transition-all"
                placeholder="Brief description of your event..."
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleAdvanced}
                className="flex items-center justify-center gap-2 flex-1 border border-sp_eggshell/50 dark:border-sp_lightgreen/30 py-3 px-4 rounded-xl hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 text-sp_green dark:text-sp_dark_text transition-all"
              >
                <Settings className="w-4 h-4" />
                Advanced Setup
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-sp_midgreen to-sp_green text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-sp_green/70 dark:text-sp_dark_muted">
              You can always customize your event settings after creation
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
