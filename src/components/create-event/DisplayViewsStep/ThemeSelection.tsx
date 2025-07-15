// File: src/components/create-event/ThemeSelection.tsx

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventData, colors, Theme } from "@/types/eventTypes";

interface ThemeSelectionProps {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<EventData>>;
}

export function ThemeSelection({
  eventData,
  setEventData,
}: ThemeSelectionProps) {
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

  return (
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
              eventData.theme === theme.id ? "ring-2 shadow-md" : "hover:ring-1"
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
                      setEventData((prev) => ({ ...prev, colors: newColors }));
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
                      setEventData((prev) => ({ ...prev, colors: newColors }));
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
                      setEventData((prev) => ({ ...prev, colors: newColors }));
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
                      setEventData((prev) => ({ ...prev, colors: newColors }));
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
  );
}
