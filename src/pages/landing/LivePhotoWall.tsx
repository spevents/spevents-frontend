// src/components/landing/LivePhotoWall.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, LayoutTemplate, Presentation } from "lucide-react";

interface SwipeAction {
  photoIndex: number;
  action: "upload" | "delete";
  direction: "left" | "right";
  timestamp: number;
}

interface LivePhotoWallProps {
  isDark: boolean;
  mode: string;
  swipeActions: SwipeAction[];
  samplePhotos: string[];
}

interface DisplayPhoto {
  id: string;
  src: string;
  index: number;
  timestamp: number;
}

const MAX_DISPLAY_PHOTOS = 10;

export const LivePhotoWall = ({
  isDark,
  mode,
  swipeActions,
  samplePhotos,
}: LivePhotoWallProps) => {
  const [displayPhotos, setDisplayPhotos] = useState<DisplayPhoto[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Process swipe actions to determine which photos to display
  useEffect(() => {
    const uploadedPhotos = swipeActions
      .filter((action) => action.action === "upload")
      .map((action) => ({
        id: `photo-${action.photoIndex}-${action.timestamp}`,
        src: samplePhotos[action.photoIndex] || "/placeholder.svg",
        index: action.photoIndex,
        timestamp: action.timestamp,
      }))
      .slice(-MAX_DISPLAY_PHOTOS); // Limit to max 10 photos, keeping the most recent

    setDisplayPhotos(uploadedPhotos);
  }, [swipeActions, samplePhotos]);

  // Cycle through photo sets for presenter mode
  useEffect(() => {
    if (mode === "presenter" && displayPhotos.length >= 3) {
      const interval = setInterval(() => {
        setCurrentSetIndex(
          (prev) => (prev + 1) % Math.ceil(displayPhotos.length / 3),
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [mode, displayPhotos.length]);

  const renderGridMode = () => (
    <div>
      <div
        className={`relative w-full h-[500px] ${
          isDark
            ? "bg-gradient-to-br from-sp_green/30 to-sp_midgreen/30 border-sp_lightgreen/50"
            : "bg-gradient-to-br from-sp_lightgreen/20 to-sp_midgreen/20 border-sp_lightgreen"
        } rounded-2xl border-2 border-dashed overflow-hidden`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {displayPhotos.length === 0 && (
            <div
              className={`text-center ${
                isDark ? "text-sp_eggshell/60" : "text-sp_darkgreen/60"
              }`}
            >
              <Monitor className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Live Photo Wall</p>
              <p className="text-xs mt-1 opacity-75">Waiting for uploads...</p>
            </div>
          )}
        </div>

        {/* Centered grid container */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
            <AnimatePresence>
              {displayPhotos.slice(0, 8).map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{
                    opacity: 0,
                    scale: 0.3,
                    x: Math.random() * 300 - 150,
                    y: Math.random() * 200 - 100,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.4,
                    delay: 0.2,
                  }}
                  className="aspect-square rounded-lg overflow-hidden shadow-lg border-2 border-white"
                >
                  <img
                    src={photo.src}
                    alt={`Uploaded photo ${photo.index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Upload success indicator */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="w-2 h-2 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {displayPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute top-3 right-3 ${
              isDark ? "bg-sp_green" : "bg-sp_darkgreen"
            } text-sp_eggshell px-3 py-1 rounded-full text-sm font-medium shadow-lg`}
          >
            {displayPhotos.length} uploaded
          </motion.div>
        )}

        {/* Recent upload notification */}
        <AnimatePresence>
          {displayPhotos.length > 0 && (
            <motion.div
              key={displayPhotos[displayPhotos.length - 1]?.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className={`absolute bottom-3 right-3 ${
                isDark ? "bg-sp_lightgreen" : "bg-sp_green"
              } text-sp_darkgreen px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2`}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              New photo uploaded!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Display label moved below */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <span
          className={isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/70"}
        >
          Live Display - Photos appear in real-time
        </span>
      </div>
    </div>
  );

  const renderFunMode = () => (
    <div>
      <div
        className={`relative w-full h-[500px] ${
          isDark
            ? "bg-gradient-to-br from-sp_green/30 to-sp_midgreen/30"
            : "bg-gradient-to-br from-sp_lightgreen/20 to-sp_midgreen/20"
        } rounded-2xl overflow-hidden`}
      >
        <AnimatePresence>
          {displayPhotos.slice(0, MAX_DISPLAY_PHOTOS).map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{
                opacity: 0,
                scale: 0,
                rotate: Math.random() * 720 - 360,
                x: Math.random() * 400 - 200,
                y: Math.random() * 300 - 150,
              }}
              animate={{
                opacity: 1,
                scale: Math.random() * 0.4 + 0.6,
                rotate: Math.random() * 60 - 30,
                x: Math.random() * 350 + 10,
                y: Math.random() * 350 + 10,
              }}
              transition={{
                duration: 1.2,
                type: "spring",
                bounce: 0.3,
                delay: 0.3,
              }}
              className="absolute rounded-lg overflow-hidden shadow-lg border-2 border-white"
              style={{
                width: Math.random() * 40 + 60,
                height: Math.random() * 40 + 60,
                zIndex: index,
              }}
            >
              <img
                src={photo.src}
                alt={`Uploaded photo ${photo.index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {displayPhotos.length === 0 && (
          <div
            className={`absolute inset-0 flex items-center justify-center text-center ${
              isDark ? "text-sp_eggshell/60" : "text-sp_darkgreen/60"
            }`}
          >
            <div>
              <LayoutTemplate className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Dynamic Photo Wall</p>
              <p className="text-xs mt-1 opacity-75">Waiting for uploads...</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Display label moved below */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <span
          className={isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/70"}
        >
          Live Display - Photos appear in real-time
        </span>
      </div>
    </div>
  );

  const renderPresenterMode = () => {
    const limitedPhotos = displayPhotos.slice(0, MAX_DISPLAY_PHOTOS);
    const photoSets = [];
    for (let i = 0; i < limitedPhotos.length; i += 3) {
      photoSets.push(limitedPhotos.slice(i, i + 3));
    }

    const currentSet = photoSets[currentSetIndex] || [];

    return (
      <div>
        <div
          className={`relative w-full h-[500px] ${
            isDark
              ? "bg-gradient-to-br from-sp_green/30 to-sp_midgreen/30"
              : "bg-gradient-to-br from-sp_lightgreen/20 to-sp_midgreen/20"
          } rounded-2xl overflow-hidden`}
        >
          {currentSet.length > 0 ? (
            <motion.div
              key={currentSetIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 p-8 grid grid-cols-3 gap-6"
            >
              {currentSet.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-2 border-white"
                >
                  <img
                    src={photo.src}
                    alt={`Uploaded photo ${photo.index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center text-center ${
                isDark ? "text-sp_eggshell/60" : "text-sp_darkgreen/60"
              }`}
            >
              <div>
                <Presentation className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Presenter Mode</p>
                <p className="text-xs mt-1 opacity-75">
                  Waiting for uploads...
                </p>
              </div>
            </div>
          )}

          {photoSets.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {photoSets.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSetIndex
                      ? isDark
                        ? "bg-sp_lightgreen"
                        : "bg-sp_green"
                      : isDark
                        ? "bg-sp_eggshell/30"
                        : "bg-sp_darkgreen/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Display label moved below */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span
            className={isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/70"}
          >
            Live Display - Photos appear in real-time
          </span>
        </div>
      </div>
    );
  };

  const renderSlideshowMode = () => {
    const currentPhoto = displayPhotos[displayPhotos.length - 1];

    return (
      <div>
        <div
          className={`relative w-full h-[500px] ${
            isDark
              ? "bg-gradient-to-br from-sp_green/30 to-sp_midgreen/30"
              : "bg-gradient-to-br from-sp_lightgreen/20 to-sp_midgreen/20"
          } rounded-2xl overflow-hidden`}
        >
          {currentPhoto ? (
            <motion.div
              key={currentPhoto.id}
              initial={{ opacity: 0, scale: 0.95, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 p-8 flex items-center justify-center"
            >
              <div className="relative max-w-sm max-h-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={currentPhoto.src}
                  alt="Featured photo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Side thumbnails */}
              {displayPhotos.length > 1 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
                  {displayPhotos.slice(-5, -1).map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 opacity-60"
                    >
                      <img
                        src={photo.src}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center text-center ${
                isDark ? "text-sp_eggshell/60" : "text-sp_darkgreen/60"
              }`}
            >
              <div>
                <Presentation className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Elegant Slideshow</p>
                <p className="text-xs mt-1 opacity-75">
                  Waiting for uploads...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Display label moved below */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span
            className={isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/70"}
          >
            Live Display - Photos appear in real-time
          </span>
        </div>
      </div>
    );
  };

  const renderDisplay = () => {
    switch (mode) {
      case "fun":
        return renderFunMode();
      case "presenter":
        return renderPresenterMode();
      case "slideshow":
        return renderSlideshowMode();
      default:
        return renderGridMode();
    }
  };

  return renderDisplay();
};
