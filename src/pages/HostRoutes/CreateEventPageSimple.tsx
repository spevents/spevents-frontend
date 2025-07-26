// File path: src/pages/HostRoutes/CreateEventPageSimple.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Copy, Check } from "lucide-react";
import { useEvent } from "@/contexts/EventContext";

export function CreateEventSimplePage() {
  const navigate = useNavigate();
  const { createEvent, selectEvent } = useEvent();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSessionCode, setCopiedSessionCode] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any>(null);
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

      // Store the created event to show session code
      setCreatedEvent(newEvent);
      selectEvent(newEvent.id);

      console.log("Event created with session code:", newEvent.sessionCode);
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvanced = () => {
    navigate("/host/create/advanced");
  };

  const copySessionCode = async () => {
    if (createdEvent?.sessionCode) {
      try {
        await navigator.clipboard.writeText(createdEvent.sessionCode);
        setCopiedSessionCode(true);
        setTimeout(() => setCopiedSessionCode(false), 2000);
      } catch (err) {
        console.error("Failed to copy session code:", err);
      }
    }
  };

  const proceedToGallery = () => {
    if (createdEvent) {
      navigate(`/host/event/${createdEvent.id}/gallery`);
    }
  };

  // Show success screen with session code after creation
  if (createdEvent) {
    return (
      <div className="min-h-screen bg-sp_eggshell/30 dark:bg-sp_dark_bg">
        <header className="bg-white dark:bg-sp_dark_surface border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => navigate("/host")}
                className="flex items-center gap-2 text-sp_green dark:text-sp_dark_text hover:text-sp_midgreen dark:hover:text-sp_lightgreen transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />x<span>Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_dark_text">
                Event Created Successfully
              </h1>
              <div className="w-24" />
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-sp_dark_surface rounded-2xl shadow-lg border border-sp_eggshell/30 dark:border-sp_lightgreen/20 p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-sp_darkgreen dark:text-sp_dark_text mb-2">
                "{createdEvent.name}" Created!
              </h2>
              <p className="text-sp_green dark:text-sp_dark_muted">
                Your event is ready. The session code below will stay the same
                even when you start the event.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-sp_eggshell/50 dark:bg-sp_dark_bg rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-sp_darkgreen dark:text-sp_dark_text mb-2">
                  Guest Session Code
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <code className="text-3xl font-mono font-bold bg-white dark:bg-sp_dark_surface px-4 py-2 rounded-lg border-2 border-sp_lightgreen/30 text-sp_darkgreen dark:text-sp_dark_text tracking-wider">
                    {createdEvent.sessionCode}
                  </code>
                  <button
                    onClick={copySessionCode}
                    className="p-2 bg-sp_lightgreen/20 hover:bg-sp_lightgreen/30 text-sp_green dark:text-sp_lightgreen rounded-lg transition-colors"
                    title="Copy session code"
                  >
                    {copiedSessionCode ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-sp_green/70 dark:text-sp_dark_muted">
                  Share this code with guests so they can join your event
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-sp_green dark:text-sp_dark_muted">
                  <strong>Important:</strong> This session code will remain the
                  same when you press "play" to start your event. Your guests
                  can use it immediately.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Next steps:</strong> Guests will scan a QR code
                    or use this session code to join. When you're ready for
                    photos, just press the "play" button to activate the event.
                  </p>
                </div>
              </div>

              <button
                onClick={proceedToGallery}
                className="w-full bg-gradient-to-r from-sp_midgreen to-sp_green text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all"
              >
                Go to Event Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Original creation form
  return (
    <div className="min-h-screen bg-sp_eggshell/30 dark:bg-sp_dark_bg">
      <header className="bg-white dark:bg-sp_dark_surface border-b border-sp_eggshell/30 dark:border-sp_lightgreen/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sp_green dark:text-sp_dark_text hover:text-sp_midgreen dark:hover:text-sp_lightgreen transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_dark_text">
              Create New Event
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-sp_dark_surface rounded-2xl shadow-lg border border-sp_eggshell/30 dark:border-sp_lightgreen/20 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-sp_darkgreen dark:text-sp_darkgreen mb-2">
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
                className="w-full border border-sp_eggshell/50 dark:border-sp_lightgreen/30 rounded-xl px-4 py-3 bg-white dark:bg-sp_darkgreen text-sp_darkgreen dark:text-sp_eggshell focus:ring-2 focus:ring-sp_midgreen focus:border-transparent transition-all"
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
                className="w-full border border-sp_eggshell/50 dark:border-sp_lightgreen/30 rounded-xl px-4 py-3 bg-white dark:bg-sp_dark_bg text-sp_darkgreen dark:text-sp_eggshell focus:ring-2 focus:ring-sp_midgreen focus:border-transparent transition-all"
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
              A unique session code will be generated that stays the same
              throughout your event
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
