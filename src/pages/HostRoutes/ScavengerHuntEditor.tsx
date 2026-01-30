// src/pages/HostRoutes/ScavengerHuntEditor.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  Camera,
  Trophy,
  Settings,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { eventService } from "@/services/api";
import { Event, ScavengerHuntTask, ScavengerHuntConfig } from "@/types/event";

// Default tasks for Mock Shaadi
const DEFAULT_TASKS: ScavengerHuntTask[] = [
  {
    id: "task-1",
    title: "Take a picture with the groom",
    description: "Find Adib and snap a photo together",
    points: 10,
    order: 1,
  },
  {
    id: "task-2",
    title: "Steal the groom's sunglasses",
    description: "Borrow his shades and take a selfie wearing them",
    points: 15,
    order: 2,
  },
  {
    id: "task-3",
    title: "Take a picture with the groom's shoe",
    description: "Classic juta chupai moment!",
    points: 20,
    order: 3,
  },
  {
    id: "task-4",
    title: "Pose with the bride",
    description: "Find Feroza and strike a pose",
    points: 10,
    order: 4,
  },
  {
    id: "task-5",
    title: "Take one of the bride's bangles",
    description: "Borrow a bangle and show it off",
    points: 15,
    order: 5,
  },
  {
    id: "task-6",
    title: "Take a selfie with 6 people",
    description: "The more the merrier!",
    points: 25,
    order: 6,
  },
];

const DEFAULT_CONFIG: ScavengerHuntConfig = {
  enabled: false,
  tasks: [],
  settings: {
    requireName: true,
    showLeaderboard: true,
    maxPhotosPerTask: 1,
  },
};

