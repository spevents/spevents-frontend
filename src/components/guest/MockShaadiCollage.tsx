// src/components/guest/MockShaadiCollage.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    ? "Vanderbilt Condensed Medium"
    : getFontConfig(fontKey).style.fontFamily;
};

const getFontConfig = (fontKey: FontOption): FontConfig => {
  const configs: Record<FontOption, FontConfig> = {
    playfair: {
      name: "Playfair Display",
      class: "font-playfair",
      style: { fontFamily: "Playfair Display", fontWeight: "400" },
    },
    instrumentSerif: {
      name: "Instrument Serif",
      class: "font-instrument-serif",
      style: { fontFamily: "Instrument Serif" },
    },
    fleurDeLeah: {
      name: "Fleur De Leah",
      class: "font-fleur-de-leah",
      style: { fontFamily: "Fleur De Leah" },
    },
    galada: {
      name: "Galada (Bengali)",
      class: "font-galada",
      style: { fontFamily: "Galada" },
    },
    karlaTamilInclined: {
      name: "Karla Tamil Inclined",
      class: "font-karla-tamil-inclined",
      style: { fontFamily: "Karla Tamil Inclined" },
    },
    martel: {
      name: "Martel (Hindi)",
      class: "font-martel",
      style: { fontFamily: "Martel" },
    },
    monsieurLaDoulaise: {
      name: "Monsieur La Doulaise",
      class: "font-monsieur-la-doulaise",
      style: { fontFamily: "Monsieur La Doulaise" },
    },
    notoNastaliqUrdu: {
      name: "Noto Nastaliq Urdu",
      class: "font-noto-nastaliq-urdu",
      style: { fontFamily: "Noto Nastaliq Urdu" },
    },
  };

  return configs[fontKey];
};

export interface MockShaadiCollageProps {
  selectedPhotos: string[];
  onClose: () => void;
}

