import { useState, useEffect } from "react";
import { ChevronLeft, LayoutGrid, Plus, Share2, Type, X } from "lucide-react";
import { shareToInstagram } from "./utils/collage";
import { getSignedPhotoUrl } from "../../lib/aws";
import { AnimatePresence, motion } from "framer-motion";

const THEME_COLORS = {
  tyrian: "#460b2f",
  carmine: "#9a031e",
  spanish: "#e36414",
  gold: "#bf9b30",
  almond: "#eae0d5",
} as const;

const NEW_COLORS = {
  forest: "#293E28",
  magenta: "#B0059F",
};

const selectableColors = {
  ...THEME_COLORS,
  ...NEW_COLORS,
};

const excludeColors = ["#bf9b30", "#eae0d5"]; // Exclude gold and almond

type FontOption =
  | "playfair"
  | "instrumentSerif"
  | "fleurDeLeah"
  | "galada"
  | "karlaTamilInclined"
  | "martel"
  | "monsieurLaDoulaise"
  | "notoNastaliqUrdu";

interface FontConfig {
  name: string;
  class: string;
  style: {
    fontFamily: string;
    fontWeight?: string;
  };
}


const NON_ENGLISH_FONTS: FontOption[] = [
  "galada",
  "karlaTamilInclined",
  "martel",
  "notoNastaliqUrdu",
];

const getVanderbiltFont = (fontKey: FontOption) => {
  return NON_ENGLISH_FONTS.includes(fontKey)
    ? FONTS["fleurDeLeah"].style
    : FONTS[fontKey].style;
};

const FONTS: Record<FontOption, FontConfig> = {
  playfair: {
    name: "Playfair Display",
    class: "font-playfair",
    style: { fontFamily: "'Playfair Display', serif" },
  },
  instrumentSerif: {
    name: "Instrument Serif",
    class: "font-instrument",
    style: { fontFamily: "'Instrument Serif', serif" },
  },
  fleurDeLeah: {
    name: "Fleur De Leah",
    class: "font-fleur",
    style: { fontFamily: "'Fleur De Leah', cursive" },
  },
  galada: {
    name: "Galada",
    class: "font-galada",
    style: { fontFamily: "'Galada', cursive" },
  },
  karlaTamilInclined: {
    name: "Karla Tamil",
    class: "font-karla",
    style: { fontFamily: "'Karla Tamil Inclined', sans-serif" },
  },
  martel: {
    name: "Martel",
    class: "font-martel",
    style: { fontFamily: "'Martel', serif", fontWeight: "600" },
  },
  monsieurLaDoulaise: {
    name: "Monsieur La Doulaise",
    class: "font-monsieur",
    style: { fontFamily: "'Monsieur La Doulaise', cursive" },
  },
  notoNastaliqUrdu: {
    name: "Noto Nastaliq",
    class: "font-noto",
    style: { fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: "600" },
  },
};

export interface MockShaadiCollageProps {
  selectedPhotos: string[];
  onClose: () => void;
}

