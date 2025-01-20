import { useState, useEffect } from "react";
import { ChevronLeft, LayoutGrid, Share2 } from "lucide-react";
import { getSignedPhotoUrl } from "../../lib/aws";
import { shareToInstagram } from "./utils/collage";

const COLORS = {
  backgrounds: ["#000000", "#460b2f", "#9a031e", "#e36414", "#bf9b30"],
  borders: ["#FFFFFF", "#eae0d5", "#bf9b30", "#e36414", "#460b2f"],
} as const;

export interface GridCollageProps {
  selectedPhotos: string[];
  onClose: () => void;
}

const GridCollage = ({ selectedPhotos, onClose }: GridCollageProps) => {
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [borderColor, setBorderColor] = useState("#FFFFFF");
  const [isCreating, setIsCreating] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);

  // Get signed URLs for all selected photos
  useEffect(() => {
    const getSignedUrls = async () => {
      try {
        const urls = await Promise.all(
          selectedPhotos.map(async (photoUrl) => {
            // Extract filename from CloudFront URL
            const fileName = photoUrl.split("/").pop();
            if (!fileName) throw new Error("Invalid photo URL");
            return await getSignedPhotoUrl(fileName);
          })
        );
        setSignedUrls(urls);
      } catch (error) {
        console.error("Error getting signed URLs:", error);
      }
    };

    getSignedUrls();
  }, [selectedPhotos]);

  const createGridCollage = async () => {
    console.log("Creating collage with signed URLs:", signedUrls); // Debug log
    setIsCreating(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Set canvas size based on number of images
      const baseSize = 800;
      const size = Math.ceil(Math.sqrt(selectedPhotos.length));
      canvas.width = size * baseSize;
      canvas.height = size * baseSize;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load images using signed URLs
      console.log("Loading images with signed URLs..."); // Debug log
      const loadedImages = await Promise.all(
        signedUrls.map(
          (url) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                console.log(`Loaded image: ${url.substring(0, 50)}...`);
                resolve(img);
              };
              img.onerror = (err) => {
                console.error(
                  `Failed to load image: ${url.substring(0, 50)}...`,
                  err
                );
                reject(new Error(`Failed to load image: ${url}`));
              };
              img.src = url;
            })
        )
      );

      // Draw images in a grid with padding and borders
      const padding = 5;
      const borderWidth = 2;
      const effectiveSize = baseSize - padding * 2 - borderWidth * 2;

      console.log("Drawing images..."); // Debug log
      loadedImages.forEach((img, i) => {
        try {
          const row = Math.floor(i / size);
          const col = i % size;
          const x = col * baseSize + padding + borderWidth;
          const y = row * baseSize + padding + borderWidth;

          // Calculate aspect ratio preserving dimensions
          const scale = Math.min(
            effectiveSize / img.width,
            effectiveSize / img.height
          );
          const width = img.width * scale;
          const height = img.height * scale;
          const offsetX = (baseSize - width) / 2;
          const offsetY = (baseSize - height) / 2;

          // Draw border/frame
          ctx.fillStyle = borderColor;
          ctx.fillRect(
            col * baseSize + padding,
            row * baseSize + padding,
            baseSize - padding * 2,
            baseSize - padding * 2
          );

          // Draw image
          ctx.drawImage(
            img,
            x + (offsetX - padding - borderWidth),
            y + (offsetY - padding - borderWidth),
            width,
            height
          );
        } catch (err) {
          console.error("Error drawing image:", err);
        }
      });

      // Add watermark
      const watermarkSize = Math.max(32, Math.floor(canvas.width * 0.03));
      ctx.font = `bold ${watermarkSize}px Arial`;
      ctx.textAlign = "end";
      ctx.textBaseline = "bottom";

      const watermarkText = "www.spevents.live";
      const metrics = ctx.measureText(watermarkText);
      const watermarkPadding = watermarkSize * 0.5;
      const watermarkX = canvas.width - watermarkPadding;
      const watermarkY = canvas.height - watermarkPadding;

      // Watermark background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(
        watermarkX - metrics.width - watermarkPadding,
        watermarkY - watermarkSize,
        metrics.width + watermarkPadding * 2,
        watermarkSize + watermarkPadding
      );

      // Watermark text
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(watermarkText, watermarkX, watermarkY);

      console.log("Collage created successfully"); // Debug log
      setCollageUrl(canvas.toDataURL("image/jpeg", 0.92));
    } catch (error) {
      console.error("Error creating collage:", error);
      alert("Error creating collage. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleShare = async () => {
    if (!collageUrl) return;
    try {
      await shareToInstagram(collageUrl);
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Error sharing to Instagram. Please try again.");
    }
  };
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-4 text-lg font-medium text-white">Grid Collage</h1>
        </div>

        {/* Color Selection - Moved to header */}
        <div className="px-4 pb-4 space-y-4">
          <div>
            <h2 className="text-white mb-2 text-sm">Background Color</h2>
            <div className="flex gap-2">
              {COLORS.backgrounds.map(color => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    backgroundColor === color ? 'border-white' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-white mb-2 text-sm">Frame Color</h2>
            <div className="flex gap-2">
              {COLORS.borders.map(color => (
                <button
                  key={color}
                  onClick={() => setBorderColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    borderColor === color ? 'border-white' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto pb-24">
        <div className="p-4">
          {/* Selected Photos Preview */}
          <div>
            <h2 className="text-white mb-2">Selected Photos ({selectedPhotos.length})</h2>
            <div className="grid grid-cols-2 gap-1">
              {selectedPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="relative bg-white/10 rounded-lg overflow-hidden"
                  style={{ 
                    // Set aspect ratio to match typical phone photos
                    aspectRatio: '9/16',
                    // Add a subtle inner shadow
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <img 
                    src={photo} 
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute top-2 left-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full 
                             flex items-center justify-center text-white text-sm font-medium"
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collage Preview (if created) */}
          {collageUrl && (
            <div className="mt-6">
              <img
                src={collageUrl}
                alt="Collage preview"
                className="w-full rounded-lg"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-white text-gray-900 rounded-full py-3 font-medium flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share to Instagram
                </button>
                <button
                  onClick={() => setCollageUrl(null)}
                  className="flex-1 bg-white/10 text-white rounded-full py-3 font-medium"
                >
                  Create New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Create Button at Bottom */}
      {!collageUrl && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-lg border-t border-white/10">
          <button
            onClick={createGridCollage}
            disabled={isCreating || selectedPhotos.length === 0 || signedUrls.length === 0}
            className={`w-full rounded-full py-3 font-medium flex items-center justify-center gap-2 ${
              selectedPhotos.length > 0 && signedUrls.length > 0 && !isCreating
                ? 'bg-white text-gray-900'
                : 'bg-white/10 text-white/50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            {isCreating 
              ? 'Creating...' 
              : selectedPhotos.length === 0
                ? 'No photos selected'
                : signedUrls.length === 0
                  ? 'Loading photos...'
                  : 'Create!'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default GridCollage;