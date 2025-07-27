// File: src/pages/HostRoutes/components/PhotoGrid.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import type { DisplayPhoto } from "../../types";

interface PhotoGridProps {
  photos: DisplayPhoto[];
  eventId: string;
  gridSize: "large" | "small";
  isSelectionMode: boolean;
  selectedPhotos: Set<string>;
  handlePhotoClick: (photo: DisplayPhoto) => void;
}

export function PhotoGrid({
  photos,
  eventId,
  gridSize,
  isSelectionMode,
  selectedPhotos,
  handlePhotoClick,
}: PhotoGridProps) {
  const navigate = useNavigate();

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-sp_green mb-4">No photos uploaded yet</p>
        <button
          onClick={() => navigate(`/host/event/${eventId}/qr`)}
          className="px-4 py-2 bg-sp_green text-sp_eggshell rounded-lg hover:bg-sp_darkgreen transition-colors"
        >
          Show QR Code to Get Started
        </button>
      </div>
    );
  }

  // Group photos by date
  const groupedPhotos = photos.reduce(
    (groups, photo) => {
      const date = new Date(photo.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
      return groups;
    },
    {} as Record<string, DisplayPhoto[]>,
  );

  const gridCols =
    gridSize === "large"
      ? "grid-cols-3 md:grid-cols-4"
      : "grid-cols-4 md:grid-cols-6";

  return (
    <>
      {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium text-sp_darkgreen">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <span className="text-xs px-2 py-1 bg-sp_lightgreen/30 text-sp_darkgreen rounded-full">
              {datePhotos.length} photos
            </span>
          </div>

          <div className={`grid ${gridCols} gap-2`}>
            {datePhotos.map((photo, index) => (
              <motion.div
                key={photo.fileName}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg border border-sp_lightgreen/30 bg-white"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.fileName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Selection Overlay */}
                {isSelectionMode && (
                  <div
                    className={`absolute inset-0 transition-all duration-200 ${
                      selectedPhotos.has(photo.fileName)
                        ? "bg-sp_green/40 border-2 border-sp_green"
                        : "bg-black/0 hover:bg-sp_darkgreen/10"
                    }`}
                  >
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPhotos.has(photo.fileName)
                            ? "bg-sp_green border-sp_green"
                            : "bg-sp_eggshell/90 border-sp_lightgreen"
                        }`}
                      >
                        {selectedPhotos.has(photo.fileName) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Info Overlay */}
                {!isSelectionMode && (
                  <div className="absolute inset-0 bg-gradient-to-t from-sp_darkgreen/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 right-2">
                      {photo.isGuestPhoto && (
                        <span className="text-xs px-2 py-1 bg-sp_midgreen/90 text-sp_eggshell rounded-full">
                          Guest
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </>
  );
}
