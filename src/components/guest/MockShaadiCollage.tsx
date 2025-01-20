import { useState, useEffect } from "react";
import { ChevronLeft, Share2 } from "lucide-react";
import { shareToInstagram } from "./utils/collage";
import { getSignedPhotoUrl } from "../../lib/aws";

const THEME_COLORS = {
  tyrian: "#460b2f",
  carmine: "#9a031e",
  spanish: "#e36414",
  gold: "#bf9b30",
  almond: "#eae0d5",
} as const;

type FontOption = "playfair" | "instrumentSerif";

export interface MockShaadiCollageProps {
  selectedPhotos: string[];
  onClose: () => void;
}

const MockShaadiCollage = ({ selectedPhotos, onClose }: MockShaadiCollageProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(THEME_COLORS.tyrian);
  const [selectedFont, setSelectedFont] = useState<FontOption>("playfair");
  const [isCreating, setIsCreating] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);

  const limitedPhotos = selectedPhotos.slice(0, 12);

  useEffect(() => {
    const getSignedUrls = async () => {
      try {
        const urls = await Promise.all(
          limitedPhotos.map(async (photoUrl) => {
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
  }, [limitedPhotos]);

  const createCollage = async () => {
    setIsCreating(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Portrait orientation for Instagram Stories
      canvas.width = 1080;
      canvas.height = 1920;

      // Fill background
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add decorative border
      ctx.strokeStyle = THEME_COLORS.gold;
      ctx.lineWidth = 20;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Add ornamental corners
      const cornerSize = 100;
      ["top-left", "top-right", "bottom-left", "bottom-right"].forEach((corner) => {
        ctx.save();
        const [x, y] =
          corner === "top-left"
            ? [40, 40]
            : corner === "top-right"
            ? [canvas.width - 40, 40]
            : corner === "bottom-left"
            ? [40, canvas.height - 40]
            : [canvas.width - 40, canvas.height - 40];

        ctx.translate(x, y);
        if (corner.includes("right")) ctx.scale(-1, 1);
        if (corner.includes("bottom")) ctx.scale(1, -1);

        ctx.fillStyle = THEME_COLORS.gold;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cornerSize, 0);
        ctx.lineTo(0, cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Title
      ctx.textAlign = "center";
      ctx.fillStyle = THEME_COLORS.almond;
      ctx.font = `bold 72px ${
        selectedFont === "playfair" ? "Playfair Display" : "Instrument Serif"
      }`;
      ctx.fillText("Vanderbilt", canvas.width / 2, 160);
      ctx.fillText("Mock Shaadi 2025", canvas.width / 2, 250);

      // Load images
      const loadedImages = await Promise.all(
        signedUrls.map(
          (url) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve(img);
              img.onerror = (_err) => reject(new Error(`Failed to load image: ${url}`));
              img.src = url;
            })
        )
      );

      // Film strip configuration
      const frameWidth = 200;
      const frameHeight = frameWidth * (3 / 4);
      const frameSpacing = 210;
      const startY = 400;
      const stripWidth = 20;
      const sprocketHoleSize = 10;
      const sprocketOffset = 40;
      const sprocketsPerSide = 8;

      // Calculate columns based on number of photos
      const numPhotos = loadedImages.length;
      const columns = numPhotos <= 4 ? 1 : numPhotos <= 8 ? 2 : 3;
      const stripSpacing = 1;
      const totalStripWidth = ((frameWidth + stripWidth * 2 + sprocketOffset * 2) + stripSpacing) * columns;
      const startX = (canvas.width - totalStripWidth) / 2 + 10;

      // Process photos by columns
      for (let col = 0; col < columns; col++) {
        const columnStartIndex = col * 4;
        const columnPhotos = loadedImages.slice(columnStartIndex, columnStartIndex + 4);
        const columnX = startX + ((frameWidth + stripWidth * 2 + sprocketOffset * 2) + stripSpacing) * col;

        columnPhotos.forEach((img, i) => {
          const frameY = startY + (frameHeight + frameSpacing) * i;

          // Draw film strip holes
          ctx.fillStyle = "black";
          // Left strip
          ctx.fillRect(
            columnX + sprocketOffset - stripWidth / 2,
            frameY - frameSpacing / 2,
            stripWidth,
            frameHeight + frameSpacing
          );
          // Right strip
          ctx.fillRect(
            columnX + frameWidth + sprocketOffset - stripWidth / 2,
            frameY - frameSpacing / 2,
            stripWidth,
            frameHeight + frameSpacing
          );

          // Draw film sprocket holes
          ctx.fillStyle = THEME_COLORS.gold;
          for (let h = 0; h < sprocketsPerSide; h++) {
            // Left holes
            ctx.beginPath();
            ctx.arc(
              columnX + sprocketOffset,
              frameY + (frameHeight / (sprocketsPerSide - 1)) * h,
              sprocketHoleSize,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Right holes
            ctx.beginPath();
            ctx.arc(
              columnX + frameWidth + sprocketOffset,
              frameY + (frameHeight / (sprocketsPerSide - 1)) * h,
              sprocketHoleSize,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          // Draw black frame background
          ctx.fillStyle = "black";
          ctx.fillRect(columnX + sprocketOffset - 4, frameY - 4, frameWidth + 8, frameHeight + 8);

          // Calculate image dimensions preserving aspect ratio
          const imgAspectRatio = img.width / img.height;
          let drawWidth, drawHeight, drawX, drawY;

          if (imgAspectRatio > 4 / 3) {
            // Image is wider than frame
            drawHeight = frameHeight;
            drawWidth = drawHeight * imgAspectRatio;
            drawY = frameY;
            drawX = columnX + sprocketOffset + (frameWidth - drawWidth) / 2;
          } else {
            // Image is taller than frame
            drawWidth = frameWidth;
            drawHeight = drawWidth / imgAspectRatio;
            drawX = columnX + sprocketOffset;
            drawY = frameY + (frameHeight - drawHeight) / 2;
          }

          // Draw the image with border
          const borderSize = 4;
          ctx.drawImage(
            img,
            drawX + borderSize,
            drawY + borderSize,
            drawWidth - borderSize * 2,
            drawHeight - borderSize * 2
          );
        });
      }

      // Add watermark
      const watermarkSize = 36;
      ctx.font = `bold ${watermarkSize}px Arial`;
      ctx.textAlign = "end";
      ctx.textBaseline = "bottom";

      const watermarkText = "spevents.live";
      const metrics = ctx.measureText(watermarkText);
      const padding = watermarkSize * 0.5;
      const x = canvas.width - padding;
      const y = canvas.height - padding;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(
        x - metrics.width - padding,
        y - watermarkSize,
        metrics.width + padding * 2,
        watermarkSize + padding
      );

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(watermarkText, x, y);

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
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-lg font-playfair text-white">Mock Shaadi Collage</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Color and Font Selection */}
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-white text-sm mb-2">Theme Color</h2>
            <div className="flex gap-2">
              {Object.entries(THEME_COLORS).map(([_name, color]) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "border-white" : "border-white/20"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-white text-sm mb-2">Font Style</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFont("playfair")}
                className={`p-3 rounded-lg text-white font-playfair ${
                  selectedFont === "playfair" ? "bg-white/20" : "bg-white/10"
                }`}
              >
                Mock Shaadi
              </button>
              <button
                onClick={() => setSelectedFont("instrumentSerif")}
                className={`p-3 rounded-lg text-white font-instrument ${
                  selectedFont === "instrumentSerif" ? "bg-white/20" : "bg-white/10"
                }`}
              >
                Mock Shaadi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto pb-24">
        <div className="p-4">
          {/* Selected Photos */}
          <div>
            <h2 className="text-white mb-2">Selected Photos {limitedPhotos.length}</h2>
            <div className="grid grid-cols-4 gap-2">
              {limitedPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative bg-white/10 rounded-lg overflow-hidden"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img
                    src={photo}
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full 
                                flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collage Preview */}
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
                  Share
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

      {/* Create Button */}
      {!collageUrl && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-lg border-t border-white/10">
          <button
            onClick={createCollage}
            disabled={isCreating || limitedPhotos.length === 0 || signedUrls.length === 0}
            className={`w-full rounded-full py-3 font-medium ${
              limitedPhotos.length > 0 && !isCreating && signedUrls.length > 0
                ? "bg-[#9a031e] text-yellow-400"
                : "bg-white/10 text-white/50"
            }`}
          >
            {isCreating
              ? "Creating..."
              : limitedPhotos.length === 0
              ? "No photos selected"
              : signedUrls.length === 0
              ? "Loading photos..."
              : "Create Collage!"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MockShaadiCollage;