const FontModal = ({
  isOpen,
  onClose,
  selectedFont,
  onSelectFont,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedFont: FontOption;
  onSelectFont: (font: FontOption) => void;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-xl w-full max-w-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Select Font Style</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 max-h-[60vh] overflow-y-auto">
          {(Object.entries(FONTS) as [FontOption, FontConfig][]).map(
            ([key, font]) => (
              <button
                key={key}
                onClick={() => {
                  onSelectFont(key);
                  onClose();
                }}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedFont === key
                    ? "bg-[#9a031e]/20 ring-2 ring-[#9a031e]"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="space-y-2">
                  <div
                    style={getVanderbiltFont(key)}
                    className="text-xl text-white"
                  >
                    Vanderbilt
                  </div>
                  <div style={font.style} className="text-xl text-white">
                    {key === "galada"
                      ? "মজাদার বিবাহ"
                      : key === "karlaTamilInclined"
                      ? "ஜோக் திருமணம்"
                      : key === "martel"
                      ? "नकली शादी"
                      : key === "notoNastaliqUrdu"
                      ? "فرضی شادی"
                      : "Mock Shaadi"}
                  </div>
                  <div className="text-sm mt-2 text-white/60 font-sans">
                    {font.name}
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const MockShaadiCollage = ({
  selectedPhotos,
  onClose,
}: MockShaadiCollageProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(
    THEME_COLORS.tyrian
  );
  const [selectedFont, setSelectedFont] = useState<FontOption>("playfair");
  const [isCreating, setIsCreating] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [showFontModal, setShowFontModal] = useState(false);

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
      ["top-left", "top-right", "bottom-left", "bottom-right"].forEach(
        (corner) => {
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
        }
      );

      // Set up text rendering
      ctx.textAlign = "center";
      ctx.fillStyle = THEME_COLORS.almond;

      // Set Vanderbilt text font based on selected font
      const vanderbiltFontStyle = getVanderbiltFont(selectedFont);
      ctx.font = `100px ${vanderbiltFontStyle.fontFamily}`;
      ctx.fillText("Vanderbilt University", canvas.width / 2, 160);

      // Set main text font based on selection
      const fontConfig = FONTS[selectedFont];
      const fontFamily = fontConfig.style.fontFamily;
      const fontWeight = fontConfig.style.fontWeight || "bold";
      ctx.font = `${fontWeight} 72px ${fontFamily}`;

      // Determine text based on selected font
      const mainText =
        selectedFont === "galada"
          ? "মজাদার বিবাহ"
          : selectedFont === "karlaTamilInclined"
          ? "ஜோக் திருமணம்"
          : selectedFont === "martel"
          ? "नकली शादी"
          : selectedFont === "notoNastaliqUrdu"
          ? "فرضی شادی"
          : "Mock Shaadi";

      // Special handling for right-to-left text (Urdu)
      if (selectedFont === "notoNastaliqUrdu") {
        ctx.direction = "rtl";
      }

      ctx.fillText(mainText, canvas.width / 2, 280);
      ctx.direction = "ltr";

      // Add year with some spacing
      ctx.font = `bold 56px ${fontFamily}`;
      ctx.fillText("2025", canvas.width / 2, 380);

      // Load images
      const loadedImages = await Promise.all(
        signedUrls.map(
          (url) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve(img);
              img.onerror = (_err) =>
                reject(new Error(`Failed to load image: ${url}`));
              img.src = url;
            })
        )
      );

      // Film strip configuration
      const frameWidth = 200;
      const frameHeight = frameWidth * (3 / 4);
      const frameSpacing = 210;
      const startY = 500;
      const stripWidth = 20;
      const sprocketHoleSize = 10;
      const sprocketOffset = 40;
      const sprocketsPerSide = 8;

      // Calculate columns based on number of photos
      const numPhotos = loadedImages.length;
      const columns = numPhotos <= 4 ? 1 : numPhotos <= 8 ? 2 : 3;
      const stripSpacing = 1;
      const totalStripWidth =
        (frameWidth + stripWidth * 2 + sprocketOffset * 2 + stripSpacing) *
        columns;
      const startX = (canvas.width - totalStripWidth) / 2 + 15;

      // Process photos by columns
      for (let col = 0; col < columns; col++) {
        const columnStartIndex = col * 4;
        const columnPhotos = loadedImages.slice(
          columnStartIndex,
          columnStartIndex + 4
        );
        const columnX =
          startX +
          (frameWidth + stripWidth * 2 + sprocketOffset * 2 + stripSpacing) *
            col;

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
          ctx.fillStyle = "white";
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
          ctx.fillRect(
            columnX + sprocketOffset - 4,
            frameY - 4,
            frameWidth + 8,
            frameHeight + 8
          );

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
      ctx.font = `bold ${watermarkSize}px Quicksand`;
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
      <div className="flex-none bg-gray-900/80 backdrop-blur-lg z-10">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-4 text-lg font-playfair text-white">
            Mock Shaadi Collage
          </h1>
        </div>

        {/* Theme Selection and Action Buttons */}
        <div className="px-4 pb-4 flex">
          {/* Theme and Font Selection */}
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-white text-sm mb-2">Theme Color</h2>
              <div className="flex gap-2">
                {Object.entries(selectableColors).map(
                  ([_name, color]) =>
                    !excludeColors.includes(color) && (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color
                            ? "border-white"
                            : "border-white/20"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                )}
              </div>
            </div>

            <div>
              <h2 className="text-white text-sm mb-2">Font Style</h2>
              <button
                onClick={() => setShowFontModal(true)}
                className="w-full p-3 rounded-lg text-white bg-white/10 hover:bg-white/15 transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-white/60" />
                  <div>
                    <div
                      style={getVanderbiltFont(selectedFont)}
                      className="text-lg"
                    >
                      Vanderbilt
                    </div>
                    <div style={FONTS[selectedFont].style} className="text-lg">
                      {selectedFont === "galada"
                        ? "মজাদার বিবাহ"
                        : selectedFont === "karlaTamilInclined"
                        ? "ஜோக் திருமணம்"
                        : selectedFont === "martel"
                        ? "नकली शादी"
                        : selectedFont === "notoNastaliqUrdu"
                        ? "فرضی شادی"
                        : "Mock Shaadi"}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center ml-4 pl-4 border-l border-white/10">
            <AnimatePresence mode="wait">
              {collageUrl ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-2 w-32"
                >
                  <button
                    onClick={handleShare}
                    className="w-full py-3 bg-[#9a031e] text-yellow-400 rounded-full font-medium flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  <button
                    onClick={() => setCollageUrl(null)}
                    className="w-full py-3 bg-white/10 text-white rounded-full font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={createCollage}
                  disabled={
                    isCreating ||
                    limitedPhotos.length === 0 ||
                    signedUrls.length === 0
                  }
                  className={`w-32 h-full rounded-full font-medium flex items-center justify-center gap-2 ${
                    limitedPhotos.length > 0 &&
                    !isCreating &&
                    signedUrls.length > 0
                      ? "bg-[#9a031e] text-yellow-400"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  {isCreating
                    ? "Creating..."
                    : limitedPhotos.length === 0
                    ? "No photos"
                    : signedUrls.length === 0
                    ? "Loading..."
                    : "Create!"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 pb-36">
          {/* Collage Preview */}
          <AnimatePresence>
            {collageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <img
                  src={collageUrl}
                  alt="Collage preview"
                  className="w-full rounded-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Photos Grid */}
          <div>
            <h2 className="text-white mb-2">
              Selected Photos ({limitedPhotos.length})
            </h2>
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
        </div>
      </div>

      {/* Font Selection Modal */}
      <AnimatePresence>
        {showFontModal && (
          <FontModal
            isOpen={showFontModal}
            onClose={() => setShowFontModal(false)}
            selectedFont={selectedFont}
            onSelectFont={setSelectedFont}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockShaadiCollage;
