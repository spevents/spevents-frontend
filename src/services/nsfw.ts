// src/services/nsfw.ts

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export interface NSFWCheckResponse {
  isNSFW: boolean;
  score: number;
  label: string;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function checkNSFW(file: File): Promise<NSFWCheckResponse> {
  console.log("🔍 checkNSFW called with file:", file.name, "size:", file.size);

  try {
    // Convert file to base64
    const fileData = await fileToBase64(file);

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/api/check-nsfw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileData,
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NSFW Check API Error:", response.status, errorText);
      // Fail open - allow upload if API fails
      return { isNSFW: false, score: 0, label: "error" };
    }

    const result: NSFWCheckResponse = await response.json();

    console.log("NSFW Check Result:", result);

    return result;
  } catch (error) {
    console.error("Error checking NSFW:", error);
    // Fail open - allow upload if exception occurs
    return { isNSFW: false, score: 0, label: "exception" };
  }
}
