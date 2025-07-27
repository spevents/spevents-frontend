// File: src/pages/HostRoutes/components/PhotoLightbox.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share, MoreHorizontal } from "lucide-react";
import type { DisplayPhoto } from "../../types";

interface PhotoLightboxProps {
  selectedPhoto: DisplayPhoto | null;
  setSelectedPhoto: (photo: DisplayPhoto | null) => void;
  photos: DisplayPhoto[];
  currentPhotoIndex: number;
  navigateNext: () => void;
  navigatePrevious: () => void;
  handleDownloadSinglePhoto: (photo: DisplayPhoto) => Promise<void>;
}

export function PhotoLightbox({
  selectedPhoto,
  setSelectedPhoto,
  photos,
  currentPhotoIndex,
  navigateNext,
  navigatePrevious,
  handleDownloadSinglePhoto,
}: PhotoLightboxProps) {
  return (
    <AnimatePresence>
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Navigation Arrow - Left */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm group"
            >
              <svg
                className="w-6 h-6 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Navigation Arrow - Right */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm group"
            >
              <svg
                className="w-6 h-6 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Close Button */}
          <button
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm group"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6 transition-transform group-hover:scale-110" />
          </button>

          {/* Photo Counter */}
          {photos.length > 1 && (
            <div className="absolute top-6 left-6 z-10 px-3 py-2 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
              {currentPhotoIndex + 1} of {photos.length}
            </div>
          )}

          {/* Main Photo Container */}
          <motion.div
            key={selectedPhoto.fileName}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
              <img
                src={selectedPhoto.url || "/placeholder.svg"}
                alt={selectedPhoto.fileName}
                className="max-w-[85vw] max-h-[75vh] object-contain"
                style={{ minHeight: "200px" }}
              />
            </div>

            {/* Photo Metadata */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-4 bg-sp_darkgreen/95 backdrop-blur-md rounded-lg p-4 text-sp_eggshell border border-sp_lightgreen/20 max-w-full min-w-[300px]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sp_eggshell text-lg truncate mb-1">
                    {selectedPhoto.fileName}
                  </h3>
                  <p className="text-sm text-sp_lightgreen">
                    {new Date(selectedPhoto.created_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {selectedPhoto.isGuestPhoto && (
                    <span className="px-3 py-1 bg-sp_midgreen text-sp_eggshell rounded-full text-xs font-medium">
                      Guest Photo
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-sp_lightgreen/20">
                <button
                  onClick={() => handleDownloadSinglePhoto(selectedPhoto)}
                  className="flex items-center gap-2 px-4 py-2 bg-sp_green hover:bg-sp_midgreen text-sp_eggshell rounded-lg transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() =>
                    console.log("Share photo:", selectedPhoto.fileName)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-sp_lightgreen/20 hover:bg-sp_lightgreen/30 text-sp_eggshell rounded-lg transition-colors"
                >
                  <Share className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() =>
                    console.log("More options:", selectedPhoto.fileName)
                  }
                  className="p-2 text-sp_eggshell hover:bg-sp_lightgreen/20 rounded-lg transition-colors"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Keyboard Hints */}
            {photos.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-white/60 text-xs text-center"
              >
                Use ← → arrow keys to navigate • ESC to close
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
