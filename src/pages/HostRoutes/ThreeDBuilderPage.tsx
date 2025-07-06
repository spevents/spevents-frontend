// src/pages/HostRoutes/ThreeDBuilderPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  Square,
  Circle,
  Triangle,
  RotateCcw,
  Save,
  Eye,
  Wand2,
  Plus,
  Trash2,
  Move3D,
  Crown,
  Lock,
  Zap,
  Layers,
  Palette,
  Gem,
} from "lucide-react";

// Color palette constants
const colors = {
  eggshell: "#dad7cd",
  lightGreen: "#a3b18a",
  green: "#3a5a40",
  darkGreen: "#344e41",
};

export function ThreeDBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventData = location.state?.eventData;

  const [selectedTool, setSelectedTool] = useState("select");
  const [canvasObjects, setCanvasObjects] = useState([
    {
      id: 1,
      type: "cube",
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      color: colors.green,
    },
    {
      id: 2,
      type: "rectangle",
      x: 200,
      y: 150,
      width: 120,
      height: 60,
      color: colors.lightGreen,
    },
  ]);

  const [photoPins, setPhotoPins] = useState([
    { id: 1, x: 120, y: 120, type: "photo-pin" },
    { id: 2, x: 220, y: 170, type: "photo-pin" },
  ]);

  const [activeTab, setActiveTab] = useState("design");
  const [isPremium, _setIsPremium] = useState(false);

  const tools = [
    { id: "select", name: "Select", icon: Move3D },
    { id: "cube", name: "Cube", icon: Gem },
    { id: "rectangle", name: "Rectangle", icon: Square },
    { id: "circle", name: "Circle", icon: Circle },
    { id: "triangle", name: "Triangle", icon: Triangle },
    { id: "photo-pin", name: "Photo Pin", icon: Camera },
  ];

  const presets = [
    { id: "wedding-hall", name: "Wedding Hall", isPremium: false },
    { id: "conference-room", name: "Conference Room", isPremium: false },
    { id: "outdoor-garden", name: "Outdoor Garden", isPremium: true },
    { id: "nightclub", name: "Nightclub", isPremium: true },
    { id: "beach-venue", name: "Beach Venue", isPremium: true },
    { id: "rooftop-bar", name: "Rooftop Bar", isPremium: true },
  ];

  const colorPalette = [
    colors.green,
    colors.lightGreen,
    colors.darkGreen,
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#10b981",
  ];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool !== "select") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (selectedTool === "photo-pin") {
        const newPin = {
          id: Date.now(),
          x: x - 10,
          y: y - 10,
          type: "photo-pin",
        };
        setPhotoPins((prev) => [...prev, newPin]);
      } else {
        const newObject = {
          id: Date.now(),
          type: selectedTool,
          x: x - 40,
          y: y - 40,
          width: 80,
          height: 80,
          color: colors.green,
        };
        setCanvasObjects((prev) => [...prev, newObject]);
      }
    }
  };

  const loadPreset = (presetId: string) => {
    if (presets.find((p) => p.id === presetId)?.isPremium && !isPremium) {
      return;
    }

    // Load preset configurations
    const presetConfigs = {
      "wedding-hall": {
        objects: [
          {
            id: 1,
            type: "rectangle",
            x: 150,
            y: 80,
            width: 200,
            height: 100,
            color: colors.green,
          },
          {
            id: 2,
            type: "circle",
            x: 250,
            y: 220,
            width: 80,
            height: 80,
            color: colors.lightGreen,
          },
        ],
        pins: [
          { id: 1, x: 180, y: 110 },
          { id: 2, x: 280, y: 110 },
          { id: 3, x: 270, y: 240 },
        ],
      },
      "conference-room": {
        objects: [
          {
            id: 1,
            type: "rectangle",
            x: 100,
            y: 100,
            width: 300,
            height: 60,
            color: colors.green,
          },
          {
            id: 2,
            type: "rectangle",
            x: 50,
            y: 200,
            width: 80,
            height: 120,
            color: colors.lightGreen,
          },
          {
            id: 3,
            type: "rectangle",
            x: 370,
            y: 200,
            width: 80,
            height: 120,
            color: colors.lightGreen,
          },
        ],
        pins: [
          { id: 1, x: 200, y: 120 },
          { id: 2, x: 300, y: 120 },
          { id: 3, x: 80, y: 240 },
          { id: 4, x: 400, y: 240 },
        ],
      },
    };

    const config = presetConfigs[presetId as keyof typeof presetConfigs];
    if (config) {
      setCanvasObjects(
        config.objects.map((obj) => ({ ...obj, type: obj.type as any })),
      );
      setPhotoPins(
        config.pins.map((pin) => ({ ...pin, type: "photo-pin" as const })),
      );
    }
  };

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
                Preview 3D
              </button>
              <button
                className="border border-opacity-30 text-sm px-3 py-1 rounded-md hover:bg-opacity-10 flex items-center gap-2"
                style={{
                  borderColor: colors.lightGreen,
                  color: colors.darkGreen,
                }}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => navigate("/host/dashboard")}
                className="text-white px-4 py-2 rounded-lg hover:opacity-90"
                style={{ backgroundColor: colors.green }}
              >
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Tools & Properties */}
        <div
          className="w-80 bg-white border-r overflow-y-auto"
          style={{ borderColor: `${colors.lightGreen}20` }}
        >
          <div className="p-6 space-y-6">
            <div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: colors.green }}
              >
                3D Venue Builder
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.darkGreen }}>
                Design your venue in 2D, then transform it into 3D
              </p>

              {/* Premium Badge */}
              <div
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{
                  backgroundColor: `${colors.lightGreen}10`,
                  borderColor: `${colors.lightGreen}30`,
                }}
              >
                <Crown className="w-5 h-5 text-yellow-500" />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.green }}
                  >
                    Premium Feature
                  </p>
                  <p className="text-xs" style={{ color: colors.darkGreen }}>
                    Upgrade for advanced 3D features
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="border-b"
              style={{ borderColor: `${colors.lightGreen}30` }}
            >
              <div className="flex space-x-4">
                {[
                  { id: "design", name: "Design", icon: Palette },
                  { id: "presets", name: "Presets", icon: Layers },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-opacity-100"
                        : "border-transparent"
                    }`}
                    style={{
                      borderBottomColor:
                        activeTab === tab.id ? colors.green : "transparent",
                      color:
                        activeTab === tab.id ? colors.green : colors.darkGreen,
                    }}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "design" && (
              <div className="space-y-4">
                {/* Tools */}
                <div
                  className="border rounded-lg"
                  style={{ borderColor: `${colors.lightGreen}20` }}
                >
                  <div
                    className="p-3 border-b"
                    style={{ borderColor: `${colors.lightGreen}20` }}
                  >
                    <h4
                      className="text-sm font-medium"
                      style={{ color: colors.green }}
                    >
                      Tools
                    </h4>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setSelectedTool(tool.id)}
                          className={`flex items-center gap-2 p-2 text-sm rounded border transition-colors ${
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
                            color: colors.green,
                          }}
                        >
                          <tool.icon className="w-4 h-4" />
                          {tool.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Properties */}
                <div
                  className="border rounded-lg"
                  style={{ borderColor: `${colors.lightGreen}20` }}
                >
                  <div
                    className="p-3 border-b"
                    style={{ borderColor: `${colors.lightGreen}20` }}
                  >
                    <h4
                      className="text-sm font-medium"
                      style={{ color: colors.green }}
                    >
                      Properties
                    </h4>
                  </div>
                  <div className="p-3 space-y-4">
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ color: colors.green }}
                      >
                        Width
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        defaultValue="100"
                        className="w-full"
                        style={{ accentColor: colors.green }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ color: colors.green }}
                      >
                        Height
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        defaultValue="100"
                        className="w-full"
                        style={{ accentColor: colors.green }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ color: colors.green }}
                      >
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {colorPalette.map((color, index) => (
                          <button
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="border rounded-lg"
                  style={{ borderColor: `${colors.lightGreen}20` }}
                >
                  <div
                    className="p-3 border-b"
                    style={{ borderColor: `${colors.lightGreen}20` }}
                  >
                    <h4
                      className="text-sm font-medium"
                      style={{ color: colors.green }}
                    >
                      Actions
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    <button
                      className="w-full flex items-center gap-2 p-2 text-sm border rounded hover:bg-opacity-10"
                      style={{
                        borderColor: `${colors.lightGreen}20`,
                        color: colors.darkGreen,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Photo Pin
                    </button>
                    <button
                      className="w-full flex items-center gap-2 p-2 text-sm border rounded hover:bg-opacity-10"
                      style={{
                        borderColor: `${colors.lightGreen}20`,
                        color: colors.darkGreen,
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Canvas
                    </button>
                    <button
                      className="w-full flex items-center gap-2 p-2 text-sm border rounded hover:bg-opacity-10"
                      style={{
                        borderColor: `${colors.lightGreen}20`,
                        color: colors.darkGreen,
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "presets" && (
              <div className="space-y-3">
                {presets.map((preset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => loadPreset(preset.id)}
                    disabled={preset.isPremium && !isPremium}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-colors relative ${
                      preset.isPremium && !isPremium
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-opacity-80"
                    }`}
                    style={{ borderColor: `${colors.lightGreen}20` }}
                    whileHover={
                      preset.isPremium && !isPremium ? {} : { scale: 1.02 }
                    }
                    whileTap={
                      preset.isPremium && !isPremium ? {} : { scale: 0.98 }
                    }
                  >
                    <div
                      className="w-full h-16 rounded-md mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.lightGreen}20` }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: colors.darkGreen }}
                      >
                        Preview
                      </span>
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.green }}
                    >
                      {preset.name}
                    </p>
                    {preset.isPremium && (
                      <div className="absolute top-2 right-2">
                        {isPremium ? (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}

                {/* Upgrade prompt */}
                {!isPremium && (
                  <div
                    className="p-4 rounded-lg border text-center"
                    style={{
                      backgroundColor: `${colors.lightGreen}10`,
                      borderColor: `${colors.lightGreen}30`,
                    }}
                  >
                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4
                      className="font-medium mb-1"
                      style={{ color: colors.green }}
                    >
                      Unlock Premium Presets
                    </h4>
                    <p
                      className="text-xs mb-3"
                      style={{ color: colors.darkGreen }}
                    >
                      Get access to advanced venue templates
                    </p>
                    <button
                      className="w-full text-white py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ backgroundColor: colors.green }}
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div
            className="bg-white border-b p-4"
            style={{ borderColor: `${colors.lightGreen}20` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.green }}
                >
                  2D Canvas
                </h3>
                <span className="text-sm" style={{ color: colors.darkGreen }}>
                  Design your venue layout for:{" "}
                  {eventData?.name || "Your Event"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-opacity-10"
                  style={{
                    borderColor: `${colors.lightGreen}20`,
                    color: colors.darkGreen,
                  }}
                >
                  <Wand2 className="w-4 h-4" />
                  Auto-arrange
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: colors.green }}
                >
                  <Gem className="w-4 h-4" />
                  Transform to 3D
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex-1 relative overflow-hidden"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            {/* Canvas Grid */}
            <div
              className="absolute inset-0 cursor-crosshair"
              style={{
                backgroundImage: `
                  linear-gradient(${colors.lightGreen}20 1px, transparent 1px),
                  linear-gradient(90deg, ${colors.lightGreen}20 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
              onClick={handleCanvasClick}
            >
              {/* Canvas Objects */}
              {canvasObjects.map((obj) => (
                <motion.div
                  key={obj.id}
                  className="absolute border-2 cursor-move"
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                    backgroundColor: obj.color + "40",
                    borderColor: obj.color,
                    borderRadius: obj.type === "circle" ? "50%" : "4px",
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xs font-medium capitalize"
                      style={{ color: obj.color }}
                    >
                      {obj.type}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Photo Pin Indicators */}
              {photoPins.map((pin) => (
                <motion.div
                  key={pin.id}
                  className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-move"
                  style={{
                    left: pin.x,
                    top: pin.y,
                    backgroundColor: "#ef4444",
                  }}
                  drag
                  dragMomentum={false}
                  whileHover={{ scale: 1.2 }}
                  whileDrag={{ scale: 1.3 }}
                  onDrag={(_e, info) => {
                    setPhotoPins((prev) =>
                      prev.map((p) =>
                        p.id === pin.id
                          ? { ...p, x: info.point.x - 10, y: info.point.y - 10 }
                          : p,
                      ),
                    );
                  }}
                >
                  <Camera className="w-3 h-3 text-white" />
                </motion.div>
              ))}
            </div>

            {/* Instructions Overlay */}
            <div
              className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg border max-w-sm"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: colors.green }}
              >
                How to use:
              </h4>
              <ul
                className="text-sm space-y-1"
                style={{ color: colors.darkGreen }}
              >
                <li>• Select tools from the sidebar</li>
                <li>• Click and drag to create shapes</li>
                <li>• Red pins show where photos will appear</li>
                <li>• Drag objects to reposition them</li>
                <li>• Click "Transform to 3D" when ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar - 3D Preview */}
        <div
          className="w-80 bg-white border-l"
          style={{ borderColor: `${colors.lightGreen}20` }}
        >
          <div className="p-6 space-y-6">
            <div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: colors.green }}
              >
                3D Preview
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.darkGreen }}>
                See how your 2D design will look in 3D
              </p>
            </div>

            <div
              className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center"
              style={{
                backgroundColor: `${colors.lightGreen}10`,
                borderColor: `${colors.lightGreen}20`,
              }}
            >
              <div className="text-center space-y-2">
                <Gem
                  className="w-12 h-12 mx-auto"
                  style={{ color: colors.lightGreen }}
                />
                <p className="text-sm" style={{ color: colors.darkGreen }}>
                  3D preview will appear here
                </p>
                <p className="text-xs" style={{ color: colors.darkGreen }}>
                  Add shapes to see the magic!
                </p>
              </div>
            </div>

            <div
              className="border rounded-lg"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <div
                className="p-3 border-b"
                style={{ borderColor: `${colors.lightGreen}20` }}
              >
                <h4
                  className="text-sm font-medium"
                  style={{ color: colors.green }}
                >
                  3D Settings
                </h4>
              </div>
              <div className="p-3 space-y-4">
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: colors.green }}
                  >
                    Camera Height
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                    style={{ accentColor: colors.green }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: colors.green }}
                  >
                    Lighting Intensity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="75"
                    className="w-full"
                    style={{ accentColor: colors.green }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: colors.green }}
                  >
                    Photo Size
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    defaultValue="30"
                    className="w-full"
                    style={{ accentColor: colors.green }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                className="w-full flex items-center justify-center gap-2 text-white py-2 rounded-lg hover:opacity-90"
                style={{ backgroundColor: colors.green }}
              >
                <Eye className="w-4 h-4" />
                Preview Full 3D
              </button>
              <button
                onClick={() => navigate("/host/dashboard")}
                className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-opacity-10"
                style={{
                  borderColor: `${colors.lightGreen}20`,
                  color: colors.darkGreen,
                }}
              >
                <Save className="w-4 h-4" />
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
