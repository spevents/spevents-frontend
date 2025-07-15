// File: src/components/create-event/LiveMetricsDashboard.tsx

import {
  BarChart3,
  Users,
  Camera,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { colors } from "@/types/eventTypes";

interface LiveMetricsDashboardProps {
  onMetricsChange?: (metrics: any) => void;
}

export function LiveMetricsDashboard({
  onMetricsChange,
}: LiveMetricsDashboardProps) {
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

  return (
    <Card className="border" style={{ borderColor: `${colors.lightGreen}30` }}>
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
                  console.log("Toggling widget:", widget.id);
                  onMetricsChange?.(widget);
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
  );
}
