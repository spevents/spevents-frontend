// src/components/slideshow_modes/HuntLeaderboard.tsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import {
  ScavengerHuntLeaderboardEntry,
  ScavengerHuntTask,
  EventPhoto,
} from "@/types/event";

interface HuntLeaderboardProps {
  photos: EventPhoto[];
  tasks: ScavengerHuntTask[];
  themeColors?: { primary: string; secondary: string };
  maxEntries?: number;
}

export function HuntLeaderboard({
  photos,
  tasks,
  themeColors = { primary: "#10b981", secondary: "#f0fdf4" },
  maxEntries = 5,
}: HuntLeaderboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate leaderboard from photos
  // Photos with huntTaskId are scavenger hunt submissions
  const leaderboard = useMemo((): ScavengerHuntLeaderboardEntry[] => {
    // Group photos by guestId (only photos with huntTaskId are hunt submissions)
    const guestPhotos = new Map<string, EventPhoto[]>();

    photos.forEach((photo) => {
      // Only include photos that are part of the hunt
      if (photo.huntTaskId && photo.guestId) {
        const existing = guestPhotos.get(photo.guestId) || [];
        existing.push(photo);
        guestPhotos.set(photo.guestId, existing);
      }
    });

    // Calculate points for each guest
    const entries: ScavengerHuntLeaderboardEntry[] = [];

    guestPhotos.forEach((guestPhotoList, guestId) => {
      // Get guest name from photo metadata (stored in backend)
      const guestName = guestPhotoList[0]?.guestName || "Anonymous";

      // Count unique tasks completed using huntTaskId from metadata
      const completedTaskIds = new Set<string>();
      guestPhotoList.forEach((p) => {
        if (p.huntTaskId) {
          completedTaskIds.add(p.huntTaskId);
        }
      });

      // Calculate total points
      let totalPoints = 0;
      completedTaskIds.forEach((taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          totalPoints += task.points;
        }
      });

      entries.push({
        guestName,
        guestId,
        totalPoints,
        tasksCompleted: completedTaskIds.size,
        submissions: [],
      });
    });

    // Sort by points descending
    return entries.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [photos, tasks]);

  // Only show if there are entries
  if (leaderboard.length === 0) return null;

  const topEntries = leaderboard.slice(0, maxEntries);
  const topThree = leaderboard.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 z-20"
    >
      <div
        className="rounded-xl overflow-hidden backdrop-blur-md"
        style={{
          backgroundColor: `${themeColors.secondary}ee`,
          boxShadow: `0 4px 20px ${themeColors.primary}30`,
        }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 px-4 py-3"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <Trophy className="w-5 h-5" style={{ color: themeColors.primary }} />
          <span className="font-semibold text-gray-800">Leaderboard</span>
          <span className="ml-auto text-sm text-gray-500">
            {leaderboard.length} players
          </span>
        </button>

        {/* Mini view (always visible) */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2">
                {topThree.map((entry, index) => (
                  <div key={entry.guestId} className="flex items-center gap-2">
                    <RankBadge rank={index + 1} />
                    <span className="font-medium text-gray-800 truncate max-w-[100px]">
                      {entry.guestName}
                    </span>
                    <span
                      className="ml-auto font-bold"
                      style={{ color: themeColors.primary }}
                    >
                      {entry.totalPoints}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded view */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2 max-h-80 overflow-y-auto">
                {topEntries.map((entry, index) => (
                  <motion.div
                    key={entry.guestId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                  >
                    <RankBadge rank={index + 1} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {entry.guestName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.tasksCompleted} tasks
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-lg"
                        style={{ color: themeColors.primary }}
                      >
                        {entry.totalPoints}
                      </p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
        <Trophy className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
        <Award className="w-4 h-4 text-white" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-xs font-bold text-gray-600">{rank}</span>
    </div>
  );
}

// Photo overlay component to show guest name
interface PhotoNameOverlayProps {
  guestName?: string;
  position?: "top" | "bottom";
}

export function PhotoNameOverlay({
  guestName,
  position = "bottom",
}: PhotoNameOverlayProps) {
  if (!guestName) return null;

  return (
    <div
      className={`absolute left-0 right-0 px-3 py-2 ${
        position === "top"
          ? "top-0 bg-gradient-to-b from-black/60 to-transparent"
          : "bottom-0 bg-gradient-to-t from-black/60 to-transparent"
      }`}
    >
      <p className="text-white text-sm font-medium truncate">{guestName}</p>
    </div>
  );
}
