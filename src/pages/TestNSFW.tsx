// src/pages/TestNSFW.tsx

import { useState } from "react";
import { checkNSFW, NSFWCheckResponse } from "@/services/nsfw";

interface ExtendedNSFWResponse extends NSFWCheckResponse {
  errorDetails?: {
    status?: number;
    message?: string;
    response?: any;
  };
  allResults?: Array<{ label: string; score: number }>;
}

export default function TestNSFW() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExtendedNSFWResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleCheck = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await checkNSFW(file);
      setResult(res as ExtendedNSFWResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getResultMessage = () => {
    if (!result) return null;

    if (result.label === "file_too_large") {
      return "⚠️ File was too large after compression. Try a smaller image.";
    }

    if (result.label === "api_error") {
      return (
        <div>
          <p className="font-bold">⚠️ API Error - Check your configuration!</p>
          {result.errorDetails && (
            <div className="mt-2 text-xs font-mono bg-gray-900 p-2 rounded">
              <p>Status: {result.errorDetails.status}</p>
              <p>Message: {result.errorDetails.message}</p>
            </div>
          )}
          <p className="mt-2 text-xs">
            Common causes:
            <br />
            1. Missing HUGGING_FACE_API_KEY environment variable
            <br />
            2. Invalid API key
            <br />
            3. Model loading or rate limiting
          </p>
        </div>
      );
    }

    if (result.label === "missing_api_key") {
      return "❌ Missing Hugging Face API Key! Set HUGGING_FACE_API_KEY in your environment variables.";
    }

    if (result.label === "error" || result.label === "exception") {
      return (
        <div>
          <p>⚠️ Error checking image. Upload will be allowed by default.</p>
          {result.errorDetails && (
            <div className="mt-2 text-xs font-mono bg-gray-900 p-2 rounded">
              <p>{result.errorDetails.message}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">NSFW Filter Test</h1>

      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-6">
        <div>
          <label className="block mb-2 font-medium">Select Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700"
          />
          {file && (
            <p className="text-xs text-gray-400 mt-2">
              Size: {(file.size / 1024 / 1024).toFixed(2)}MB
            </p>
          )}
        </div>

        {preview && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={!file || loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
        >
          {loading ? "Checking..." : "Check NSFW Status"}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.isNSFW
                ? "border-red-500 bg-red-900/20"
                : result.label === "error" ||
                    result.label === "api_error" ||
                    result.label === "missing_api_key" ||
                    result.label === "file_too_large" ||
                    result.label === "exception"
                  ? "border-yellow-500 bg-yellow-900/20"
                  : "border-green-500 bg-green-900/20"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-2 ${
                result.isNSFW
                  ? "text-red-400"
                  : result.label === "error" ||
                      result.label === "api_error" ||
                      result.label === "missing_api_key" ||
                      result.label === "file_too_large" ||
                      result.label === "exception"
                    ? "text-yellow-400"
                    : "text-green-400"
              }`}
            >
              {result.isNSFW ? "🚫 BLOCKED (NSFW)" : "✅ ALLOWED (Safe)"}
            </h3>
            <div className="space-y-1 text-sm font-mono">
              <p>
                Label: <span className="text-yellow-400">{result.label}</span>
              </p>
              <p>
                Score:{" "}
                <span className="text-yellow-400">
                  {(result.score * 100).toFixed(2)}%
                </span>
              </p>
            </div>

            {/* Show all results for debugging */}
            {result.allResults && result.allResults.length > 0 && (
              <div className="mt-3 text-xs">
                <p className="font-bold text-gray-300 mb-1">
                  All Classifications:
                </p>
                <div className="bg-gray-900 p-2 rounded space-y-1 font-mono">
                  {result.allResults.map((r, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{r.label}</span>
                      <span className="text-yellow-400">
                        {(r.score * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getResultMessage() && (
              <div className="mt-3 text-sm text-yellow-400">
                {getResultMessage()}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>✅ Using backend API (no frontend key needed)</p>
          <p className="mt-1">
            Images over 1MB will be automatically compressed
          </p>
          <p className="mt-1 text-yellow-400">
            ⚠️ Make sure HUGGING_FACE_API_KEY is set in your environment!
          </p>
        </div>
      </div>
    </div>
  );
}
