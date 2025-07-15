// File: src/components/create-event/CustomSlideshowBuilder.tsx

import {
  Palette,
  Camera,
  Monitor,
  Grid3X3,
  Move,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { colors, PhotoBlock } from "@/types/eventTypes";

interface CustomSlideshowBuilderProps {
  onPreview?: () => void;
  onSaveTemplate?: () => void;
  onAnimationChange?: (settings: any) => void;
}

export function CustomSlideshowBuilder({
  onPreview,
  onSaveTemplate,
  onAnimationChange,
}: CustomSlideshowBuilderProps) {
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

  return (
    <Card className="border" style={{ borderColor: `${colors.lightGreen}30` }}>
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
                <Button onClick={onPreview} variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button onClick={onSaveTemplate} variant="outline" size="sm">
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
              <select
                className="w-full mt-1 p-2 border rounded"
                onChange={(e) =>
                  onAnimationChange?.({ transition: e.target.value })
                }
              >
                <option>Fade In</option>
                <option>Slide In</option>
                <option>Scale Up</option>
                <option>Flip</option>
              </select>
            </div>
            <div>
              <Label className="text-sm">Duration</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                onChange={(e) =>
                  onAnimationChange?.({ duration: e.target.value })
                }
              >
                <option>0.5s</option>
                <option>1s</option>
                <option>2s</option>
                <option>3s</option>
              </select>
            </div>
            <div>
              <Label className="text-sm">Display Time</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                onChange={(e) =>
                  onAnimationChange?.({ displayTime: e.target.value })
                }
              >
                <option>3s</option>
                <option>5s</option>
                <option>10s</option>
                <option>15s</option>
              </select>
            </div>
            <div>
              <Label className="text-sm">Auto Advance</Label>
              <Switch
                className="mt-2"
                onCheckedChange={(checked) =>
                  onAnimationChange?.({ autoAdvance: checked })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
