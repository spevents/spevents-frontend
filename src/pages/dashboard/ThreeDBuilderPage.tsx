// src/pages/dashboard/ThreeDBuilderPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Camera,
  Square,
  Circle,
  Triangle,
  Save,
  Eye,
  Wand2,
  Move3D,
} from "lucide-react";

export function ThreeDBuilderPage() {
  const [selectedTool, setSelectedTool] = useState("select");
  const [canvasObjects] = useState([
    {
      id: 1,
      type: "cube",
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      color: "#059669",
    },
    {
      id: 2,
      type: "rectangle",
      x: 200,
      y: 150,
      width: 120,
      height: 60,
      color: "#10b981",
    },
  ]);

  const tools = [
    { id: "select", name: "Select", icon: Move3D },
    { id: "rectangle", name: "Rectangle", icon: Square },
    { id: "circle", name: "Circle", icon: Circle },
    { id: "triangle", name: "Triangle", icon: Triangle },
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
                Preview 3D
              </button>
              <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 bg-white border-r border-emerald-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                3D Venue Builder
              </h3>
              <p className="text-sm text-emerald-600 mb-4">
                Design your venue in 2D, then transform it into a 3D model where
                photos will appear.
              </p>
            </div>

            <div className="border border-emerald-200 rounded-lg">
              <div className="pb-3 p-4">
                <h4 className="text-sm text-emerald-800 font-semibold">
                  Tools
                </h4>
              </div>
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedTool === tool.id
                          ? "bg-emerald-600 text-white"
                          : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <tool.icon className="w-4 h-4" />
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-emerald-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-emerald-800">
                  2D Canvas
                </h3>
                <span className="text-sm text-emerald-600">
                  Design your venue layout
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 transition-colors">
                  <Wand2 className="w-4 h-4" />
                  Auto-arrange
                </button>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                  <Eye className="w-4 h-4" />
                  Transform to 3D
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-50 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(rgba(5, 150, 105, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(5, 150, 105, 0.1) 1px, transparent 1px)
              `,
                backgroundSize: "20px 20px",
              }}
            >
              {canvasObjects.map((obj) => (
                <motion.div
                  key={obj.id}
                  className="absolute border-2 border-emerald-400 cursor-move"
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                    backgroundColor: obj.color + "40",
                    borderRadius: obj.type === "circle" ? "50%" : "4px",
                  }}
                  drag
                  dragMomentum={false}
                  whileHover={{ scale: 1.05 }}
                  whileDrag={{ scale: 1.1 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-emerald-800 capitalize">
                      {obj.type}
                    </span>
                  </div>
                </motion.div>
              ))}

              <div className="absolute top-20 left-20 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <Camera className="w-2 h-2 text-white" />
              </div>
              <div className="absolute top-40 right-40 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <Camera className="w-2 h-2 text-white" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-emerald-200 max-w-sm">
              <h4 className="font-semibold text-emerald-800 mb-2">
                How to use:
              </h4>
              <ul className="text-sm text-emerald-600 space-y-1">
                <li>• Select tools from the sidebar</li>
                <li>• Click and drag to create shapes</li>
                <li>• Red pins show where photos will appear</li>
                <li>• Click "Transform to 3D" when ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