export function ScavengerHuntEditor() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [config, setConfig] = useState<ScavengerHuntConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      try {
        const eventData = await eventService.getEvent(eventId);
        setEvent(eventData);
        if (eventData.scavengerHunt) {
          setConfig(eventData.scavengerHunt);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
      }
    };
    loadEvent();
  }, [eventId]);

  // Save config
  const handleSave = async () => {
    if (!eventId) return;
    setIsSaving(true);
    try {
      await eventService.updateEvent(eventId, { scavengerHunt: config });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle enabled
  const toggleEnabled = () => {
    setConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
    setHasChanges(true);
  };

  // Add new task
  const addTask = () => {
    const newTask: ScavengerHuntTask = {
      id: `task-${Date.now()}`,
      title: "",
      description: "",
      points: 10,
      order: config.tasks.length + 1,
    };
    setConfig((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    setHasChanges(true);
  };

  // Update task
  const updateTask = (taskId: string, updates: Partial<ScavengerHuntTask>) => {
    setConfig((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t,
      ),
    }));
    setHasChanges(true);
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setConfig((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    setHasChanges(true);
  };

  // Reorder tasks
  const handleReorder = (newOrder: ScavengerHuntTask[]) => {
    const reorderedTasks = newOrder.map((task, index) => ({
      ...task,
      order: index + 1,
    }));
    setConfig((prev) => ({ ...prev, tasks: reorderedTasks }));
    setHasChanges(true);
  };

  // Load default tasks
  const loadDefaults = () => {
    setConfig((prev) => ({ ...prev, tasks: DEFAULT_TASKS }));
    setHasChanges(true);
  };

  // Copy hunt URL
  const copyHuntUrl = useCallback(() => {
    if (!event?.sessionCode) return;
    const url = `https://join.spevents.live/${event.sessionCode}/guest/hunt`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [event?.sessionCode]);

  const huntUrl = event?.sessionCode
    ? `https://join.spevents.live/${event.sessionCode}/guest/hunt`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sp_eggshell to-sp_lightgreen/20">
      {/* Header */}
      <div className="bg-white border-b border-sp_lightgreen/30 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/host/event/${eventId}/gallery`)}
                className="p-2 hover:bg-sp_lightgreen/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-sp_darkgreen" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-sp_darkgreen">
                  Scavenger Hunt Setup
                </h1>
                <p className="text-sm text-sp_darkgreen/60">
                  {event?.name || "Loading..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-sp_green text-white rounded-lg hover:bg-sp_darkgreen disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Enable Toggle & QR Code */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-sp_lightgreen/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${config.enabled ? "bg-sp_green/10" : "bg-gray-100"}`}
              >
                <Trophy
                  className={`w-6 h-6 ${config.enabled ? "text-sp_green" : "text-gray-400"}`}
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sp_darkgreen">
                  Scavenger Hunt Mode
                </h2>
                <p className="text-sm text-sp_darkgreen/60">
                  Guests complete tasks and earn points
                </p>
              </div>
            </div>

            <button
              onClick={toggleEnabled}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                config.enabled ? "bg-sp_green" : "bg-gray-300"
              }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
                animate={{ left: config.enabled ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {config.enabled && event?.sessionCode && (
            <div className="pt-4 border-t border-sp_lightgreen/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-sp_darkgreen mb-1">
                    Hunt QR Code & Link
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-sp_lightgreen/20 px-2 py-1 rounded">
                      {huntUrl}
                    </code>
                    <button
                      onClick={copyHuntUrl}
                      className="p-1.5 hover:bg-sp_lightgreen/20 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-sp_green" />
                      ) : (
                        <Copy className="w-4 h-4 text-sp_darkgreen/60" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-2 px-3 py-2 bg-sp_lightgreen/20 rounded-lg hover:bg-sp_lightgreen/30 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  {showQR ? "Hide QR" : "Show QR"}
                </button>
              </div>

              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 flex justify-center"
                  >
                    <div className="p-4 bg-white rounded-xl border-2 border-sp_green">
                      <QRCodeSVG value={huntUrl} size={200} level="H" />
                      <p className="text-center text-sm text-sp_darkgreen/60 mt-2">
                        Scan to join the hunt!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Tasks Editor */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-sp_lightgreen/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-sp_green" />
              <h2 className="text-lg font-semibold text-sp_darkgreen">
                Hunt Tasks ({config.tasks.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {config.tasks.length === 0 && (
                <button
                  onClick={loadDefaults}
                  className="text-sm px-3 py-1.5 text-sp_green hover:bg-sp_lightgreen/20 rounded-lg transition-colors"
                >
                  Load Mock Shaadi Defaults
                </button>
              )}
              <button
                onClick={addTask}
                className="flex items-center gap-2 px-3 py-1.5 bg-sp_green text-white rounded-lg hover:bg-sp_darkgreen transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          {config.tasks.length === 0 ? (
            <div className="text-center py-12 text-sp_darkgreen/60">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tasks yet. Add some tasks for guests to complete!</p>
              <button
                onClick={loadDefaults}
                className="mt-4 text-sp_green hover:underline"
              >
                Or load Mock Shaadi defaults
              </button>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={config.tasks}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {config.tasks.map((task) => (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  className="bg-sp_eggshell rounded-lg p-4 border border-sp_lightgreen/30 cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-2 text-sp_darkgreen/30">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) =>
                          updateTask(task.id, { title: e.target.value })
                        }
                        placeholder="Task title (e.g., Take a selfie with the bride)"
                        className="w-full px-3 py-2 bg-white border border-sp_lightgreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sp_green/50"
                      />
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={task.description || ""}
                          onChange={(e) =>
                            updateTask(task.id, { description: e.target.value })
                          }
                          placeholder="Optional description"
                          className="flex-1 px-3 py-1.5 text-sm bg-white border border-sp_lightgreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sp_green/50"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-sp_darkgreen/60">
                            Points:
                          </span>
                          <input
                            type="number"
                            value={task.points}
                            onChange={(e) =>
                              updateTask(task.id, {
                                points: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1.5 text-sm text-center bg-white border border-sp_lightgreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sp_green/50"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-sp_lightgreen/30">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-sp_green" />
            <h2 className="text-lg font-semibold text-sp_darkgreen">
              Hunt Settings
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sp_darkgreen">
                Show live leaderboard on slideshow
              </span>
              <button
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      showLeaderboard: !prev.settings.showLeaderboard,
                    },
                  }));
                  setHasChanges(true);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.settings.showLeaderboard
                    ? "bg-sp_green"
                    : "bg-gray-300"
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                  animate={{
                    left: config.settings.showLeaderboard
                      ? "calc(100% - 22px)"
                      : "2px",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sp_darkgreen">
                Require guest name before playing
              </span>
              <button
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      requireName: !prev.settings.requireName,
                    },
                  }));
                  setHasChanges(true);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.settings.requireName ? "bg-sp_green" : "bg-gray-300"
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                  animate={{
                    left: config.settings.requireName
                      ? "calc(100% - 22px)"
                      : "2px",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