const FontModal = ({
  onClose,
  selectedFont,
  onSelectFont,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedFont: FontOption;
  onSelectFont: (font: FontOption) => void;
}) => {
  const fontOptions: FontOption[] = [
    "playfair",
    "instrumentSerif",
    "fleurDeLeah",
    "galada",
    "karlaTamilInclined",
    "martel",
    "monsieurLaDoulaise",
    "notoNastaliqUrdu",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">Select Font</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-3">
          {fontOptions.map((key) => (
            <button
              key={key}
              onClick={() => {
                onSelectFont(key);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedFont === key
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-white/20 hover:border-white/40 hover:bg-white/5"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`text-2xl mb-2 text-white ${getFontConfig(key).class}`}
                  style={getFontConfig(key).style}
                >
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
                  {getFontConfig(key).name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const MockShaadiCollage = ({
  selectedPhotos,
  onClose,
}: MockShaadiCollageProps) => {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedColor, setSelectedColor] = useState<string>(
    THEME_COLORS.tyrian,
  );
  const [selectedFont, setSelectedFont] = useState<FontOption>("playfair");
  const [isCreating, setIsCreating] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [showFontModal, setShowFontModal] = useState(false);

  const limitedPhotos = selectedPhotos.slice(0, 12);

  useEffect(() => {
    const getSignedUrls = async () => {
      if (!eventId) return;

      try {
        const urls = await Promise.all(
          limitedPhotos.map(async (photoUrl) => {
            const fileName = photoUrl.split("/").pop();
            if (!fileName) throw new Error("Invalid photo URL");
            return await getSignedPhotoUrl(eventId, fileName);
          }),
        );
        setSignedUrls(urls);
      } catch (error) {
        console.error("Error getting signed URLs:", error);
      }
    };

    getSignedUrls();
  }, [limitedPhotos, eventId]);

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

          // Draw ornamental pattern
          ctx.fillStyle = THEME_COLORS.gold;
          ctx.fillRect(0, 0, cornerSize, 10);
          ctx.fillRect(0, 0, 10, cornerSize);
          ctx.fillRect(20, 20, cornerSize - 40, 5);
          ctx.fillRect(20, 20, 5, cornerSize - 40);

          ctx.restore();
        },
      );

      // Add title text
      const titleText = NON_ENGLISH_FONTS.includes(selectedFont)
        ? selectedFont === "galada"
          ? "মজাদার বিবাহ"
          : selectedFont === "karlaTamilInclined"
            ? "ஜோக் திருமணம்"
            : selectedFont === "martel"
              ? "नकली शादी"
              : selectedFont === "notoNastaliqUrdu"
                ? "فرضی شادی"
                : "Mock Shaadi"
        : "Mock Shaadi";

      ctx.fillStyle = THEME_COLORS.gold;
      ctx.font = `bold 72px ${getVanderbiltFont(selectedFont)}`;
      ctx.textAlign = "center";
      ctx.fillText(titleText, canvas.width / 2, 200);

      // Calculate grid layout
      const maxPhotosPerCollage = Math.min(limitedPhotos.length, 12);
      const cols = maxPhotosPerCollage <= 4 ? 2 : 3;
      const rows = Math.ceil(maxPhotosPerCollage / cols);

      const gridWidth = canvas.width - 200;
      const gridHeight = canvas.height - 500;
      const photoWidth = gridWidth / cols - 20;
      const photoHeight = gridHeight / rows - 20;

      const startX = (canvas.width - gridWidth) / 2 + 10;
      const startY = 300;

      // Load and draw photos
      const imagePromises = signedUrls.slice(0, maxPhotosPerCollage).map(
        (url) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          }),
      );

      const images = await Promise.all(imagePromises);

      images.forEach((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const x = startX + col * (photoWidth + 20);
        const y = startY + row * (photoHeight + 20);

        // Create rounded rectangle path
        const radius = 15;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, photoWidth, photoHeight, radius);
        ctx.clip();

        // Calculate aspect ratio and draw image
        const imgAspect = img.width / img.height;
        const boxAspect = photoWidth / photoHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > boxAspect) {
          drawHeight = photoHeight;
          drawWidth = drawHeight * imgAspect;
          offsetY = 0;
          offsetX = (photoWidth - drawWidth) / 2;
        } else {
          drawWidth = photoWidth;
          drawHeight = drawWidth / imgAspect;
          offsetX = 0;
          offsetY = (photoHeight - drawHeight) / 2;
        }

        ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);

        // Add subtle border
        ctx.restore();
        ctx.strokeStyle = THEME_COLORS.gold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, photoWidth, photoHeight, radius);
        ctx.stroke();
      });

      // Add subtitle
      ctx.fillStyle = THEME_COLORS.almond;
      ctx.font = `32px ${getVanderbiltFont(selectedFont)}`;
      ctx.textAlign = "center";
      ctx.fillText(
        "Memories to Cherish",
        canvas.width / 2,
        canvas.height - 100,
      );

      // Convert to blob and create URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCollageUrl(url);
          }
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("Error creating collage:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleShare = () => {
    if (collageUrl) {
      shareToInstagram(
        collageUrl,
        "Check out this beautiful Mock Shaadi collage! 💖✨",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-medium">Mock Shaadi</h2>
          </div>

          {/* Color and Font Controls */}
          <div className="flex items-center gap-4">
            {/* Color Selector */}
            <div className="flex gap-2">
              {Object.entries(selectableColors)
                .filter(([_, color]) => !excludeColors.includes(color))
                .map(([key, color]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-yellow-400 scale-110"
                        : "border-white/30 hover:border-white/60"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
            </div>

            {/* Font Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFontModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Type className="w-4 h-4 text-white" />
                <div className="text-white text-sm">
                  <div
                    className={`${getFontConfig(selectedFont).class}`}
                    style={getFontConfig(selectedFont).style}
                  >
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
              </button>
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
