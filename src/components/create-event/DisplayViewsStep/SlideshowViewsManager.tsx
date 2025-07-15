// File: src/components/create-event/SlideshowViewsManager.tsx

import {
  Plus,
  X,
  Eye,
  Grid3X3,
  Layers,
  RotateCcw,
  Shapes,
  Box,
  Palette,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EventData, colors, SlideshowPreset } from "@/types/eventTypes";

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

interface SlideshowViewsManagerProps {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<EventData>>;
  onViewEditor?: (viewId: number) => void;
}

export function SlideshowViewsManager({
  eventData,
  setEventData,
  onViewEditor,
}: SlideshowViewsManagerProps) {
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

  const updateSlideshowView = (id: number, updates: any) => {
    setEventData((prev) => ({
      ...prev,
      slideshowViews: prev.slideshowViews.map((view) =>
        view.id === id ? { ...view, ...updates } : view,
      ),
    }));
  };

  return (
    <div className="space-y-4">
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
                      updateSlideshowView(view.id, { name: e.target.value })
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
                    onClick={() => onViewEditor?.(view.id)}
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
                        updateSlideshowView(view.id, { preset: preset.id })
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
    </div>
  );
}
