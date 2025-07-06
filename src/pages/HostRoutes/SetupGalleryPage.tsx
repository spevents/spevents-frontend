// src/pages/HostRoutes/SetupGalleryPage.tsx
import {
  useState,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  SetStateAction,
} from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  Grid,
  Presentation,
  ArrowRight,
  Eye,
  Settings,
  Plus,
  Move,
  RotateCcw,
  Save,
  Play,
  Gem,
} from "lucide-react";

// Color palette constants
const colors = {
  eggshell: "#dad7cd",
  lightGreen: "#a3b18a",
  green: "#3a5a40",
  darkGreen: "#344e41",
};

export function SetupGalleryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventData = location.state?.eventData;

  const [activeView, setActiveView] = useState(0);
  const [gallerySettings, setGallerySettings] = useState({
    displayMode: "slideshow",
    autoAdvance: true,
    slideInterval: [5],
    showMetadata: false,
    gridColumns: [3],
    transitionEffect: "fade",
  });

  const [canvasObjects, setCanvasObjects] = useState([
    { id: 1, type: "photo-pin", x: 150, y: 100, width: 120, height: 80 },
    { id: 2, type: "photo-pin", x: 300, y: 200, width: 120, height: 80 },
  ]);

  const [selectedTool, setSelectedTool] = useState("select");

  const displayModes = [
    {
      id: "grid",
      name: "Grid Gallery",
      description: "Responsive photo grid layout",
      icon: Grid,
    },
    {
      id: "slideshow",
      name: "Dynamic Slideshow",
      description: "Auto-advancing slideshow",
      icon: Gem,
    },
    {
      id: "presenter",
      name: "Presenter Mode",
      description: "Full-screen display",
      icon: Presentation,
    },
    {
      id: "canvas",
      name: "Custom Canvas",
      description: "Drag-and-drop photo layout",
      icon: Move,
    },
  ];

  const transitionEffects = [
    { id: "fade", name: "Fade" },
    { id: "slide", name: "Slide" },
    { id: "zoom", name: "Zoom" },
    { id: "flip", name: "Flip" },
  ];

  const canvasTools = [
    { id: "select", name: "Select", icon: Move },
    { id: "photo-pin", name: "Photo Pin", icon: Camera },
    { id: "text", name: "Text", icon: Grid },
  ];

  const addPhotoPin = () => {
    const newPin = {
      id: Date.now(),
      type: "photo-pin",
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      width: 120,
      height: 80,
    };
    setCanvasObjects((prev) => [...prev, newPin]);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === "photo-pin") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newPin = {
        id: Date.now(),
        type: "photo-pin",
        x: x - 60,
        y: y - 40,
        width: 120,
        height: 80,
      };
      setCanvasObjects((prev) => [...prev, newPin]);
    }
  };

  const currentSlideshowViews = eventData?.slideshowViews || [
    { id: 1, name: "Main Display", type: "slideshow", isDefault: true },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.eggshell }}>
      {/* Header */}
      <header
        className="bg-white border-b"
        style={{ borderColor: `${colors.lightGreen}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/host/dashboard")}
                className="flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.green }}
                >
                  <img src="/icon.svg" alt="spevents" className="w-5 h-5" />
                </div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors.green }}
                >
                  spevents
                </h1>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="border border-opacity-30 text-sm px-3 py-1 rounded-md hover:bg-opacity-10 flex items-center gap-2"
                style={{
                  borderColor: colors.lightGreen,
                  color: colors.darkGreen,
                }}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() =>
                  navigate("/host/3d-builder", {
                    state: { eventData, gallerySettings },
                  })
                }
                className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: colors.green }}
              >
                Continue to 3D Builder
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: colors.green }}
          >
            Setup Photo Displays
          </h2>
          <p style={{ color: colors.darkGreen }}>
            Customize how photos will be displayed for:{" "}
            <strong>{eventData?.name || "Your Event"}</strong>
          </p>
        </div>

        {/* View Tabs */}
        <div className="mb-6">
          <div
            className="flex space-x-2 border-b"
            style={{ borderColor: `${colors.lightGreen}30` }}
          >
            {currentSlideshowViews.map(
              (
                view: {
                  id: Key | null | undefined;
                  name:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | null
                    | undefined;
                  isDefault: any;
                },
                index: SetStateAction<number>,
              ) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(index)}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeView === index
                      ? "border-opacity-100"
                      : "border-transparent hover:border-opacity-50"
                  }`}
                  style={{
                    borderBottomColor:
                      activeView === index ? colors.green : "transparent",
                    color:
                      activeView === index ? colors.green : colors.darkGreen,
                  }}
                >
                  {view.name}
                  {view.isDefault && (
                    <span
                      className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${colors.lightGreen}20`,
                        color: colors.darkGreen,
                      }}
                    >
                      Default
                    </span>
                  )}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Display Mode Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="border bg-white rounded-lg"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <div className="p-6 pb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.green }}
                >
                  Display Mode
                </h3>
                <p className="text-sm" style={{ color: colors.darkGreen }}>
                  Choose how photos will be presented
                </p>
              </div>
              <div className="p-6">
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
                          ? "border-opacity-100"
                          : "border-opacity-30 hover:border-opacity-60"
                      }`}
                      style={{
                        borderColor:
                          gallerySettings.displayMode === mode.id
                            ? colors.green
                            : colors.lightGreen,
                        backgroundColor:
                          gallerySettings.displayMode === mode.id
                            ? `${colors.green}10`
                            : "transparent",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <mode.icon
                          className="w-6 h-6"
                          style={{ color: colors.green }}
                        />
                        <h3
                          className="font-semibold"
                          style={{ color: colors.green }}
                        >
                          {mode.name}
                        </h3>
                      </div>
                      <p
                        className="text-sm"
                        style={{ color: colors.darkGreen }}
                      >
                        {mode.description}
                      </p>
                      <div
                        className="w-full h-16 rounded-md mt-3 flex items-center justify-center"
                        style={{ backgroundColor: `${colors.lightGreen}20` }}
                      >
                        <span
                          className="text-xs"
                          style={{ color: colors.darkGreen }}
                        >
                          Preview
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Designer */}
            {gallerySettings.displayMode === "canvas" && (
              <div
                className="border bg-white rounded-lg"
                style={{ borderColor: `${colors.lightGreen}20` }}
              >
                <div className="p-6 pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: colors.green }}
                      >
                        Canvas Designer
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.darkGreen }}
                      >
                        Design your custom photo layout
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {canvasTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setSelectedTool(tool.id)}
                          className={`p-2 rounded border transition-colors ${
                            selectedTool === tool.id
                              ? "border-opacity-100"
                              : "border-opacity-30 hover:border-opacity-60"
                          }`}
                          style={{
                            borderColor:
                              selectedTool === tool.id
                                ? colors.green
                                : colors.lightGreen,
                            backgroundColor:
                              selectedTool === tool.id
                                ? `${colors.green}10`
                                : "transparent",
                          }}
                        >
                          <tool.icon
                            className="w-4 h-4"
                            style={{ color: colors.green }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="relative w-full h-80 border-2 border-dashed rounded-lg overflow-hidden cursor-crosshair"
                    style={{
                      borderColor: `${colors.lightGreen}50`,
                      backgroundColor: `${colors.eggshell}30`,
                    }}
                    onClick={handleCanvasClick}
                  >
                    {/* Grid Background */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                          linear-gradient(${colors.lightGreen}20 1px, transparent 1px),
                          linear-gradient(90deg, ${colors.lightGreen}20 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Canvas Objects */}
                    {canvasObjects.map((obj) => (
                      <motion.div
                        key={obj.id}
                        className="absolute border-2 cursor-move flex items-center justify-center"
                        style={{
                          left: obj.x,
                          top: obj.y,
                          width: obj.width,
                          height: obj.height,
                          borderColor: colors.green,
                          backgroundColor: `${colors.green}20`,
                          borderRadius: "8px",
                        }}
                        drag
                        dragMomentum={false}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1 }}
                        onDrag={(_e, info) => {
                          setCanvasObjects((prev) =>
                            prev.map((o) =>
                              o.id === obj.id
                                ? {
                                    ...o,
                                    x: info.point.x - obj.width / 2,
                                    y: info.point.y - obj.height / 2,
                                  }
                                : o,
                            ),
                          );
                        }}
                      >
                        <Camera
                          className="w-6 h-6"
                          style={{ color: colors.green }}
                        />
                      </motion.div>
                    ))}

                    {/* Instructions */}
                    {canvasObjects.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Camera
                            className="w-12 h-12 mx-auto mb-2"
                            style={{ color: colors.lightGreen }}
                          />
                          <p
                            className="text-sm"
                            style={{ color: colors.darkGreen }}
                          >
                            Click to add photo pins or select tools above
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={addPhotoPin}
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-opacity-10"
                      style={{
                        borderColor: colors.lightGreen,
                        color: colors.darkGreen,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Photo Pin
                    </button>
                    <button
                      onClick={() => setCanvasObjects([])}
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-opacity-10"
                      style={{
                        borderColor: colors.lightGreen,
                        color: colors.darkGreen,
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode-specific Settings */}
            <div
              className="border bg-white rounded-lg"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <div className="p-6 pb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.green }}
                >
                  Display Settings
                </h3>
                <p className="text-sm" style={{ color: colors.darkGreen }}>
                  Customize behavior and appearance
                </p>
              </div>
              <div className="p-6 space-y-6">
                {gallerySettings.displayMode === "slideshow" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <label
                          className="font-medium"
                          style={{ color: colors.green }}
                        >
                          Auto-advance slides
                        </label>
                        <p
                          className="text-sm"
                          style={{ color: colors.darkGreen }}
                        >
                          Automatically move to next photo
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gallerySettings.autoAdvance}
                          onChange={(e) =>
                            setGallerySettings((prev) => ({
                              ...prev,
                              autoAdvance: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor: gallerySettings.autoAdvance
                              ? colors.green
                              : "#e5e7eb",
                          }}
                        ></div>
                      </label>
                    </div>

                    {gallerySettings.autoAdvance && (
                      <div>
                        <label
                          className="block font-medium mb-3"
                          style={{ color: colors.green }}
                        >
                          Slide interval: {gallerySettings.slideInterval[0]}{" "}
                          seconds
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="30"
                          value={gallerySettings.slideInterval[0]}
                          onChange={(e) =>
                            setGallerySettings((prev) => ({
                              ...prev,
                              slideInterval: [parseInt(e.target.value)],
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{ accentColor: colors.green }}
                        />
                      </div>
                    )}
                  </>
                )}

                {gallerySettings.displayMode === "grid" && (
                  <div>
                    <label
                      className="block font-medium mb-3"
                      style={{ color: colors.green }}
                    >
                      Grid columns: {gallerySettings.gridColumns[0]}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={gallerySettings.gridColumns[0]}
                      onChange={(e) =>
                        setGallerySettings((prev) => ({
                          ...prev,
                          gridColumns: [parseInt(e.target.value)],
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: colors.green }}
                    />
                  </div>
                )}

                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: colors.green }}
                  >
                    Transition Effect
                  </label>
                  <select
                    value={gallerySettings.transitionEffect}
                    onChange={(e) =>
                      setGallerySettings((prev) => ({
                        ...prev,
                        transitionEffect: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    style={{
                      borderColor: `${colors.lightGreen}20`,
                      backgroundColor: colors.eggshell,
                      color: colors.darkGreen,
                    }}
                  >
                    {transitionEffects.map((effect) => (
                      <option key={effect.id} value={effect.id}>
                        {effect.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview & Actions */}
          <div className="space-y-6">
            <div
              className="border bg-white rounded-lg"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <div className="p-6 pb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.green }}
                >
                  Live Preview
                </h3>
                <p className="text-sm" style={{ color: colors.darkGreen }}>
                  See your changes in real-time
                </p>
              </div>
              <div className="p-6">
                <div
                  className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{
                    backgroundColor: `${colors.lightGreen}10`,
                    borderColor: `${colors.lightGreen}20`,
                  }}
                >
                  <div className="text-center space-y-2">
                    <Camera
                      className="w-12 h-12 mx-auto"
                      style={{ color: colors.lightGreen }}
                    />
                    <p className="text-sm" style={{ color: colors.darkGreen }}>
                      Preview updates as you make changes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="border bg-white rounded-lg"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <div className="p-6 pb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.green }}
                >
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  className="w-full justify-start border text-left px-3 py-2 rounded-lg hover:bg-opacity-10 flex items-center gap-2"
                  style={{
                    borderColor: `${colors.lightGreen}20`,
                    color: colors.darkGreen,
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Preview on Mobile
                </button>
                <button
                  className="w-full justify-start border text-left px-3 py-2 rounded-lg hover:bg-opacity-10 flex items-center gap-2"
                  style={{
                    borderColor: `${colors.lightGreen}20`,
                    color: colors.darkGreen,
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Advanced Settings
                </button>
                <button
                  className="w-full justify-start border text-left px-3 py-2 rounded-lg hover:bg-opacity-10 flex items-center gap-2"
                  style={{
                    borderColor: `${colors.lightGreen}20`,
                    color: colors.darkGreen,
                  }}
                >
                  <Play className="w-4 h-4" />
                  Test with Sample Photos
                </button>
                <button
                  onClick={() => navigate("/host/dashboard")}
                  className="w-full text-white py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.green }}
                >
                  <Save className="w-4 h-4" />
                  Save & Finish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
