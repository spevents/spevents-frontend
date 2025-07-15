// File: src/components/create-event/Venue3DCreator.tsx

import {
  Boxes,
  Palette,
  Scan,
  Camera,
  Upload,
  Play,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { colors, ModelCreationMode } from "@/types/eventTypes";

interface Venue3DCreatorProps {
  modelCreationMode: ModelCreationMode;
  setModelCreationMode: (mode: ModelCreationMode) => void;
  onGeolocationToggle?: (enabled: boolean) => void;
  on3DBuilderOpen?: () => void;
  onCameraScan?: () => void;
  onVideoUpload?: () => void;
}

export function Venue3DCreator({
  modelCreationMode,
  setModelCreationMode,
  onGeolocationToggle,
  on3DBuilderOpen,
  onCameraScan,
  onVideoUpload,
}: Venue3DCreatorProps) {
  return (
    <Card className="border" style={{ borderColor: `${colors.lightGreen}30` }}>
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
                Drag and drop 2D shapes to design your venue, then transform to
                3D
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
              <Button
                onClick={on3DBuilderOpen}
                style={{ backgroundColor: colors.green }}
              >
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
                  onClick={onCameraScan}
                  style={{ backgroundColor: colors.green }}
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera Scan
                </Button>
                <Button
                  onClick={onVideoUpload}
                  variant="outline"
                  className="w-full"
                >
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
            <Switch onCheckedChange={onGeolocationToggle} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
