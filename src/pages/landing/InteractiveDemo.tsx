// src/components/landing/InteractiveDemo.tsx
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { QrCode, Play } from "lucide-react";
import { LivePhotoWall } from "./LivePhotoWall";
import { PhoneMockup } from "./PhoneMockup";

interface InteractiveDemoProps {
  isDark: boolean;
}

export interface SwipeAction {
  photoIndex: number;
  action: "upload" | "delete";
  direction: "left" | "right";
  timestamp: number;
}

const samplePhotos = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=400",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400",
];

export const InteractiveDemo = ({ isDark }: InteractiveDemoProps) => {
  const [demoMode, setDemoMode] = useState("grid");
  const [swipeActions, setSwipeActions] = useState<SwipeAction[]>([]);

  const handleSwipeAction = useCallback((action: SwipeAction) => {
    setSwipeActions((prev) => [...prev, action]);
  }, []);

  return (
    <section className={`py-20 ${isDark ? "bg-sp_green/20" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto"
        >
          <div
            className={`rounded-3xl shadow-2xl p-8 border ${
              isDark
                ? "bg-sp_darkgreen border-sp_green"
                : "bg-sp_eggshell border-sp_lightgreen/30"
            }`}
          >
            <div className="text-center mb-8">
              <h3
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                }`}
              >
                See It In Action
              </h3>
              <p
                className={
                  isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/80"
                }
              >
                Watch how photos flow from guest phones to your live display
              </p>

              {/* Mode Picker */}
              <div className="flex justify-center mt-6">
                <div
                  className={`inline-flex rounded-lg p-1 ${
                    isDark ? "bg-sp_green" : "bg-sp_lightgreen/30"
                  }`}
                >
                  {["grid", "fun", "presenter", "slideshow"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDemoMode(mode)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        demoMode === mode
                          ? isDark
                            ? "bg-sp_lightgreen text-sp_darkgreen"
                            : "bg-white text-sp_darkgreen shadow-sm"
                          : isDark
                            ? "text-sp_lightgreen/80 hover:text-sp_lightgreen"
                            : "text-sp_darkgreen/70 hover:text-sp_darkgreen"
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Phone Mockup */}
                  <div className="mt-8 flex justify-center">
                    <PhoneMockup
                      isDark={isDark}
                      mode={demoMode}
                      samplePhotos={samplePhotos}
                      onSwipeAction={handleSwipeAction}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-sp_lightgreen/20" : "bg-sp_darkgreen/10"
                        }`}
                      >
                        <QrCode
                          className={`w-4 h-4 ${
                            isDark ? "text-sp_lightgreen" : "text-sp_darkgreen"
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-medium ${
                            isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                          }`}
                        >
                          Step 1
                        </div>
                        <span
                          className={
                            isDark
                              ? "text-sp_lightgreen/80"
                              : "text-sp_darkgreen/70"
                          }
                        >
                          Scan QR code
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-sp_lightgreen/20" : "bg-sp_darkgreen/10"
                        }`}
                      >
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              isDark
                                ? "text-sp_lightgreen"
                                : "text-sp_darkgreen"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-medium ${
                            isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                          }`}
                        >
                          Step 2
                        </div>
                        <span
                          className={
                            isDark
                              ? "text-sp_lightgreen/80"
                              : "text-sp_darkgreen/70"
                          }
                        >
                          Swipe to upload
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-sp_lightgreen/20" : "bg-sp_darkgreen/10"
                        }`}
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              isDark
                                ? "text-sp_lightgreen"
                                : "text-sp_darkgreen"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-medium ${
                            isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                          }`}
                        >
                          Step 3
                        </div>
                        <span
                          className={
                            isDark
                              ? "text-sp_lightgreen/80"
                              : "text-sp_darkgreen/70"
                          }
                        >
                          Instant sync
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="text-center">
                  <h4
                    className={`text-lg font-semibold mb-6 ${
                      isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                    }`}
                  >
                    Live Display
                  </h4>
                  <div className="w-full h-96">
                    <LivePhotoWall
                      isDark={isDark}
                      mode={demoMode}
                      swipeActions={swipeActions}
                      samplePhotos={samplePhotos}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                    <Play
                      className={`w-4 h-4 ${
                        isDark ? "text-sp_lightgreen" : "text-sp_green"
                      }`}
                    />
                    <span
                      className={
                        isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/70"
                      }
                    >
                      Photos appear in real-time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
