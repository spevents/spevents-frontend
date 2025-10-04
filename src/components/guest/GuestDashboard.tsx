// File: src/components/guest/GuestDashboard.tsx
//
// Only the pieces that matter changed vs your version:
// - Removed the "Prize" tab
// - "Download All" opens email modal and POSTs to /api/photos/email
// - Subject/body are set server-side to your exact copy
// (Full file kept for copy-paste clarity)

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  Grid,
  WandSparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Mail,
  Send,
  AlertCircle,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActualEventId } from "../session/SessionValidator";

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

const PhotoThumbnail = ({
  photo,
  index,
  onLoad,
  onError,
}: PhotoThumbnailProps) => {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  return (
    <div className="w-full h-full relative">
      {imageState === "loading" && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {imageState === "error" && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-white/60 text-xs p-2">
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
};

export function GuestDashboard() {
  const navigate = useNavigate();
  const params = useParams();
  const sessionCode = params.sessionCode || params.eventId;
  const actualEventId = useActualEventId();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  // Tabs (Prize removed)
  const tabs: TabConfig[] = [
    {
      id: "gallery",
      icon: <Grid className="w-6 h-6 text-white font-bold" />,
      label: "Gallery",
    },
    {
      id: "camera",
      icon: <Camera className="w-6 h-6 text-white font-bold" />,
      label: "Camera",
    },
    {
      id: "create",
      icon: <WandSparkles className="w-6 h-6 text-white font-bold" />,
      label: "Create",
    },
    // { id: "prize", icon: <Trophy ... />, label: "Prize" },
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
        selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1
      );
    } else {
      setSelectedPhotoIndex(
        selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div>
          <h1 className="text-white text-xl font-semibold">Your Photos</h1>
          <p className="text-white/60 text-sm">
            {photos.length} captured moments
          </p>
        </div>

        {photos.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Email Me All</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <div className="mt-4 text-white/60 text-sm text-center">
                Loading photos...
              </div>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-white/60" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">
              No photos yet
            </h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Start capturing memories by taking your first photo!
            </p>
            <button
              onClick={() => handleTabClick("camera")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square group cursor-pointer"
                  onClick={() => handlePhotoTap(index)}
                >
                  <PhotoThumbnail photo={photo} index={index} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-2 left-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center"
            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
            onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
            onTouchEnd={() => {
              if (!touchStart || !touchEnd) return;
              const d = touchStart - touchEnd;
              if (d > 50) navigatePhoto("next");
              if (d < -50) navigatePhoto("prev");
            }}
          >
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.img
              key={selectedPhotoIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              {sendStatus === "success" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Photos Sent!
                  </h3>
                  <p className="text-white/70 text-sm mb-6">
                    Check your email for all {photos.length} photos.
                  </p>
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSendStatus("idle");
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium"
                  >
                    Done
                  </button>
                </div>
              ) : sendStatus === "error" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Send Failed
                  </h3>
                  <p className="text-white/70 text-sm mb-6">
                    There was an error sending your photos. Please try again.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSendStatus("idle")}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailModal(false);
                        setSendStatus("idle");
                      }}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-semibold">
                        Email Your Photos
                      </h3>
                      <p className="text-white/60 text-sm">
                        Enter your email to receive all {photos.length} photos
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      disabled={isSending}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                      disabled={isSending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendPhotosToEmail}
                      disabled={!email.trim() || isSending}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Photos</span>
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
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-white shadow-lg"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
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
