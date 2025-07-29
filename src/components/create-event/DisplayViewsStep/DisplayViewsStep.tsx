// File: src/components/create-event/DisplayViewsStep/DisplayViewsStep.tsx

import { useState } from "react";
import { Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { EventData, colors, Theme } from "@/types/eventTypes";

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
    </div>
  );
}
