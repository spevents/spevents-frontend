import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import GridCollage from "./GridCollage";
import MockShaadiCollage from "./MockShaadiCollage";

interface LocationState {
  selectedPhotos: string[];
}

const CollageOptionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPhotos =
    (location.state as LocationState)?.selectedPhotos || [];
  const [activeModal, setActiveModal] = useState<"grid" | "mockShaadi" | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={() => navigate("/guest")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-4 text-lg font-medium text-white">
            Choose Collage Style
          </h1>
        </div>
      </div>

      {/* Options */}
      <div className="p-4 space-y-4">
        {/* Grid Collage Option */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModal("grid")}
          className="w-full bg-white/10 rounded-2xl p-6 text-left hover:bg-white/15 transition-colors"
        >
          <h2 className="text-xl font-medium text-white mb-2">
            Custom Grid Collage
          </h2>
          <p className="text-white/60 text-sm">
            Create a customizable grid layout with borders and colors of your
            choice. Perfect for showcasing multiple photos.
          </p>
        </motion.button>

        {/* Mock Shaadi Option */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModal("mockShaadi")}
          className="w-full bg-white/10 rounded-2xl p-6 text-left hover:bg-white/15 transition-colors"
        >
          <h2 className="text-xl font-playfair text-white mb-2">
            Mock Shaadi Photobooth
          </h2>
          <p className="text-white/60 text-sm">
            Create an elegant filmstrip-style collage with the Mock Shaadi
            theme. Select 4 of your favorite photos.
          </p>
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "grid" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50"
          >
            <GridCollage
              selectedPhotos={selectedPhotos}
              onClose={() => setActiveModal(null)}
            />
          </motion.div>
        )}

        {activeModal === "mockShaadi" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50"
          >
            <MockShaadiCollage
              selectedPhotos={selectedPhotos}
              onClose={() => setActiveModal(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollageOptionsPage;
