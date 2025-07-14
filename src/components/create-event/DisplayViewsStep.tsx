// File: src/components/create-event/DisplayViewsStep.tsx

import { useState } from "react";
import { Plus, X, Eye, Grid3X3, Layers, RotateCcw, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const slideshowPresets: SlideshowPreset[] = [
    {
      id: "classic",
      name: "Classic Grid",
      description: "Traditional photo grid layout",
      icon: Grid3X3,
    },
    {
      id: "mosaic",
      name: "Dynamic Mosaic",
      description: "Mixed size photo arrangement",
      icon: Layers,
    },
    {
      id: "carousel",
      name: "Rotating Carousel",
      description: "Continuous photo rotation",
      icon: RotateCcw,
    },
    {
      id: "collage",
      name: "Creative Collage",
      description: "Artistic photo collage",
      icon: Shapes,
    },
  ];

  const addSlideshowView = () => {
    const newView = {
      id: Date.now(),
      name: `Display ${eventData.slideshowViews.length + 1}`,
      type: "slideshow",
      preset: "classic",
      isDefault: false,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold" style={{ color: colors.green }}>
            Slideshow Views
          </h4>
          <p className="text-sm" style={{ color: colors.darkGreen }}>
            Create multiple display screens for your event
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
