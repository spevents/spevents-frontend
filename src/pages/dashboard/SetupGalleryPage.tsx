// src/pages/dashboard/SetupGalleryPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Camera,
  Grid,
  GalleryHorizontal,
  Presentation,
  ArrowRight,
  Eye,
} from "lucide-react";

export function SetupGalleryPage() {
  const [gallerySettings, setGallerySettings] = useState({
    displayMode: "slideshow",
    autoAdvance: true,
    slideInterval: [5],
    showMetadata: false,
    gridColumns: [3],
    transitionEffect: "fade",
  });

  const displayModes = [
    {
      id: "grid",
      name: "Grid Gallery",
      description: "Display photos in a responsive grid layout",
      icon: Grid,
    },
    {
      id: "slideshow",
      name: "Dynamic Slideshow",
      description: "Auto-advancing slideshow with smooth transitions",
      icon: GalleryHorizontal,
    },
    {
      id: "presenter",
      name: "Presenter Mode",
      description: "Full-screen display perfect for presentations",
      icon: Presentation,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-800">spevents</h1>
            </Link>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <Link
                to="/dashboard/3d-builder"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Continue to 3D Builder
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-800 mb-2">
            Set Up Photo Gallery
          </h2>
          <p className="text-emerald-600">
            Choose how your guests' photos will be displayed during the event.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-emerald-200 bg-white rounded-lg">
              <div className="p-6">
                <h3 className="text-emerald-800 text-lg font-semibold mb-2">
                  Display Mode
                </h3>
                <p className="text-emerald-600 mb-4">
                  Choose how photos will be presented to your guests
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayModes.map((mode) => (
                    <motion.button
                      key={mode.id}
                      onClick={() =>
                        setGallerySettings((prev) => ({
                          ...prev,
                          displayMode: mode.id,
                        }))
                      }
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        gallerySettings.displayMode === mode.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-emerald-200 hover:border-emerald-300"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <mode.icon className="w-6 h-6 text-emerald-600" />
                        <h3 className="font-semibold text-emerald-800">
                          {mode.name}
                        </h3>
                      </div>
                      <p className="text-sm text-emerald-600 mb-3">
                        {mode.description}
                      </p>
                      <div className="w-full h-24 bg-emerald-100 rounded-md flex items-center justify-center">
                        <span className="text-xs text-emerald-500">
                          Preview
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-emerald-200 bg-white rounded-lg">
              <div className="p-6">
                <h3 className="text-emerald-800 text-lg font-semibold mb-2">
                  Live Preview
                </h3>
                <p className="text-emerald-600 mb-4">
                  See how your gallery will look
                </p>
                <div className="aspect-video bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Camera className="w-12 h-12 text-emerald-400 mx-auto" />
                    <p className="text-sm text-emerald-600">
                      Preview will update as you make changes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
