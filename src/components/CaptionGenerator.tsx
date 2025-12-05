// src/components/CaptionGenerator.tsx
import { useState } from "react";

interface CaptionGeneratorProps {
  eventId: string;
  onComplete?: () => void;
}

export function CaptionGenerator({
  eventId,
  onComplete,
}: CaptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{
    processed: number;
    failed: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateCaptions = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(null);

      console.log(`🤖 Starting AI caption generation for event: ${eventId}`);

      const response = await fetch(
        `https://api.spevents.live/api/generate-captions-batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId,
            limit: 5, // Process 5 at a time
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate captions");
      }

      const result = await response.json();
      console.log("✅ Caption generation complete:", result);

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
      console.error("❌ Caption generation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">🤖 AI Caption Generator</h3>
        <button
          onClick={generateCaptions}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isGenerating
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600 text-white"
          }`}
        >
          {isGenerating ? "Generating..." : "Generate AI Captions"}
        </button>
      </div>

      {isGenerating && (
        <div className="text-sm text-gray-300 animate-pulse">
          AI is analyzing photos and writing captions...
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
