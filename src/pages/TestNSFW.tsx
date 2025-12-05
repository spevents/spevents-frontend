import { useState } from "react";
import { checkNSFW, NSFWCheckResponse } from "@/services/nsfw";

export default function TestNSFW() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<NSFWCheckResponse | null>(null);
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
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
            className={`p-4 rounded-lg border ${result.isNSFW ? "border-red-500 bg-red-900/20" : "border-green-500 bg-green-900/20"}`}
          >
            <h3
              className={`text-xl font-bold mb-2 ${result.isNSFW ? "text-red-400" : "text-green-400"}`}
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
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          API Key Present:{" "}
          {import.meta.env.VITE_HUGGING_FACE_API_KEY ? "✅ Yes" : "❌ No"}
        </div>
      </div>
    </div>
  );
}
