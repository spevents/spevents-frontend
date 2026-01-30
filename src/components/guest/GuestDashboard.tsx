// File: src/components/guest/GuestDashboard.tsx
//
// Guest dashboard with Spevents green theme
// Features: Gallery, Camera, and Hunt tabs
// Email photos functionality with Resend integration

import { useState, useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  Grid,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Send,
  AlertCircle,
  Check,
  Target,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActualEventId } from "../session/SessionValidator";
import { useSession } from "@/contexts/SessionContext";

interface Photo {
  url: string;
  name: string;
  created_at: string;
  fileName?: string;
  guestId?: string;
}

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface PhotoThumbnailProps {
  photo: Photo;
  index: number;
  onLoad?: () => void;
  onError?: () => void;
}

const PhotoThumbnail = memo(
  ({ photo, index, onLoad, onError }: PhotoThumbnailProps) => {
    const [imageState, setImageState] = useState<
      "loading" | "loaded" | "error"
    >("loading");
    return (
      <div className="w-full h-full relative">
        {imageState === "loading" && (
          <div className="absolute inset-0 bg-sp_lightgreen/30 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-sp_green/30 border-t-sp_green rounded-full animate-spin" />
          </div>
        )}
        {imageState === "error" && (
          <div className="absolute inset-0 bg-sp_lightgreen/20 rounded-lg flex flex-col items-center justify-center text-sp_darkgreen/60 text-xs p-2">
            <span>Failed to load</span>
            <span className="text-xs mt-1 opacity-60 truncate w-full text-center">
              {photo.fileName || photo.name}
            </span>
          </div>
        )}
        <img
          src={photo.url}
          alt={`Photo ${index + 1}`}
          className={`w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200 ${
            imageState === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => {
            setImageState("loaded");
            onLoad?.();
          }}
          onError={() => {
            setImageState("error");
            onError?.();
          }}
        />
      </div>
    );
  },
);

export function GuestDashboard() {
  const navigate = useNavigate();
  const params = useParams();
  const sessionCode = params.sessionCode || params.eventId;
  const actualEventId = useActualEventId();
  const { guestName, currentEvent } = useSession();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  // Check if hunt mode is enabled for this event
  const huntEnabled = currentEvent?.scavengerHunt?.enabled ?? false;

  // Tabs - dynamically include Hunt tab if enabled
  const tabs: TabConfig[] = [
    {
      id: "gallery",
      icon: <Grid className="w-5 h-5" />,
      label: "Gallery",
    },
    {
      id: "camera",
      icon: <Camera className="w-5 h-5" />,
      label: "Camera",
    },
    ...(huntEnabled
      ? [
          {
            id: "hunt",
            icon: <Target className="w-5 h-5" />,
            label: "Hunt",
          },
        ]
      : []),
  ];

  useEffect(() => {
    loadGuestPhotos();
  }, [actualEventId]);

  const loadGuestPhotos = async () => {
    if (!actualEventId) return;
    try {
      const storageKey = `uploaded_photos_${actualEventId}`;
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setPhotos([]);
        return;
      }
      const storedPhotos = JSON.parse(stored);

      const processedPhotos: Photo[] = storedPhotos
        .map((photoData: any, index: number): Photo | null => {
          try {
            if (photoData.url && photoData.url.startsWith("http")) {
              return {
                url: photoData.url,
                name:
                  photoData.fileName || photoData.name || `photo-${index}.jpg`,
                created_at:
                  photoData.uploadedAt ||
                  photoData.created_at ||
                  new Date().toISOString(),
                fileName: photoData.fileName || photoData.name,
                guestId: photoData.guestId,
              };
            }
            const guestId =
              photoData.guestId || localStorage.getItem("spevents-guest-id");
            const fileName =
              photoData.fileName || photoData.name || `photo-${index}.jpg`;
            if (!guestId) return null;
            const url = `https://d3boq06xf0z9b1.cloudfront.net/events/${actualEventId}/guests/${guestId}/${fileName}`;
            return {
              url,
              name: fileName,
              created_at:
                photoData.uploadedAt ||
                photoData.created_at ||
                new Date().toISOString(),
              fileName,
              guestId,
            };
          } catch {
            return null;
          }
        })
        .filter((p: any): p is Photo => p !== null);

      setPhotos(processedPhotos);
    } catch (e) {
      console.error("❌ Error loading photos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    switch (tabId) {
      case "camera":
        navigate(`/${sessionCode}/guest/camera`);
        break;
      case "hunt":
        navigate(`/${sessionCode}/guest/hunt`);
        break;
      case "create":
        navigate(`/${sessionCode}/guest/create`);
        break;
      case "gallery":
        break;
    }
  };

  const handlePhotoTap = (index: number) => setSelectedPhotoIndex(index);
  const closePhotoModal = () => setSelectedPhotoIndex(null);

  const navigatePhoto = (direction: "prev" | "next") => {
    if (selectedPhotoIndex === null) return;
    if (direction === "prev") {
      setSelectedPhotoIndex(
        selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1,
      );
    } else {
      setSelectedPhotoIndex(
        selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0,
      );
    }
  };

  // const handleTouchStart = (e: React.TouchEvent) =>
  //   setTouchStart(e.targetTouches[0].clientX);
  // const handleTouchMove = (e: React.TouchEvent) =>
  //   setTouchEnd(e.targetTouches[0].clientX);
  // const handleTouchEnd = () => {
  //   if (!touchStart || !touchEnd) return;
  //   const d = touchStart - touchEnd;
  //   if (d > 50) navigatePhoto("next");
  //   if (d < -50) navigatePhoto("prev");
  // };

  // -------- Email sending (hits /api/photos/email on your backend) --------

  const apiBase =
    (import.meta as any).env?.VITE_API_URL || "https://api.spevents.live";

  const validEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const normalizeName = (p: Photo) => {
    const n = p.fileName || p.name || "photo";
    return /\.[a-z0-9]+$/i.test(n) ? n : `${n}.jpg`;
  };

  const handleDownloadAll = () => {
    if (photos.length === 0) return;
    const cached = localStorage.getItem("spevents-user-email");
    if (cached) setEmail(cached);
    setShowEmailModal(true);
  };

  const sendPhotosToEmail = async () => {
    if (!email.trim() || photos.length === 0) return;
    if (!validEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSendStatus("sending");
    setIsSending(true);

    try {
      const payload = {
        to: email.trim(),
        eventName: (window as any).__currentEventName || "Event",
        attachments: photos.map((p) => ({
          url: p.url,
          name: normalizeName(p),
        })),
      };

      const res = await fetch(`${apiBase}/api/photos/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to send photos";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          const t = await res.text();
          if (t) msg = t;
        }
        throw new Error(msg);
      }

      localStorage.setItem("spevents-user-email", email.trim());
      setSendStatus("success");
    } catch (e) {
      console.error("Email send error:", e);
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sp_lightgreen/20 bg-sp_darkgreen/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {guestName && (
            <div className="w-10 h-10 rounded-full bg-sp_lightgreen/20 flex items-center justify-center">
              <User className="w-5 h-5 text-sp_eggshell" />
            </div>
          )}
          <div>
            <h1 className="text-sp_eggshell text-xl font-semibold">
              {guestName ? `Hi, ${guestName}!` : "Your Photos"}
            </h1>
            <p className="text-sp_lightgreen text-sm">
              {photos.length} captured moment{photos.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 bg-sp_midgreen hover:bg-sp_green text-sp_eggshell px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email Me</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-sp_lightgreen/30 border-t-sp_eggshell rounded-full animate-spin" />
              <div className="mt-4 text-sp_lightgreen text-sm text-center">
                Loading photos...
              </div>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-20 h-20 bg-sp_midgreen/30 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-sp_eggshell/70" />
            </div>
            <h3 className="text-sp_eggshell text-lg font-medium mb-2">
              No photos yet
            </h3>
            <p className="text-sp_lightgreen text-sm mb-6 leading-relaxed">
              Start capturing memories by taking your first photo!
            </p>
            <button
              onClick={() => handleTabClick("camera")}
              className="bg-sp_midgreen hover:bg-sp_lightgreen text-sp_eggshell hover:text-sp_darkgreen px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              Take Photo
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <motion.div
                  key={`${photo.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className="relative aspect-square group cursor-pointer rounded-lg overflow-hidden"
                  onClick={() => handlePhotoTap(index)}
                >
                  <PhotoThumbnail photo={photo} index={index} />
                  <div className="absolute inset-0 bg-gradient-to-t from-sp_darkgreen/70 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-2 left-2 text-sp_eggshell text-xs font-medium opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200">
                    #{index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sp_darkgreen/98 backdrop-blur-md z-50 flex items-center justify-center"
            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
            onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
            onTouchEnd={() => {
              if (!touchStart || !touchEnd) return;
              const d = touchStart - touchEnd;
              if (d > 50) navigatePhoto("next");
              if (d < -50) navigatePhoto("prev");
              setTouchStart(0);
              setTouchEnd(0);
            }}
          >
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 w-10 h-10 bg-sp_green/70 rounded-full flex items-center justify-center text-sp_eggshell hover:bg-sp_midgreen transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-sp_green/70 rounded-full flex items-center justify-center text-sp_eggshell hover:bg-sp_midgreen transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-sp_green/70 rounded-full flex items-center justify-center text-sp_eggshell hover:bg-sp_midgreen transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.img
              key={selectedPhotoIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain px-4"
              draggable={false}
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-sp_green/70 px-4 py-2 rounded-full">
              <span className="text-sp_eggshell text-sm font-medium">
                {selectedPhotoIndex + 1} of {photos.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sp_darkgreen/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && sendStatus === "idle") {
                setShowEmailModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-sp_eggshell rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              {sendStatus === "success" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-sp_green rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-sp_eggshell" />
                  </div>
                  <h3 className="text-sp_darkgreen text-xl font-semibold mb-2">
                    Photos Sent!
                  </h3>
                  <p className="text-sp_midgreen text-sm mb-6">
                    Check your email for all {photos.length} photos.
                  </p>
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSendStatus("idle");
                    }}
                    className="w-full bg-sp_green hover:bg-sp_midgreen text-sp_eggshell py-3 rounded-lg font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : sendStatus === "error" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-sp_darkgreen text-xl font-semibold mb-2">
                    Send Failed
                  </h3>
                  <p className="text-sp_midgreen text-sm mb-6">
                    There was an error sending your photos. Please try again.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSendStatus("idle")}
                      className="flex-1 bg-sp_midgreen text-sp_eggshell py-3 rounded-lg font-medium hover:bg-sp_green transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailModal(false);
                        setSendStatus("idle");
                      }}
                      className="flex-1 bg-sp_lightgreen text-sp_darkgreen py-3 rounded-lg font-medium hover:bg-sp_lightgreen/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-sp_green rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-sp_eggshell" />
                    </div>
                    <div>
                      <h3 className="text-sp_darkgreen text-xl font-semibold">
                        Email Your Photos
                      </h3>
                      <p className="text-sp_midgreen text-sm">
                        Receive all {photos.length} photos in your inbox
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sp_darkgreen text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white border border-sp_lightgreen rounded-lg px-4 py-3 text-sp_darkgreen placeholder-sp_lightgreen focus:outline-none focus:border-sp_green focus:ring-1 focus:ring-sp_green"
                      disabled={isSending}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 bg-sp_lightgreen/50 text-sp_darkgreen py-3 rounded-lg font-medium hover:bg-sp_lightgreen transition-colors"
                      disabled={isSending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendPhotosToEmail}
                      disabled={!email.trim() || isSending}
                      className="flex-1 bg-sp_green text-sp_eggshell py-3 rounded-lg font-medium hover:bg-sp_midgreen transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-sp_eggshell/30 border-t-sp_eggshell rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-sp_darkgreen/95 backdrop-blur-md border-t border-sp_lightgreen/20 safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 min-w-[70px] ${
                activeTab === tab.id
                  ? "bg-sp_green text-sp_eggshell shadow-lg"
                  : "text-sp_lightgreen hover:text-sp_eggshell hover:bg-sp_green/30"
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
