// src/pages/guest/ScavengerHuntPage.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Trophy,
  Check,
  ChevronRight,
  User,
  Sparkles,
  X,
  RotateCcw,
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { guestService, uploadPhoto, getPresignedUrl } from "@/services/api";
import { ScavengerHuntTask, ScavengerHuntSubmission } from "@/types/event";

type HuntPhase = "name" | "tasks" | "camera" | "complete";

interface CompletedTask {
  taskId: string;
  photoUrl: string;
  submittedAt: string;
}

export function ScavengerHuntPage() {
  const { currentEvent, sessionCode } = useSession();
  const [phase, setPhase] = useState<HuntPhase>("name");
  const [guestName, setGuestName] = useState("");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ScavengerHuntTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Load tasks from event
  useEffect(() => {
    if (currentEvent?.scavengerHunt?.tasks) {
      setTasks(currentEvent.scavengerHunt.tasks);
    }
  }, [currentEvent]);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!currentEvent?.id) return;
    const savedName = localStorage.getItem(`hunt_name_${currentEvent.id}`);
    const savedGuestId = localStorage.getItem(
      `hunt_guestId_${currentEvent.id}`,
    );
    const savedCompleted = localStorage.getItem(
      `hunt_completed_${currentEvent.id}`,
    );

    if (savedName && savedGuestId) {
      setGuestName(savedName);
      setGuestId(savedGuestId);
      setPhase("tasks");
    }
    if (savedCompleted) {
      const completed = JSON.parse(savedCompleted) as CompletedTask[];
      setCompletedTasks(completed);
      // Calculate total points
      const points = completed.reduce((sum, c) => {
        const task = tasks.find((t) => t.id === c.taskId);
        return sum + (task?.points || 0);
      }, 0);
      setTotalPoints(points);
    }
  }, [currentEvent?.id, tasks]);

  // Save progress
  const saveProgress = useCallback(
    (name: string, id: string, completed: CompletedTask[]) => {
      if (!currentEvent?.id) return;
      localStorage.setItem(`hunt_name_${currentEvent.id}`, name);
      localStorage.setItem(`hunt_guestId_${currentEvent.id}`, id);
      localStorage.setItem(
        `hunt_completed_${currentEvent.id}`,
        JSON.stringify(completed),
      );
    },
    [currentEvent?.id],
  );

  // Handle name submission
  const handleNameSubmit = () => {
    if (!guestName.trim()) return;
    const newGuestId = `hunt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setGuestId(newGuestId);
    saveProgress(guestName, newGuestId, []);
    setPhase("tasks");
  };

  // Start camera for a task
  const startCamera = async (taskId: string) => {
    setCurrentTaskId(taskId);
    setCapturedPhoto(null);
    setPhase("camera");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Failed to access camera:", error);
      alert("Could not access camera. Please allow camera permissions.");
      setPhase("tasks");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    stopCamera();
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera(currentTaskId!);
  };

  // Submit photo for task
  const submitPhoto = async () => {
    if (
      !capturedPhoto ||
      !currentTaskId ||
      !currentEvent?.id ||
      !sessionCode ||
      !guestId
    )
      return;

    setIsUploading(true);

    try {
      // Convert data URL to file
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const file = new File([blob], `hunt_${currentTaskId}_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Get presigned URL and upload - include guest name and task ID
      const presignedUrlParams = await getPresignedUrl({
        sessionCode,
        fileName: file.name,
        contentType: file.type,
        isGuestPhoto: true,
        guestId,
        guestName, // Send guest name to backend
        huntTaskId: currentTaskId, // Send task ID for leaderboard
      });

      const result = await uploadPhoto({
        presignedUrl: presignedUrlParams,
        file,
      });

      // Mark task as completed
      const task = tasks.find((t) => t.id === currentTaskId);
      const newCompleted: CompletedTask = {
        taskId: currentTaskId,
        photoUrl: result.photoUrl,
        submittedAt: new Date().toISOString(),
      };

      const updatedCompleted = [...completedTasks, newCompleted];
      setCompletedTasks(updatedCompleted);
      setTotalPoints((prev) => prev + (task?.points || 0));
      saveProgress(guestName, guestId, updatedCompleted);

      // Check if all tasks done
      if (updatedCompleted.length === tasks.length) {
        setPhase("complete");
      } else {
        setPhase("tasks");
      }

      setCapturedPhoto(null);
      setCurrentTaskId(null);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel camera
  const cancelCamera = () => {
    stopCamera();
    setCapturedPhoto(null);
    setCurrentTaskId(null);
    setPhase("tasks");
  };

  // Check if task is completed
  const isTaskCompleted = (taskId: string) =>
    completedTasks.some((c) => c.taskId === taskId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const currentTask = tasks.find((t) => t.id === currentTaskId);

  // If hunt not enabled
  if (!currentEvent?.scavengerHunt?.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen flex items-center justify-center p-6">
        <div className="text-center text-sp_eggshell">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-sp_lightgreen/50" />
          <h2 className="text-xl font-bold mb-2">Scavenger Hunt</h2>
          <p className="text-sp_lightgreen">The hunt hasn't started yet!</p>
          <p className="text-sp_lightgreen/60 text-sm mt-2">
            Check back when it begins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen">
      <AnimatePresence mode="wait">
        {/* NAME ENTRY PHASE */}
        {phase === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-sp_midgreen rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-sp_eggshell" />
              </div>
              <h1 className="text-3xl font-bold text-sp_eggshell mb-2">
                Scavenger Hunt
              </h1>
              <p className="text-sp_lightgreen">{currentEvent?.name}</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-sp_lightgreen text-sm mb-2">
                  What's your name?
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sp_lightgreen/60" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-4 bg-sp_eggshell/10 border border-sp_lightgreen/30 rounded-xl text-sp_eggshell placeholder-sp_lightgreen/50 focus:outline-none focus:ring-2 focus:ring-sp_lightgreen/50"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleNameSubmit}
                disabled={!guestName.trim()}
                className="w-full py-4 bg-sp_midgreen hover:bg-sp_lightgreen text-sp_eggshell hover:text-sp_darkgreen font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                Start Hunting
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TASKS PHASE */}
        {phase === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pb-24"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-sp_darkgreen to-transparent pb-4">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sp_lightgreen text-sm">Welcome back,</p>
                    <h2 className="text-xl font-bold text-sp_eggshell">
                      {guestName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sp_lightgreen text-sm">Your Points</p>
                    <p className="text-2xl font-bold text-sp_eggshell">
                      {totalPoints}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-sp_lightgreen/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-sp_lightgreen"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedTasks.length / tasks.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sp_lightgreen text-xs mt-1 text-center">
                  {completedTasks.length} of {tasks.length} tasks completed
                </p>
              </div>
            </div>

            {/* Task List */}
            <div className="px-4 space-y-3">
              {tasks.map((task, index) => {
                const completed = isTaskCompleted(task.id);
                return (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    onClick={() => !completed && startCamera(task.id)}
                    disabled={completed}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      completed
                        ? "bg-sp_lightgreen/20 border border-sp_lightgreen/40"
                        : "bg-sp_eggshell/10 border border-sp_lightgreen/30 active:scale-[0.98]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          completed ? "bg-sp_lightgreen" : "bg-sp_midgreen"
                        }`}
                      >
                        {completed ? (
                          <Check className="w-5 h-5 text-sp_darkgreen" />
                        ) : (
                          <Camera className="w-5 h-5 text-sp_eggshell" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium ${completed ? "text-sp_lightgreen" : "text-sp_eggshell"}`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sp_lightgreen/70 text-sm mt-0.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-sm font-semibold ${completed ? "text-sp_lightgreen" : "text-sp_eggshell"}`}
                        >
                          +{task.points}
                        </span>
                        <p className="text-sp_lightgreen/60 text-xs">pts</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CAMERA PHASE */}
        {phase === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
          >
            {/* Task info */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-sp_darkgreen/90 to-transparent">
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelCamera}
                  className="p-2 bg-sp_green/50 rounded-full"
                >
                  <X className="w-5 h-5 text-sp_eggshell" />
                </button>
                <div className="flex-1">
                  <p className="text-sp_lightgreen text-xs">Current Task</p>
                  <p className="text-sp_eggshell font-medium text-sm line-clamp-1">
                    {currentTask?.title}
                  </p>
                </div>
                <div className="text-sp_eggshell font-bold bg-sp_midgreen px-3 py-1 rounded-full text-sm">
                  +{currentTask?.points} pts
                </div>
              </div>
            </div>

            {/* Camera/Preview */}
            {!capturedPhoto ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-sp_darkgreen/90 to-transparent safe-area-pb">
                  <div className="flex items-center justify-center gap-8">
                    <button
                      onClick={toggleCamera}
                      className="p-4 bg-sp_green/50 rounded-full"
                    >
                      <RotateCcw className="w-6 h-6 text-sp_eggshell" />
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="w-20 h-20 rounded-full border-4 border-sp_eggshell bg-sp_eggshell/20 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <div className="w-14 h-14 rounded-full bg-sp_eggshell" />
                    </button>
                    <div className="w-14" /> {/* Spacer */}
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />

                {/* Review controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-sp_darkgreen/90 to-transparent safe-area-pb">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={retakePhoto}
                      disabled={isUploading}
                      className="flex-1 py-4 bg-sp_green/50 text-sp_eggshell font-semibold rounded-xl disabled:opacity-50 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      onClick={submitPhoto}
                      disabled={isUploading}
                      className="flex-1 py-4 bg-sp_midgreen text-sp_eggshell font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-sp_eggshell/30 border-t-sp_eggshell rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Submit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* COMPLETE PHASE */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-32 h-32 bg-sp_midgreen rounded-full flex items-center justify-center mb-6"
            >
              <Sparkles className="w-16 h-16 text-sp_eggshell" />
            </motion.div>

            <h1 className="text-3xl font-bold text-sp_eggshell mb-2 text-center">
              Hunt Complete!
            </h1>
            <p className="text-sp_lightgreen text-center mb-8">
              Amazing job, {guestName}!
            </p>

            <div className="bg-sp_eggshell/10 rounded-2xl p-6 text-center mb-8 border border-sp_lightgreen/30">
              <p className="text-sp_lightgreen text-sm mb-1">
                Your Final Score
              </p>
              <p className="text-5xl font-bold text-sp_eggshell">
                {totalPoints}
              </p>
              <p className="text-sp_lightgreen/60 text-sm mt-1">points</p>
            </div>

            <p className="text-sp_lightgreen text-sm text-center">
              Show the MC your completed tasks to claim your prize!
            </p>

            <button
              onClick={() => setPhase("tasks")}
              className="mt-8 text-sp_lightgreen underline hover:text-sp_eggshell transition-colors"
            >
              View your submissions
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
