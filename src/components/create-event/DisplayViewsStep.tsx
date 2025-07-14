// File: src/components/create-event/DisplayViewsStep.tsx

import { useState } from "react";
import {
  Plus,
  X,
  Eye,
  Grid3X3,
  Layers,
  RotateCcw,
  Shapes,
  BarChart3,
  Users,
  Camera,
  TrendingUp,
  MapPin,
  Box,
  Scan,
  Palette,
  Move,
  Play,
  Clock,
  Monitor,
  Settings,
  Upload,
  Download,
  Activity,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  EventData,
  colors,
  Theme,
  SlideshowPreset,
  ModelCreationMode,
  PhotoBlock,
} from "@/types/eventTypes";

const Badge = ({
  children,
  variant,
  style,
}: {
  children: React.ReactNode;
  variant?: string;
  style?: React.CSSProperties;
}) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      variant === "secondary"
        ? "bg-gray-100 text-gray-800"
        : "bg-gray-100 text-gray-800"
    }`}
    style={style}
  >
    {children}
  </span>
);

interface DisplayViewsStepProps {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<EventData>>;
}

export function DisplayViewsStep({
  eventData,
  setEventData,
}: DisplayViewsStepProps) {
  const [customColors, setCustomColors] = useState({
    primary: colors.green,
    secondary: colors.lightGreen,
  });
  const [modelCreationMode, setModelCreationMode] =
    useState<ModelCreationMode>("2d-transform");

  const themes: Theme[] = [
    { id: "modern", name: "Modern", colors: [colors.green, colors.lightGreen] },
    { id: "elegant", name: "Elegant", colors: ["#7c3aed", "#a855f7"] },
    { id: "warm", name: "Warm", colors: ["#ea580c", "#fb923c"] },
    { id: "cool", name: "Cool", colors: ["#0284c7", "#0ea5e9"] },
    {
      id: "custom",
      name: "Custom",
      colors: [customColors.primary, customColors.secondary],
    },
  ];

  const slideshowPresets: SlideshowPreset[] = [
    {
      id: "3d-model",
      name: "3D Venue Model",
      description: "Interactive 3D venue with geolocated photos",
      icon: Box,
      category: "3D",
      features: ["Geolocation", "3D Navigation", "Real-time Updates"],
    },
    {
      id: "classic",
      name: "Classic Grid",
      description: "Traditional photo grid layout",
      icon: Grid3X3,
      category: "2D",
      features: ["Grid Layout", "Auto-sizing", "Fast Loading"],
    },
    {
      id: "mosaic",
      name: "Dynamic Mosaic",
      description: "Mixed size photo arrangement",
      icon: Layers,
      category: "2D",
      features: ["Dynamic Sizing", "Smart Layout", "Visual Impact"],
    },
    {
      id: "carousel",
      name: "Rotating Carousel",
      description: "Continuous photo rotation",
      icon: RotateCcw,
      category: "2D",
      features: ["Auto Rotation", "Smooth Transitions", "Focus Mode"],
    },
    {
      id: "collage",
      name: "Creative Collage",
      description: "Artistic photo collage",
      icon: Shapes,
      category: "2D",
      features: ["Artistic Layout", "Overlapping", "Creative Borders"],
    },
    {
      id: "custom",
      name: "Custom Builder",
      description: "Drag & drop custom layout",
      icon: Palette,
      category: "Custom",
      features: ["Full Control", "Animation Options", "Template Save"],
    },
  ];

  const photoBlocks: PhotoBlock[] = [
    {
      id: "single",
      name: "Single Photo",
      size: { width: 1, height: 1 },
      icon: Camera,
      category: "single",
    },
    {
      id: "double-h",
      name: "Double Horizontal",
      size: { width: 2, height: 1 },
      icon: Monitor,
      category: "multi",
    },
    {
      id: "double-v",
      name: "Double Vertical",
      size: { width: 1, height: 2 },
      icon: Monitor,
      category: "multi",
    },
    {
      id: "quad",
      name: "Photo Quad",
      size: { width: 2, height: 2 },
      icon: Grid3X3,
      category: "multi",
    },
  ];

  const metricsWidgets = [
    { id: "live-count", name: "Live Guest Count", icon: Users, enabled: true },
    { id: "photo-count", name: "Total Photos", icon: Camera, enabled: true },
    {
      id: "upload-rate",
      name: "Photos Per Minute",
      icon: TrendingUp,
      enabled: true,
    },
    { id: "engagement", name: "Engagement %", icon: Activity, enabled: false },
    { id: "time-trend", name: "Upload Timeline", icon: Clock, enabled: false },
  ];

  const addSlideshowView = () => {
    const newView = {
      id: Date.now(),
      name: `Display ${eventData.slideshowViews.length + 1}`,
      type: "slideshow",
      preset: "classic",
      isDefault: false,
      settings: {
        metricsEnabled: false,
        geolocationEnabled: false,
        customLayout: null,
        model3D: null,
        animations: {
          transition: "fade" as const,
          duration: 1000,
          displayTime: 5000,
          autoAdvance: true,
          easing: "ease-in-out" as const,
        },
      },
    };
    setEventData((prev) => ({
      ...prev,
      slideshowViews: [...prev.slideshowViews, newView],
    }));
  };

  const removeSlideshowView = (id: number) => {
    if (eventData.slideshowViews.length > 1) {
      setEventData((prev) => ({
        ...prev,
        slideshowViews: prev.slideshowViews.filter((view) => view.id !== id),
      }));
    }
  };

  const updateSlideshowView = (id: number, updates: any) => {
    setEventData((prev) => ({
      ...prev,
      slideshowViews: prev.slideshowViews.map((view) =>
        view.id === id ? { ...view, ...updates } : view,
      ),
    }));
  };

  const openViewEditor = (viewId: number) => {
    // TODO: Implement view editor modal
    console.log("Opening editor for view:", viewId);
  };

  return (
    <div className="space-y-6">
      {/* Live Metrics Dashboard */}
      <Card
        className="border"
        style={{ borderColor: `${colors.lightGreen}30` }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: colors.green }}
          >
            <BarChart3 className="w-5 h-5" />
            Live Event Metrics
          </CardTitle>
          <p className="text-sm" style={{ color: colors.darkGreen }}>
            Real-time analytics for host dashboard and guest displays
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metricsWidgets.map((widget) => {
              const IconComponent = widget.icon;
              return (
                <div
                  key={widget.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    widget.enabled
                      ? "border-opacity-100 shadow-sm"
                      : "border-opacity-30"
                  }`}
                  style={{
                    borderColor: widget.enabled
                      ? colors.green
                      : `${colors.lightGreen}30`,
                    backgroundColor: widget.enabled
                      ? `${colors.green}10`
                      : `${colors.eggshell}50`,
                  }}
                  onClick={() => {
                    // TODO: Toggle widget enable/disable state
                    console.log("Toggling widget:", widget.id);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent
                      className="w-4 h-4"
                      style={{ color: colors.green }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.green }}
                    >
                      {widget.name}
                    </p>
                  </div>
                  <Switch checked={widget.enabled} className="scale-75" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Slideshow Views */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold" style={{ color: colors.green }}>
            Display Views
          </h4>
          <p className="text-sm" style={{ color: colors.darkGreen }}>
            Create multiple customized screens for your event
          </p>
        </div>
        <Button
          onClick={addSlideshowView}
          style={{ backgroundColor: colors.green }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add View
        </Button>
      </div>

      <div className="space-y-4">
        {eventData.slideshowViews.map((view) => (
          <Card
            key={view.id}
            className="border"
            style={{ borderColor: `${colors.lightGreen}30` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5" style={{ color: colors.green }} />
                  <Input
                    value={view.name}
                    onChange={(e) =>
                      updateSlideshowView(view.id, {
                        name: e.target.value,
                      })
                    }
                    className="font-medium text-lg border-none bg-transparent p-0 h-auto"
                    style={{ color: colors.green }}
                  />
                  {view.isDefault && (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${colors.lightGreen}20`,
                        color: colors.darkGreen,
                      }}
                    >
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewEditor(view.id)}
                    style={{ borderColor: colors.green, color: colors.green }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Customize
                  </Button>
                  {!view.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlideshowView(view.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {slideshowPresets.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        updateSlideshowView(view.id, {
                          preset: preset.id,
                        })
                      }
                      className={`p-3 text-left border rounded-lg hover:border-opacity-80 transition-all ${
                        view.preset === preset.id
                          ? "border-opacity-100 shadow-md"
                          : "border-opacity-30"
                      }`}
                      style={{
                        borderColor:
                          view.preset === preset.id
                            ? colors.green
                            : `${colors.lightGreen}30`,
                        backgroundColor:
                          view.preset === preset.id
                            ? `${colors.green}10`
                            : `${colors.eggshell}50`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: colors.green }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: colors.green }}
                        >
                          {preset.name}
                        </p>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${colors.lightGreen}20`,
                            color: colors.darkGreen,
                            fontSize: "10px",
                          }}
                        >
                          {preset.category}
                        </Badge>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: colors.darkGreen }}
                      >
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3D Model Creation Studio */}
      <Card
        className="border"
        style={{ borderColor: `${colors.lightGreen}30` }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: colors.green }}
          >
            <Boxes className="w-5 h-5" />
            3D Venue Creator
          </CardTitle>
          <p className="text-sm" style={{ color: colors.darkGreen }}>
            Design your venue in 3D for immersive photo displays
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={modelCreationMode}
            onValueChange={(value) =>
              setModelCreationMode(value as ModelCreationMode)
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="2d-transform">2D to 3D Transform</TabsTrigger>
              <TabsTrigger value="venue-scan">Venue Scan</TabsTrigger>
            </TabsList>

            <TabsContent value="2d-transform" className="space-y-4">
              <div
                className="p-6 border-2 border-dashed rounded-lg text-center"
                style={{ borderColor: `${colors.lightGreen}50` }}
              >
                <Palette
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: colors.green }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.green }}
                >
                  Canva-Style 3D Builder
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.darkGreen }}>
                  Drag and drop 2D shapes to design your venue, then transform
                  to 3D
                </p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="w-8 h-8 bg-gray-300 mx-auto"></div>
                    <p className="text-xs mt-1">Rectangle</p>
                  </div>
                  <div className="p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto"></div>
                    <p className="text-xs mt-1">Circle</p>
                  </div>
                  <div className="p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="w-8 h-8 bg-gray-300 mx-auto transform rotate-45"></div>
                    <p className="text-xs mt-1">Diamond</p>
                  </div>
                  <div className="p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="w-8 h-4 bg-gray-300 mx-auto"></div>
                    <p className="text-xs mt-1">Platform</p>
                  </div>
                </div>
                <Button style={{ backgroundColor: colors.green }}>
                  <Play className="w-4 h-4 mr-2" />
                  Open 3D Builder
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="venue-scan" className="space-y-4">
              <div
                className="p-6 border-2 border-dashed rounded-lg text-center"
                style={{ borderColor: `${colors.lightGreen}50` }}
              >
                <Scan
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: colors.green }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.green }}
                >
                  AI Venue Scanning
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.darkGreen }}>
                  Record your venue and let AI generate a 3D model automatically
                </p>
                <div className="space-y-3">
                  <Button
                    style={{ backgroundColor: colors.green }}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera Scan
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video File
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Geolocation Settings */}
          <div
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: `${colors.lightGreen}10` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: colors.green }} />
                <div>
                  <p className="font-medium" style={{ color: colors.green }}>
                    Geolocated Photo Placement
                  </p>
                  <p className="text-xs" style={{ color: colors.darkGreen }}>
                    Photos appear where they were taken in the venue
                  </p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Slideshow Builder */}
      <Card
        className="border"
        style={{ borderColor: `${colors.lightGreen}30` }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: colors.green }}
          >
            <Palette className="w-5 h-5" />
            Custom Slideshow Builder
          </CardTitle>
          <p className="text-sm" style={{ color: colors.darkGreen }}>
            Drag and drop photo blocks to create unique layouts
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo Blocks Palette */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: colors.green }}>
                Photo Blocks
              </h4>
              <div className="space-y-2">
                {photoBlocks.map((block) => {
                  const IconComponent = block.icon;
                  return (
                    <div
                      key={block.id}
                      className="p-3 border rounded cursor-grab hover:shadow-md transition-all"
                      style={{ borderColor: `${colors.lightGreen}30` }}
                      draggable
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: colors.green }}
                        />
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: colors.green }}
                          >
                            {block.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.darkGreen }}
                          >
                            {block.size.width}x{block.size.height}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium" style={{ color: colors.green }}>
                  Canvas
                </h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Save Template
                  </Button>
                </div>
              </div>
              <div
                className="w-full h-80 border-2 border-dashed rounded-lg relative"
                style={{
                  borderColor: `${colors.lightGreen}50`,
                  backgroundColor: `${colors.eggshell}30`,
                }}
              >
                <div className="absolute inset-4 grid grid-cols-6 grid-rows-4 gap-1 opacity-20">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-gray-300"></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Move
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: colors.green }}
                    />
                    <p className="text-sm" style={{ color: colors.darkGreen }}>
                      Drag photo blocks here to build your layout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Settings */}
          <div
            className="mt-6 p-4 rounded-lg"
            style={{ backgroundColor: `${colors.lightGreen}10` }}
          >
            <h4 className="font-medium mb-3" style={{ color: colors.green }}>
              Animation Settings
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">Transition</Label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>Fade In</option>
                  <option>Slide In</option>
                  <option>Scale Up</option>
                  <option>Flip</option>
                </select>
              </div>
              <div>
                <Label className="text-sm">Duration</Label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>0.5s</option>
                  <option>1s</option>
                  <option>2s</option>
                  <option>3s</option>
                </select>
              </div>
              <div>
                <Label className="text-sm">Display Time</Label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>3s</option>
                  <option>5s</option>
                  <option>10s</option>
                  <option>15s</option>
                </select>
              </div>
              <div>
                <Label className="text-sm">Auto Advance</Label>
                <Switch className="mt-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <div>
        <h4
          className="text-lg font-semibold mb-4"
          style={{ color: colors.green }}
        >
          Choose Theme
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                eventData.theme === theme.id
                  ? "ring-2 shadow-md"
                  : "hover:ring-1"
              }`}
              style={
                {
                  "--ring-color":
                    eventData.theme === theme.id
                      ? colors.green
                      : `${colors.lightGreen}50`,
                } as React.CSSProperties
              }
              onClick={() =>
                setEventData((prev) => ({
                  ...prev,
                  theme: theme.id,
                  colors:
                    theme.id === "custom"
                      ? customColors
                      : {
                          primary: theme.colors[0],
                          secondary: theme.colors[1],
                        },
                }))
              }
            >
              <CardContent className="p-4">
                <div className="flex gap-2 mb-3">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.green }}
                >
                  {theme.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {eventData.theme === "custom" && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: colors.green }}>
                Custom Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    className="text-sm font-medium"
                    style={{ color: colors.green }}
                  >
                    Primary Color
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => {
                        const newColors = {
                          ...customColors,
                          primary: e.target.value,
                        };
                        setCustomColors(newColors);
                        setEventData((prev) => ({
                          ...prev,
                          colors: newColors,
                        }));
                      }}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={customColors.primary}
                      onChange={(e) => {
                        const newColors = {
                          ...customColors,
                          primary: e.target.value,
                        };
                        setCustomColors(newColors);
                        setEventData((prev) => ({
                          ...prev,
                          colors: newColors,
                        }));
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    className="text-sm font-medium"
                    style={{ color: colors.green }}
                  >
                    Secondary Color
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => {
                        const newColors = {
                          ...customColors,
                          secondary: e.target.value,
                        };
                        setCustomColors(newColors);
                        setEventData((prev) => ({
                          ...prev,
                          colors: newColors,
                        }));
                      }}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={customColors.secondary}
                      onChange={(e) => {
                        const newColors = {
                          ...customColors,
                          secondary: e.target.value,
                        };
                        setCustomColors(newColors);
                        setEventData((prev) => ({
                          ...prev,
                          colors: newColors,
                        }));
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
