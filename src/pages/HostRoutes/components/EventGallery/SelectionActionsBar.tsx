import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Share, ShieldAlert, Loader2 } from "lucide-react";
import type { DisplayPhoto } from "../../types";

interface SelectionActionsBarProps {
  isSelectionMode: boolean;
  selectedPhotos: Set<string>;
  photos: DisplayPhoto[];
  handleSelectAll: () => void;
  handleShareSelected: () => Promise<void>;
  handleDownloadSelected: () => Promise<void>;
  handleDeleteSelected: () => Promise<void>;
  handleCheckNSFW: () => Promise<void>;
  isDownloading: boolean;
  isDeletingPhotos: boolean;
  isCheckingNSFW: boolean;
}

export function SelectionActionsBar({
  isSelectionMode,
  selectedPhotos,
  photos,
  handleSelectAll,
  handleShareSelected,
  handleDownloadSelected,
  handleDeleteSelected,
  handleCheckNSFW,
  isDownloading,
  isDeletingPhotos,
  isCheckingNSFW,
}: SelectionActionsBarProps) {
  return (
    <AnimatePresence>
      {isSelectionMode && selectedPhotos.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-sp_lightgreen/30 bg-sp_lightgreen/20"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-sp_darkgreen">
                {selectedPhotos.size} of {photos.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-sp_green hover:text-sp_darkgreen transition-colors"
              >
                {selectedPhotos.size === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareSelected}
                className="flex items-center gap-2 px-3 py-2 border border-sp_green text-sp_green hover:bg-sp_green hover:text-sp_eggshell rounded-lg transition-colors"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleDownloadSelected}
                disabled={isDownloading}
                className="flex items-center gap-2 px-3 py-2 border border-sp_midgreen text-sp_midgreen hover:bg-sp_midgreen hover:text-sp_eggshell rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleCheckNSFW}
                disabled={isCheckingNSFW}
                className="flex items-center gap-2 px-3 py-2 border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isCheckingNSFW ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                Check NSFW
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeletingPhotos}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
