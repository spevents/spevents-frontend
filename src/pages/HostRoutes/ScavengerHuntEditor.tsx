// src/pages/HostRoutes/ScavengerHuntEditor.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
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
  CheckCircle,
  AlertCircle,
  Users,
  Medal,
  Award,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { eventService, getEventPhotos, EventPhoto } from "@/services/api";
import { useEvent } from "@/contexts/EventContext";
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
  const { loadEvents } = useEvent();

  const [event, setEvent] = useState<Event | null>(null);
  const [config, setConfig] = useState<ScavengerHuntConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Submissions tab state
  const [activeTab, setActiveTab] = useState<"tasks" | "submissions">("tasks");
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [verifiedPhotos, setVerifiedPhotos] = useState<Set<string>>(new Set());
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      setIsLoading(true);
      try {
        const eventData = await eventService.getEvent(eventId);
        setEvent(eventData);
        if (eventData.scavengerHunt) {
          setConfig(eventData.scavengerHunt);
          // Load verified photos from config
          if (eventData.scavengerHunt.verifiedSubmissions) {
            setVerifiedPhotos(
              new Set(eventData.scavengerHunt.verifiedSubmissions),
            );
          }
        }
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);

  // Load photos for submissions tab (with optional silent mode for polling)
  const loadPhotos = useCallback(async (silent = false) => {
    if (!eventId) return;
    if (!silent) setIsLoadingPhotos(true);
    try {
      const eventPhotos = await getEventPhotos(eventId);
      setPhotos(eventPhotos);
    } catch (error) {
      console.error("Failed to load photos:", error);
    } finally {
      if (!silent) setIsLoadingPhotos(false);
    }
  }, [eventId]);

  // Load photos when switching to submissions tab + auto-poll every 5 seconds
  useEffect(() => {
    if (activeTab === "submissions") {
      // Initial load with loading indicator
      loadPhotos(false);

      // Auto-poll silently (no flicker)
      const pollInterval = setInterval(() => {
        loadPhotos(true);
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [activeTab, loadPhotos]);

  // Filter hunt submissions and calculate leaderboard
  const huntSubmissions = useMemo(() => {
    return photos.filter((p) => p.huntTaskId && p.guestId);
  }, [photos]);

  // Calculate leaderboard from hunt submissions
  const leaderboard = useMemo(() => {
    const guestData = new Map<
      string,
      {
        guestId: string;
        guestName: string;
        submissions: EventPhoto[];
        verifiedCount: number;
        totalPoints: number;
      }
    >();

    huntSubmissions.forEach((photo) => {
      if (!photo.guestId) return;

      const existing = guestData.get(photo.guestId);
      const isVerified = verifiedPhotos.has(photo.fullKey);
      const task = config.tasks.find((t) => t.id === photo.huntTaskId);
      const points = isVerified && task ? task.points : 0;

      if (existing) {
        existing.submissions.push(photo);
        if (isVerified) existing.verifiedCount++;
        existing.totalPoints += points;
      } else {
        guestData.set(photo.guestId, {
          guestId: photo.guestId,
          guestName: photo.guestName || "Anonymous",
          submissions: [photo],
          verifiedCount: isVerified ? 1 : 0,
          totalPoints: points,
        });
      }
    });

    return Array.from(guestData.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints,
    );
  }, [huntSubmissions, verifiedPhotos, config.tasks]);

  // Toggle verification
  const toggleVerification = (photoKey: string) => {
    setVerifiedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoKey)) {
        newSet.delete(photoKey);
      } else {
        newSet.add(photoKey);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  // Save config
  const handleSave = async () => {
    if (!eventId) return;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      // Include verified submissions in the config
      const updatedConfig = {
        ...config,
        verifiedSubmissions: Array.from(verifiedPhotos),
      };
      console.log("Saving scavenger hunt config:", updatedConfig);
      await eventService.updateEvent(eventId, { scavengerHunt: updatedConfig });
      setHasChanges(false);
      setSaveStatus("success");

      // Refresh the event context so other components see the update
      await loadEvents();

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle enabled
  const toggleEnabled = () => {
    setConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
    setHasChanges(true);
  };

  // Add new task - AT THE TOP
  const addTask = () => {
    const newTask: ScavengerHuntTask = {
      id: `task-${Date.now()}`,
      title: "",
      description: "",
      points: 10,
      order: 0,
    };
    // Add at the beginning and re-order
    const updatedTasks = [newTask, ...config.tasks].map((t, i) => ({
      ...t,
      order: i + 1,
    }));
    setConfig((prev) => ({
      ...prev,
      tasks: updatedTasks,
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
    setConfig((prev) => ({ ...prev, tasks: DEFAULT_TASKS, enabled: true }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sp_eggshell flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sp_green/30 border-t-sp_green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sp_eggshell">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-sp_lightgreen/30 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(`/host/event/${eventId}/gallery`)}
                className="p-2 hover:bg-sp_lightgreen/20 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-sp_darkgreen" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-sp_darkgreen truncate">
                  Scavenger Hunt
                </h1>
                {event?.name && (
                  <p className="text-xs text-sp_darkgreen/60 truncate">
                    {event.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {saveStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved!</span>
                </motion.div>
              )}
              {saveStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Error</span>
                </motion.div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-1.5 px-3 py-2 bg-sp_green text-white rounded-lg hover:bg-sp_darkgreen disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-sp_lightgreen/30">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              activeTab === "tasks"
                ? "bg-sp_green text-white"
                : "text-sp_darkgreen hover:bg-sp_lightgreen/20"
            }`}
          >
            <Camera className="w-4 h-4" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              activeTab === "submissions"
                ? "bg-sp_green text-white"
                : "text-sp_darkgreen hover:bg-sp_lightgreen/20"
            }`}
          >
            <Users className="w-4 h-4" />
            Submissions
            {huntSubmissions.length > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === "submissions" ? "bg-white/20" : "bg-sp_green/20"
                }`}
              >
                {huntSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === "tasks" && (
          <>
            {/* Enable Toggle Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-sp_lightgreen/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${config.enabled ? "bg-sp_green/10" : "bg-gray-100"}`}
                  >
                    <Trophy
                      className={`w-5 h-5 ${config.enabled ? "text-sp_green" : "text-gray-400"}`}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sp_darkgreen">
                      Enable Hunt Mode
                    </h2>
                    <p className="text-xs text-sp_darkgreen/60">
                      {config.enabled
                        ? "Guests can see the Hunt tab"
                        : "Hunt is hidden from guests"}
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
                    animate={{
                      left: config.enabled ? "calc(100% - 28px)" : "4px",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* QR Code Section - Only when enabled */}
              <AnimatePresence>
                {config.enabled && event?.sessionCode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-sp_lightgreen/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-sp_darkgreen mb-1">
                            Guest Hunt Link
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-sp_lightgreen/20 px-2 py-1 rounded truncate max-w-[200px]">
                              {huntUrl}
                            </code>
                            <button
                              onClick={copyHuntUrl}
                              className="p-1.5 hover:bg-sp_lightgreen/20 rounded transition-colors flex-shrink-0"
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
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-sp_lightgreen/20 rounded-lg hover:bg-sp_lightgreen/30 transition-colors text-sm"
                        >
                          <QrCode className="w-4 h-4" />
                          {showQR ? "Hide" : "QR"}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showQR && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 flex justify-center overflow-hidden"
                          >
                            <div className="p-3 bg-white rounded-xl border-2 border-sp_green">
                              <QRCodeSVG value={huntUrl} size={160} level="H" />
                              <p className="text-center text-xs text-sp_darkgreen/60 mt-2">
                                Scan to join hunt
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tasks Editor */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-sp_lightgreen/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-sp_green" />
                  <h2 className="font-semibold text-sp_darkgreen">
                    Tasks ({config.tasks.length})
                  </h2>
                </div>
                <button
                  onClick={addTask}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sp_green text-white rounded-lg hover:bg-sp_darkgreen transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {config.tasks.length === 0 ? (
                <div className="text-center py-8 text-sp_darkgreen/60">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm mb-3">No tasks yet</p>
                  <button
                    onClick={loadDefaults}
                    className="text-sm text-sp_green hover:underline"
                  >
                    Load sample tasks
                  </button>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={config.tasks}
                  onReorder={handleReorder}
                  className="space-y-2"
                >
                  {config.tasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      className="bg-sp_eggshell rounded-lg p-3 border border-sp_lightgreen/30 cursor-grab active:cursor-grabbing touch-none"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-2 text-sp_darkgreen/30 flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) =>
                              updateTask(task.id, { title: e.target.value })
                            }
                            placeholder="Task title"
                            className="w-full px-2.5 py-1.5 text-sm bg-white border border-sp_lightgreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sp_green/50"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={task.description || ""}
                              onChange={(e) =>
                                updateTask(task.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Description (optional)"
                              className="flex-1 min-w-0 px-2.5 py-1 text-xs bg-white border border-sp_lightgreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sp_green/50"
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type="number"
                                value={task.points}
                                onChange={(e) =>
                                  updateTask(task.id, {
                                    points: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-12 px-1.5 py-1 text-xs text-center bg-white border border-sp_lightgreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sp_green/50"
                              />
                              <span className="text-xs text-sp_darkgreen/60">
                                pts
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-sp_lightgreen/30">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-sp_green" />
                <h2 className="font-semibold text-sp_darkgreen">Settings</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-sp_darkgreen">
                    Show leaderboard on slideshow
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
                    className={`relative w-11 h-6 rounded-full transition-colors ${
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
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-sp_darkgreen">
                    Require guest name
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
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      config.settings.requireName
                        ? "bg-sp_green"
                        : "bg-gray-300"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                      animate={{
                        left: config.settings.requireName
                          ? "calc(100% - 22px)"
                          : "2px",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Submissions Tab Content */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={() => loadPhotos(false)}
                disabled={isLoadingPhotos}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-sp_darkgreen hover:bg-sp_lightgreen/20 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingPhotos ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Leaderboard Summary */}
            {leaderboard.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <h2 className="font-semibold text-amber-800">Leaderboard</h2>
                </div>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.guestId}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        index === 0 ? "bg-amber-100" : "bg-white/60"
                      }`}
                    >
                      {/* Rank badge */}
                      {index === 0 ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      ) : index === 1 ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <Medal className="w-4 h-4 text-white" />
                        </div>
                      ) : index === 2 ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">
                            {index + 1}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {entry.guestName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.verifiedCount} verified /{" "}
                          {entry.submissions.length} submitted
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-amber-600">
                          {entry.totalPoints}
                        </p>
                        <p className="text-xs text-gray-400">pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submissions List */}
            {isLoadingPhotos ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-sp_green/30 border-t-sp_green rounded-full animate-spin" />
              </div>
            ) : huntSubmissions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-sp_lightgreen/30">
                <Users className="w-12 h-12 mx-auto mb-3 text-sp_darkgreen/30" />
                <p className="text-sp_darkgreen/60 text-sm">
                  No submissions yet
                </p>
                <p className="text-sp_darkgreen/40 text-xs mt-1">
                  Submissions will appear here when guests complete tasks
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-sp_lightgreen/30 overflow-hidden">
                <div className="p-3 border-b border-sp_lightgreen/20 bg-sp_lightgreen/10">
                  <h3 className="font-medium text-sp_darkgreen text-sm">
                    All Submissions ({huntSubmissions.length})
                  </h3>
                </div>
                <div className="divide-y divide-sp_lightgreen/20">
                  {huntSubmissions.map((photo, index) => {
                    const task = config.tasks.find(
                      (t) => t.id === photo.huntTaskId,
                    );
                    const isVerified = verifiedPhotos.has(photo.fullKey);
                    return (
                      <div
                        key={photo.fullKey}
                        className="p-3 flex items-center gap-3"
                      >
                        {/* Photo thumbnail - clickable */}
                        <button
                          onClick={() => setSelectedPhotoIndex(index)}
                          className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-sp_lightgreen/20 hover:ring-2 hover:ring-sp_green transition-all cursor-pointer"
                        >
                          <img
                            src={photo.url}
                            alt="Submission"
                            className="w-full h-full object-cover"
                          />
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sp_darkgreen truncate">
                            {photo.guestName || "Anonymous"}
                          </p>
                          <p className="text-xs text-sp_darkgreen/60 truncate">
                            {task?.title || "Unknown task"}
                          </p>
                          <p className="text-xs text-sp_darkgreen/40">
                            {task?.points || 0} points
                          </p>
                        </div>

                        {/* Verify toggle */}
                        <button
                          onClick={() => toggleVerification(photo.fullKey)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            isVerified
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Verified
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-current" />
                              Verify
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unsaved Changes Warning */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between shadow-lg z-40"
            >
              <span className="text-sm text-amber-800">
                You have unsaved changes
              </span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                {isSaving ? "Saving..." : "Save Now"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && huntSubmissions[selectedPhotoIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation */}
            {huntSubmissions.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(
                      selectedPhotoIndex > 0
                        ? selectedPhotoIndex - 1
                        : huntSubmissions.length - 1,
                    );
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(
                      selectedPhotoIndex < huntSubmissions.length - 1
                        ? selectedPhotoIndex + 1
                        : 0,
                    );
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Photo */}
            <motion.img
              key={selectedPhotoIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={huntSubmissions[selectedPhotoIndex].url}
              alt="Submission"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Info bar at bottom */}
            <div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
                <span className="font-medium">
                  {huntSubmissions[selectedPhotoIndex].guestName || "Anonymous"}
                </span>
                <span className="mx-2 text-white/50">•</span>
                <span className="text-white/70">
                  {config.tasks.find(
                    (t) =>
                      t.id === huntSubmissions[selectedPhotoIndex].huntTaskId,
                  )?.title || "Unknown task"}
                </span>
              </div>

              {/* Verify button */}
              <button
                onClick={() =>
                  toggleVerification(
                    huntSubmissions[selectedPhotoIndex].fullKey,
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  verifiedPhotos.has(huntSubmissions[selectedPhotoIndex].fullKey)
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-800 hover:bg-green-100"
                }`}
              >
                {verifiedPhotos.has(
                  huntSubmissions[selectedPhotoIndex].fullKey,
                ) ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verified
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-current" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
