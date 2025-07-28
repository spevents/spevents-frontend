// File: src/components/create-event/DisplayViewsStep/DisplayViewsStep.tsx

import { useState } from "react";
import {
  Plus,
  X,
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
  Settings,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { EventData, colors, Theme, SlideshowPreset } from "@/types/eventTypes";

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

  // Sample photos for preview
  const samplePhotos = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
    "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=400",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
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

  // Simple slideshow preview component
  const SlideshowPreview = () => {
    if (samplePhotos.length === 0) {
      return (
        <div
          className="flex items-center justify-center h-full rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${eventData.colors.primary}40, ${eventData.colors.secondary}20)`,
          }}
        >
          <div className="text-center text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Slideshow preview</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative w-full h-full overflow-hidden rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${eventData.colors.primary}40, ${eventData.colors.secondary}20)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-4 flex items-center justify-center"
        >
          <img
            src={samplePhotos[0]}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{
              border: `2px solid ${eventData.colors.secondary}80`,
              boxShadow: `0 0 20px ${eventData.colors.primary}30`,
            }}
          />
        </motion.div>

        {/* Mode indicator */}
        <div
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: eventData.colors.primary + "90",
            color: "white",
          }}
        >
          {eventData.slideshowViews[0]?.preset || "Classic"} Mode
        </div>

        {/* Color theme indicator */}
        <div className="absolute top-3 right-3 flex gap-1">
          <div
            className="w-3 h-3 rounded-full border border-white/50"
            style={{ backgroundColor: eventData.colors.primary }}
          />
          <div
            className="w-3 h-3 rounded-full border border-white/50"
            style={{ backgroundColor: eventData.colors.secondary }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Slideshow Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: colors.green }}>
            Slideshow Preview
          </CardTitle>
          <p className="text-sm text-gray-600">
            See how your selected theme colors will look in the slideshow
          </p>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <SlideshowPreview />
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

      {/* Display Views & Presets Section */}
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets">Display Presets</TabsTrigger>
          <TabsTrigger value="views">Slideshow Views</TabsTrigger>
          <TabsTrigger value="widgets">Dashboard Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.green }}>
                Choose Display Preset
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select how photos will be displayed during your event
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slideshowPresets.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <Card
                      key={preset.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        eventData.slideshowViews[0]?.preset === preset.id
                          ? "ring-2 shadow-md"
                          : "hover:ring-1"
                      }`}
                      style={
                        {
                          "--ring-color":
                            eventData.slideshowViews[0]?.preset === preset.id
                              ? colors.green
                              : `${colors.lightGreen}50`,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        setEventData((prev) => ({
                          ...prev,
                          slideshowViews: [
                            {
                              ...prev.slideshowViews[0],
                              preset: preset.id,
                            },
                          ],
                        }))
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${colors.green}20` }}
                          >
                            <IconComponent
                              className="w-5 h-5"
                              style={{ color: colors.green }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4
                              className="font-medium text-sm mb-1"
                              style={{ color: colors.green }}
                            >
                              {preset.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {preset.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {preset.features.slice(0, 2).map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="secondary"
                                  style={{
                                    backgroundColor: `${colors.lightGreen}20`,
                                    color: colors.darkGreen,
                                  }}
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

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
        </TabsContent>

        {/* Other tab contents remain the same... */}
        <TabsContent value="views" className="space-y-6">
          {/* Slideshow Views */}
          <div className="flex justify-between items-center">
            <div>
              <h4
                className="text-lg font-semibold"
                style={{ color: colors.green }}
              >
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

          <div className="grid gap-4">
            {eventData.slideshowViews.map((view) => (
              <Card key={view.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: view.isDefault
                            ? colors.green
                            : colors.lightGreen,
                        }}
                      />
                      <div>
                        <h4
                          className="font-medium"
                          style={{ color: colors.green }}
                        >
                          {view.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {view.preset} • {view.type}
                          {view.isDefault && " (Default)"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        style={{
                          borderColor: colors.green,
                          color: colors.green,
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      {!view.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSlideshowView(view.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-6">
          {/* Dashboard Widgets - keeping existing content */}
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.green }}>
                Dashboard Widgets
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure what information is displayed alongside your photos
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  {
                    id: "metrics",
                    name: "Live Metrics",
                    icon: BarChart3,
                    enabled: true,
                  },
                  {
                    id: "guests",
                    name: "Guest Count",
                    icon: Users,
                    enabled: false,
                  },
                  {
                    id: "recent",
                    name: "Recent Photos",
                    icon: Camera,
                    enabled: true,
                  },
                  {
                    id: "trending",
                    name: "Trending",
                    icon: TrendingUp,
                    enabled: false,
                  },
                  {
                    id: "location",
                    name: "Location Info",
                    icon: MapPin,
                    enabled: false,
                  },
                  { id: "qr", name: "QR Code", icon: Scan, enabled: true },
                ].map((widget) => {
                  const IconComponent = widget.icon;
                  return (
                    <div
                      key={widget.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
