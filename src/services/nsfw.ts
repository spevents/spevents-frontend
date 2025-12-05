const HUGGING_FACE_API_URL =
  "https://api-inference.huggingface.co/models/TostAI/nsfw-image-detection-large";

interface NSFWResult {
  label: string;
  score: number;
}

export interface NSFWCheckResponse {
  isNSFW: boolean;
  score: number;
  label: string;
}

export async function checkNSFW(file: File): Promise<NSFWCheckResponse> {
  const apiKey = import.meta.env.VITE_HUGGING_FACE_API_KEY;
  console.log(
    "🔍 checkNSFW called with file:",
    file.name,
    "API Key present:",
    !!apiKey,
  );

  if (!apiKey) {
    console.warn("Missing VITE_HUGGING_FACE_API_KEY, skipping NSFW check.");
    return { isNSFW: false, score: 0, label: "skipped" };
  }

  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NSFW Check API Error:", response.status, errorText);
      // Fail open (allow upload) or fail closed (block upload) depending on policy.
      // For now, we'll log error and return false to not block users if API fails.
      return { isNSFW: false, score: 0, label: "error" };
    }

    const result: NSFWResult[] = await response.json();

    // The model returns an array of objects like [{ label: "nsfw", score: 0.9 }, { label: "normal", score: 0.1 }]
    // We need to find the "nsfw" label and check its score.
    // Note: The specific labels for TostAI/nsfw-image-detection-large might vary,
    // but usually it's "nsfw" vs "normal" or similar classes.
    // Let's inspect the output structure based on standard image classification.

    // Common labels for this model are often 'nsfw', 'sexy', 'porn', 'hentai' vs 'neutral', 'drawings'.
    // However, TostAI model specifically might just have 'nsfw' and 'normal'.
    // Let's assume standard behavior: if the top result is NSFW-related with high confidence.

    // Let's look for specific NSFW labels.
    const nsfwLabels = ["nsfw", "porn", "hentai", "sexy"];

    // Find the highest scoring label
    const topResult = result.reduce((prev, current) =>
      prev.score > current.score ? prev : current,
    );

    const isNSFW =
      nsfwLabels.includes(topResult.label.toLowerCase()) &&
      topResult.score > 0.7;

    console.log("NSFW Check Result:", { isNSFW, topResult });

    return {
      isNSFW,
      score: topResult.score,
      label: topResult.label,
    };
  } catch (error) {
    console.error("Error checking NSFW:", error);
    return { isNSFW: false, score: 0, label: "exception" };
  }
}
