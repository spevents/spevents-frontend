// File: src/components/DepthMapGenerator.tsx
import { useState } from "react";

interface DepthMapGeneratorProps {
  eventId: string;
  onComplete?: () => void;
}

export function DepthMapGenerator({
  eventId,
  onComplete,
}: DepthMapGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{
    processed: number;
    failed: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDepthMaps = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(null);

      console.log(`🎬 Starting depth map generation for event: ${eventId}`);

      const response = await fetch(
        `https://api.spevents.live/api/generate-depth-maps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId,
            limit: 3,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate depth maps");
      }

      const result = await response.json();
      console.log("✅ Depth map generation complete:", result);

      setProgress({
        processed: result.processed,
        failed: result.failed,
        total: result.total,
      });

      if (result.errors && result.errors.length > 0) {
        console.warn("⚠️ Some photos failed:", result.errors);
      }

      onComplete?.();
    } catch (err) {
      console.error("❌ Depth map generation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">🎨 Depth Map Generation</h3>
        <button
          onClick={generateDepthMaps}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isGenerating
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-black"
          }`}
        >
          {isGenerating ? "Generating..." : "Generate Depth Maps"}
        </button>
      </div>

      {isGenerating && (
        <div className="text-sm text-gray-300 animate-pulse">
          Processing photos... This may take several minutes.
        </div>
      )}

      {progress && (
        <div className="mt-3 text-sm space-y-1">
          <div className="text-green-400">
            ✓ Processed: {progress.processed} / {progress.total}
          </div>
          {progress.failed > 0 && (
            <div className="text-red-400">✗ Failed: {progress.failed}</div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-900/20 rounded p-2">
          Error: {error}
        </div>
      )}
    </div>
  );
}
