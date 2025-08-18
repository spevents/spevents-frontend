// src/components/guest/GuestDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  Trophy,
  Grid,
  WandSparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Mail,
  User,
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
  const [imageState, setImageState] = useState<
    "loading" | "loaded" | "error" | "testing"
  >("testing");

  useEffect(() => {
    if (photo.url) {
      testImageUrl(photo.url);
    }
  }, [photo.url]);

  const testImageUrl = async (url: string) => {
    try {
      console.log(`🧪 Testing URL: ${url}`);

      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        console.log(`✅ URL works: ${url}`);
        setImageState("loaded");
        onLoad?.();
        return;
      }

      console.log(`❌ URL failed (${response.status}): ${url}`);
      setImageState("error");
      onError?.();
    } catch (error) {
      console.log(`❌ URL error: ${url}`, error);
      setImageState("error");
      onError?.();
    }
  };

  const handleImageLoad = () => {
    if (imageState === "testing") {
      setImageState("loaded");
      onLoad?.();
    }
  };

  const handleImageError = () => {
    console.log(`❌ Image failed to load: ${photo.url}`);
    setImageState("error");
    onError?.();
  };

  return (
    <div className="w-full h-full relative">
      {(imageState === "loading" || imageState === "testing") && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {imageState === "testing" && (
            <div className="absolute bottom-2 left-2 text-white text-xs">
              Testing...
            </div>
          )}
        </div>
      )}

      {imageState === "error" && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-white/60 text-xs">
          <Camera className="w-8 h-8 mb-2" />
          <span>Failed to load</span>
          <span className="text-xs mt-1 opacity-60">
            URL: {photo.url.split("/").pop()}
          </span>
        </div>
      )}

      <img
        src={photo.url}
        alt={`Photo ${index + 1}`}
        className={`w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200 ${
          imageState === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
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

  // Email & Download states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

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
    {
      id: "prize",
      icon: <Trophy className="w-6 h-6 text-white font-bold" />,
      label: "Prize",
    },
  ];

  useEffect(() => {
    loadGuestPhotos();
  }, [actualEventId]);

  const constructCorrectPhotoUrl = (
    photoData: any,
    fileName: string
  ): string => {
    const cloudFrontBase = "https://d3boq06xf0z9b1.cloudfront.net";

    // Get stored guestId - this should be the one from the photo upload
    let guestId =
      photoData.guestId || localStorage.getItem("spevents-guest-id");

    // If no guestId, try to extract from existing URL
    if (!guestId && photoData.url && photoData.url.includes("/guests/")) {
      const urlParts = photoData.url.split("/");
      const guestsIndex = urlParts.indexOf("guests");
      if (guestsIndex !== -1 && guestsIndex + 1 < urlParts.length) {
        guestId = urlParts[guestsIndex + 1];
      }
    }

    // Construct the correct URL using the S3 structure: events/{eventId}/guests/{guestId}/{fileName}
    if (guestId && actualEventId) {
      return `${cloudFrontBase}/events/${actualEventId}/guests/${guestId}/${fileName}`;
    }

    // Fallback to host photos path if no guestId
    return `${cloudFrontBase}/events/${actualEventId}/photos/${fileName}`;
  };

  const loadGuestPhotos = async () => {
    if (!actualEventId) return;

    try {
      // Check multiple storage keys
      const possibleKeys = [
        `uploaded_photos_${actualEventId}`,
        `uploaded-photos`,
        `temp_photos_${actualEventId}`,
      ];

      let storedPhotos: any[] = [];
      let usedKey = "";

      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          storedPhotos = JSON.parse(stored);
          usedKey = key;
          console.log(`📷 Found photos in ${key}:`, storedPhotos.length);
          break;
        }
      }

      if (storedPhotos.length > 0) {
        console.log("📷 Processing photos from key:", usedKey);
        console.log("📷 Sample photo:", storedPhotos[0]);

        const processedPhotos: Photo[] = storedPhotos
          .map((photoData: any, index: number): Photo | null => {
            try {
              let fileName = "";

              if (typeof photoData === "string") {
                fileName = photoData;
              } else if (photoData.fileName) {
                fileName = photoData.fileName;
              } else if (photoData.name) {
                fileName = photoData.name;
              } else if (photoData.url) {
                fileName =
                  photoData.url.split("/").pop() || `photo-${index}.jpg`;
              }

              console.log(`📷 Processing photo ${index}: ${fileName}`);

              const url = constructCorrectPhotoUrl(photoData, fileName);
              console.log(`📷 Constructed URL: ${url}`);

              // keep guestId as string | undefined (never null)
              let guestId: string | undefined =
                (photoData.guestId as string | undefined) ??
                localStorage.getItem("spevents-guest-id") ??
                undefined;

              // try extracting guest id from URL if still missing
              if (
                !guestId &&
                photoData.url &&
                photoData.url.includes("/guests/")
              ) {
                const urlParts = photoData.url.split("/");
                const guestsIndex = urlParts.indexOf("guests");
                if (guestsIndex !== -1 && guestsIndex + 1 < urlParts.length) {
                  guestId = urlParts[guestsIndex + 1];
                }
              }

              return {
                url,
                name: fileName,
                created_at: String(
                  photoData.uploadedAt ??
                    photoData.created_at ??
                    new Date().toISOString()
                ),
                fileName,
                guestId, // string | undefined
              };
            } catch (error) {
              console.error(`❌ Error processing photo ${index}:`, error);
              return null;
            }
          })
          // Proper type guard—removes nulls and narrows to Photo
          .filter((p): p is Photo => p !== null);

        setPhotos(processedPhotos);

        console.log("✅ Processed photos:", processedPhotos.length);
        setPhotos(processedPhotos);
      }
    } catch (error) {
      console.error("❌ Error loading photos:", error);
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
      case "prize":
        navigate(`/${sessionCode}/guest/feedback`);
        break;
      case "gallery":
        break;
    }
  };

  const handlePhotoTap = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

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

  const handleDownloadAll = () => {
    if (photos.length === 0) return;

    // Check if user has an account or email stored
    const userEmail = localStorage.getItem("spevents-user-email");
    if (userEmail) {
      setEmail(userEmail);
    }

    setShowEmailModal(true);
  };

  const sendPhotosToEmail = async () => {
    if (!email.trim() || photos.length === 0) return;

    setDownloadStatus("sending");
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/photos/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: actualEventId,
          email: email.trim(),
          photos: photos.map((photo) => ({
            fileName: photo.fileName || photo.name,
            url: photo.url,
          })),
          sessionCode,
        }),
      });

      if (response.ok) {
        setDownloadStatus("success");

        // Store email for future use
        localStorage.setItem("spevents-user-email", email.trim());

        // Show account creation prompt if new user
        if (!localStorage.getItem("spevents-has-account")) {
          setTimeout(() => setShowAccountPrompt(true), 2000);
        }
      } else {
        throw new Error("Failed to send photos");
      }
    } catch (error) {
      console.error("Email send error:", error);
      setDownloadStatus("error");
    } finally {
      setIsDownloading(false);
    }
  };

  const createAccount = () => {
    // Navigate to account creation with pre-filled email
    const accountUrl = `https://app.spevents.live/signup?email=${encodeURIComponent(
      email
    )}&source=guest`;
    window.open(accountUrl, "_blank");

    localStorage.setItem("spevents-has-account", "true");
    setShowAccountPrompt(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigatePhoto("next");
    }
    if (isRightSwipe) {
      navigatePhoto("prev");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Enhanced Header */}
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
            <span>Download All</span>
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
            {/* Debug info */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-white/60">
              <div>Event ID: {actualEventId}</div>
              <div>Photos found: {photos.length}</div>
              <div>Guest ID: {localStorage.getItem("spevents-guest-id")}</div>
              <div>
                Storage keys checked: uploaded_photos_{actualEventId},
                uploaded-photos, temp_photos_{actualEventId}
              </div>
              {photos.length > 0 && (
                <div className="mt-2">
                  <div>Sample photo URL:</div>
                  <div className="text-xs mt-1 break-all bg-gray-700 p-2 rounded">
                    {photos[0]?.url}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-square group cursor-pointer"
                  onClick={() => handlePhotoTap(index)}
                >
                  <PhotoThumbnail
                    photo={photo}
                    index={index}
                    onLoad={() =>
                      console.log(`Photo ${index + 1} loaded successfully`)
                    }
                    onError={() =>
                      console.error(`Photo ${index + 1} failed to load`)
                    }
                  />
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

      {/* Enhanced Photo Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation buttons */}
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

            {/* Photo */}
            <motion.img
              key={selectedPhotoIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo counter */}
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
              {downloadStatus === "success" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Photos Sent!
                  </h3>
                  <p className="text-white/70 text-sm mb-6">
                    Check your email for the download link to all{" "}
                    {photos.length} photos.
                  </p>
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setDownloadStatus("idle");
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium"
                  >
                    Done
                  </button>
                </div>
              ) : downloadStatus === "error" ? (
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
                      onClick={() => setDownloadStatus("idle")}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailModal(false);
                        setDownloadStatus("idle");
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
                        Download Photos
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
                      disabled={isDownloading}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                      disabled={isDownloading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendPhotosToEmail}
                      disabled={!email.trim() || isDownloading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDownloading ? (
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

      {/* Account Creation Prompt */}
      <AnimatePresence>
        {showAccountPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-white text-xl font-semibold mb-2">
                  Create Your Account
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  Want to host your own events and manage photos easily? Create
                  a free account on spevents.live!
                </p>

                <div className="space-y-3">
                  <button
                    onClick={createAccount}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    Create Free Account
                  </button>

                  <button
                    onClick={() => setShowAccountPrompt(false)}
                    className="w-full text-white/60 py-2 text-sm hover:text-white transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
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
