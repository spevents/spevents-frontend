// src/pages/guest/ScavengerHuntPage.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Trophy,
  Check,
  ChevronRight,
  User,
  X,
  RefreshCw,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate, useParams } from "react-router-dom";
import { uploadPhoto, getPresignedUrl, getEventPhotos } from "@/services/api";
import { ScavengerHuntTask } from "@/types/event";

type HuntPhase = "name" | "tasks" | "camera" | "success" | "complete";
type SubmissionStatus = "pending" | "verified" | "rejected";

interface Submission {
  taskId: string;
  photoUrl: string;
  photoKey: string; // fullKey from upload response
  submittedAt: string;
  status: SubmissionStatus;
}

export function ScavengerHuntPage() {
  const { currentEvent, sessionCode, refreshCurrentEvent } = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const [phase, setPhase] = useState<HuntPhase>("name");
  const [guestName, setGuestName] = useState("");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ScavengerHuntTask[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState(0);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

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
    const savedSubmissions = localStorage.getItem(
      `hunt_submissions_${currentEvent.id}`,
    );

    if (savedName && savedGuestId) {
      setGuestName(savedName);
      setGuestId(savedGuestId);
      setPhase("tasks");
    }
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions) as Submission[]);
    }
  }, [currentEvent?.id]);

  // Poll for verification status
  useEffect(() => {
    if (!currentEvent?.id || !guestId || submissions.length === 0) return;

    const checkVerificationStatus = async () => {
      try {
        // Refresh event data to get latest verifiedSubmissions
        await refreshCurrentEvent();

        // Get verified submissions from updated event config
        const verifiedKeys = new Set(
          currentEvent?.scavengerHunt?.verifiedSubmissions || [],
        );

        // Also fetch photos to check if any were deleted
        const photos = await getEventPhotos(currentEvent.id);
        const existingPhotoKeys = new Set(photos.map((p) => p.fullKey));

        let hasChanges = false;
        const updatedSubmissions = submissions.map((sub) => {
          // Check if photo was deleted by host
          if (
            !existingPhotoKeys.has(sub.photoKey) &&
            sub.status !== "rejected"
          ) {
            hasChanges = true;
            return { ...sub, status: "rejected" as SubmissionStatus };
          }
          // Check if photo was verified
          if (verifiedKeys.has(sub.photoKey) && sub.status === "pending") {
            hasChanges = true;
            return { ...sub, status: "verified" as SubmissionStatus };
          }
          return sub;
        });

        // Remove rejected submissions so user can retry
        const activeSubmissions = updatedSubmissions.filter(
          (s) => s.status !== "rejected",
        );

        if (hasChanges) {
          setSubmissions(activeSubmissions);
          saveSubmissions(activeSubmissions);
        }
      } catch (error) {
        console.error("Failed to check verification status:", error);
      }
    };

    // Check immediately and then every 5 seconds
    checkVerificationStatus();
    const interval = setInterval(checkVerificationStatus, 5000);
    return () => clearInterval(interval);
  }, [currentEvent?.id, guestId, submissions.length, refreshCurrentEvent]);

  // Calculate points (only from verified submissions)
  const totalPoints = submissions
    .filter((s) => s.status === "verified")
    .reduce((sum, s) => {
      const task = tasks.find((t) => t.id === s.taskId);
      return sum + (task?.points || 0);
    }, 0);

  // Save submissions
  const saveSubmissions = useCallback(
    (subs: Submission[]) => {
      if (!currentEvent?.id) return;
      localStorage.setItem(
        `hunt_submissions_${currentEvent.id}`,
        JSON.stringify(subs),
      );
    },
    [currentEvent?.id],
  );

  // Save progress
  const saveProgress = useCallback(
    (name: string, id: string) => {
      if (!currentEvent?.id) return;
      localStorage.setItem(`hunt_name_${currentEvent.id}`, name);
      localStorage.setItem(`hunt_guestId_${currentEvent.id}`, id);
    },
    [currentEvent?.id],
  );

  // Handle name submission
  const handleNameSubmit = () => {
    if (!guestName.trim()) return;
    const newGuestId = `hunt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setGuestId(newGuestId);
    saveProgress(guestName, newGuestId);
    setPhase("tasks");
  };

  // Initialize camera stream
  const initCamera = async (facing: "user" | "environment") => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
          setIsCameraReady(true);
        } catch {
          setTimeout(() => setIsCameraReady(true), 300);
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to access camera:", error);
      return false;
    }
  };

  // Start camera for a task
  const startCamera = async (taskId: string) => {
    setCurrentTaskId(taskId);
    setCapturedPhoto(null);
    setIsCameraReady(false);
    setPhase("camera");

    const success = await initCamera(facingMode);
    if (!success) {
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };

  // Toggle camera (flip)
  const toggleCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    setIsCameraReady(false);

    const success = await initCamera(newFacingMode);
    if (!success) {
      setFacingMode(facingMode);
      await initCamera(facingMode);
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
    const activeSessionCode = sessionCode || params.sessionCode;

    if (!capturedPhoto || !currentTaskId || !activeSessionCode || !guestId) {
      alert(`Missing required info. Please try again.`);
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const file = new File([blob], `hunt_${currentTaskId}_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const presignedUrlParams = await getPresignedUrl({
        sessionCode: activeSessionCode,
        fileName: file.name,
        contentType: file.type,
        isGuestPhoto: true,
        guestId,
        guestName,
        huntTaskId: currentTaskId,
      });

      const result = await uploadPhoto({
        presignedUrl: presignedUrlParams,
        file,
      });

      // Create submission with PENDING status
      const newSubmission: Submission = {
        taskId: currentTaskId,
        photoUrl: result.photoUrl,
        photoKey: result.fileName, // Use fileName as key for matching
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      const updatedSubmissions = [...submissions, newSubmission];
      setSubmissions(updatedSubmissions);
      saveSubmissions(updatedSubmissions);

      // Show points that WILL be earned once verified
      const task = tasks.find((t) => t.id === currentTaskId);
      setLastEarnedPoints(task?.points || 0);

      setCapturedPhoto(null);
      setCurrentTaskId(null);
      setPhase("success");
    } catch (error: any) {
      alert(`Upload failed: ${error?.message || String(error)}`);
      setIsUploading(false);
    }
  };

  // After success, go to tasks or complete
  const handleSuccessContinue = () => {
    setIsUploading(false);
    const verifiedCount = submissions.filter(
      (s) => s.status === "verified",
    ).length;
    const pendingCount =
      submissions.filter((s) => s.status === "pending").length + 1; // +1 for just submitted

    if (verifiedCount + pendingCount >= tasks.length) {
      setPhase("complete");
    } else {
      setPhase("tasks");
    }
  };

  // Cancel camera
  const cancelCamera = () => {
    stopCamera();
    setCapturedPhoto(null);
    setCurrentTaskId(null);
    setPhase("tasks");
  };

  // Get task status
  const getTaskStatus = (
    taskId: string,
  ): "available" | "pending" | "verified" => {
    const submission = submissions.find((s) => s.taskId === taskId);
    if (!submission) return "available";
    return submission.status === "verified" ? "verified" : "pending";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const verifiedCount = submissions.filter(
    (s) => s.status === "verified",
  ).length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  // If hunt not enabled
  if (!currentEvent?.scavengerHunt?.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen flex flex-col items-center justify-center p-6">
        <div className="text-center text-sp_eggshell">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-sp_lightgreen/50" />
          <h2 className="text-xl font-bold mb-2">Scavenger Hunt</h2>
          <p className="text-sp_lightgreen">The hunt hasn't started yet!</p>
          <button
            onClick={() =>
              navigate(`/${params.sessionCode || sessionCode}/guest`)
            }
            className="mt-6 flex items-center gap-2 text-sp_lightgreen hover:text-sp_eggshell transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
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
            <button
              onClick={() =>
                navigate(`/${params.sessionCode || sessionCode}/guest`)
              }
              className="absolute top-4 left-4 flex items-center gap-2 text-sp_lightgreen hover:text-sp_eggshell transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

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
                <button
                  onClick={() =>
                    navigate(`/${params.sessionCode || sessionCode}/guest`)
                  }
                  className="flex items-center gap-2 text-sp_lightgreen hover:text-sp_eggshell mb-3 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Dashboard</span>
                </button>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sp_lightgreen text-sm">Welcome back,</p>
                    <h2 className="text-xl font-bold text-sp_eggshell">
                      {guestName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sp_lightgreen text-sm">
                      Verified Points
                    </p>
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
                      width: `${(verifiedCount / tasks.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sp_lightgreen text-xs mt-1 text-center">
                  {verifiedCount} verified, {pendingCount} pending /{" "}
                  {tasks.length} tasks
                </p>
              </div>
            </div>

            {/* Task List */}
            <div className="px-4 space-y-3">
              {tasks.map((task, index) => {
                const status = getTaskStatus(task.id);
                return (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    onClick={() =>
                      status === "available" && startCamera(task.id)
                    }
                    disabled={status !== "available"}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      status === "verified"
                        ? "bg-sp_lightgreen/30 border border-sp_lightgreen"
                        : status === "pending"
                          ? "bg-amber-500/20 border border-amber-400/50"
                          : "bg-sp_eggshell/10 border border-sp_lightgreen/30 active:scale-[0.98]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          status === "verified"
                            ? "bg-sp_lightgreen"
                            : status === "pending"
                              ? "bg-amber-400"
                              : "bg-sp_midgreen"
                        }`}
                      >
                        {status === "verified" ? (
                          <Check className="w-5 h-5 text-sp_darkgreen" />
                        ) : status === "pending" ? (
                          <Clock className="w-5 h-5 text-amber-900" />
                        ) : (
                          <Camera className="w-5 h-5 text-sp_eggshell" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium ${
                            status === "verified"
                              ? "text-sp_lightgreen"
                              : status === "pending"
                                ? "text-amber-300"
                                : "text-sp_eggshell"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sp_lightgreen/70 text-sm mt-0.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {status === "pending" && (
                          <p className="text-amber-400 text-xs mt-1">
                            Waiting for host verification...
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-sm font-semibold ${
                            status === "verified"
                              ? "text-sp_lightgreen"
                              : status === "pending"
                                ? "text-amber-400"
                                : "text-sp_eggshell"
                          }`}
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
            {/* Task info header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelCamera}
                  className="p-2.5 bg-white/20 rounded-full backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1">
                  <p className="text-white/70 text-xs">Task</p>
                  <p className="text-white font-medium text-sm line-clamp-1">
                    {currentTask?.title}
                  </p>
                </div>
                <div className="bg-sp_green px-3 py-1.5 rounded-full">
                  <span className="text-white font-bold text-sm">
                    +{currentTask?.points}
                  </span>
                </div>
              </div>
            </div>

            {/* Camera/Preview */}
            {!capturedPhoto ? (
              <>
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="text-center">
                      <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-white/70 text-sm">
                        Starting camera...
                      </p>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={toggleCamera}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm active:bg-white/30 transition-colors">
                        <RefreshCw className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white/70 text-xs">Flip</span>
                    </button>

                    <button
                      onClick={capturePhoto}
                      disabled={!isCameraReady}
                      className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                    >
                      <div className="w-14 h-14 rounded-full bg-white" />
                    </button>

                    <div className="w-[72px]" />
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

                <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white/80 text-center text-sm mb-4">
                    Happy with this photo?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={retakePhoto}
                      disabled={isUploading}
                      className="flex-1 py-4 bg-white/20 text-white font-semibold rounded-xl disabled:opacity-50 backdrop-blur-sm active:bg-white/30 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      onClick={submitPhoto}
                      disabled={isUploading}
                      className="flex-1 py-4 bg-sp_green text-white font-semibold rounded-xl disabled:opacity-70 flex items-center justify-center gap-2 active:bg-sp_darkgreen transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* SUCCESS PHASE - Now shows PENDING */}
        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-amber-700 via-amber-600 to-yellow-500 z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mb-6"
            >
              <Clock className="w-12 h-12 text-amber-900" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Submitted!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-amber-200 text-center mb-6"
            >
              Waiting for host to verify...
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/20 rounded-2xl px-8 py-4 mb-6 border border-amber-300/30"
            >
              <p className="text-amber-200 text-sm text-center">
                Points if verified
              </p>
              <p className="text-4xl font-bold text-white text-center">
                +{lastEarnedPoints}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleSuccessContinue}
              className="w-full max-w-xs py-4 bg-white text-amber-700 font-semibold rounded-xl active:scale-[0.98] transition-transform"
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {/* COMPLETE PHASE */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-900 via-amber-700 to-yellow-600"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="relative w-32 h-32 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-2xl shadow-yellow-500/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-amber-900" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full blur-sm"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-2 text-center"
            >
              All Tasks Done!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-yellow-200 text-center text-lg mb-8"
            >
              Great job, {guestName}!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center mb-6 border border-yellow-300/50 w-full max-w-xs"
            >
              <p className="text-yellow-200 text-sm mb-1">Verified Points</p>
              <p className="text-6xl font-bold text-white">{totalPoints}</p>
              <div className="mt-3 pt-3 border-t border-yellow-300/30">
                <p className="text-yellow-200 text-xs">
                  {verifiedCount} verified, {pendingCount} pending
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-yellow-200 text-sm text-center mb-8 px-4"
            >
              {pendingCount > 0
                ? "Some submissions are still pending verification!"
                : "The host will announce the winners soon!"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3 w-full max-w-xs"
            >
              <button
                onClick={() => setPhase("tasks")}
                className="w-full py-3 bg-white text-amber-700 font-semibold rounded-xl active:scale-[0.98] transition-transform"
              >
                View Tasks
              </button>
              <button
                onClick={() =>
                  navigate(`/${params.sessionCode || sessionCode}/guest`)
                }
                className="w-full py-3 bg-white/20 text-white font-medium rounded-xl active:scale-[0.98] transition-transform border border-white/30"
              >
                Back to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
