import { useState } from 'react';
import { ChevronLeft, Share2 } from 'lucide-react';
import { shareToInstagram } from './utils/collage';

const THEME_COLORS = {
  tyrian: "#460b2f",
  carmine: "#9a031e",
  spanish: "#e36414",
  gold: "#bf9b30",
  almond: "#eae0d5",
} as const;

type ThemeColor = keyof typeof THEME_COLORS;
type FontOption = 'playfair' | 'instrumentSerif';

export interface MockShaadiCollageProps {
  selectedPhotos: string[];
  onClose: () => void;
}

const MockShaadiCollage = ({ selectedPhotos, onClose }: MockShaadiCollageProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(THEME_COLORS.tyrian);
  const [selectedFont, setSelectedFont] = useState<FontOption>('playfair');
  const [isCreating, setIsCreating] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  
  const limitedPhotos = selectedPhotos.slice(0, 4);

  const createCollage = async () => {
    setIsCreating(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Set canvas dimensions for portrait orientation
      canvas.width = 1200;
      canvas.height = 1800;
      
      // Fill background with selected color
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add decorative border
      ctx.strokeStyle = THEME_COLORS.gold;
      ctx.lineWidth = 20;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      // Add ornamental corners
      const cornerSize = 100;
      ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach((corner) => {
        ctx.save();
        const [x, y] = corner === 'top-left' ? [40, 40]
          : corner === 'top-right' ? [canvas.width - 40, 40]
          : corner === 'bottom-left' ? [40, canvas.height - 40]
          : [canvas.width - 40, canvas.height - 40];
        
        ctx.translate(x, y);
        if (corner.includes('right')) ctx.scale(-1, 1);
        if (corner.includes('bottom')) ctx.scale(1, -1);
        
        ctx.fillStyle = THEME_COLORS.gold;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cornerSize, 0);
        ctx.lineTo(0, cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      
      // Add title with selected font
      ctx.textAlign = 'center';
      ctx.fillStyle = THEME_COLORS.almond;
      
      // Main title
      ctx.font = `bold 72px ${selectedFont === 'playfair' ? 'Playfair Display' : 'Instrument Serif'}`;
      ctx.fillText('Vanderbilt', canvas.width / 2, 160);
      ctx.fillText('Mock Shaadi 2025', canvas.width / 2, 250);
      
      // Load and draw images
      const loadedImages = await Promise.all(
        limitedPhotos.map(
          (url) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = url;
            })
        )
      );

      // Draw filmstrip frames
      const frameHeight = 300;
      const frameSpacing = 50;
      const startY = 350;
      
      loadedImages.forEach((img, i) => {
        // Draw frame border
        ctx.fillStyle = THEME_COLORS.gold;
        const frameY = startY + (frameHeight + frameSpacing) * i;
        
        // Add film strip holes
        const holeRadius = 15;
        const holeSpacing = 60;
        const holesPerSide = 5;
        
        for (let h = 0; h < holesPerSide; h++) {
          // Left holes
          ctx.beginPath();
          ctx.arc(50, frameY + (frameHeight / (holesPerSide - 1)) * h, holeRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Right holes
          ctx.beginPath();
          ctx.arc(canvas.width - 50, frameY + (frameHeight / (holesPerSide - 1)) * h, holeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw frame
        ctx.fillRect(
          100,
          frameY,
          canvas.width - 200,
          frameHeight
        );
        
        // Draw image inside frame with padding
        const padding = 10;
        ctx.drawImage(
          img,
          100 + padding,
          frameY + padding,
          canvas.width - 200 - (padding * 2),
          frameHeight - (padding * 2)
        );
      });

      // Add watermark
      const watermarkSize = Math.max(32, Math.floor(canvas.width * 0.03));
      ctx.font = `bold ${watermarkSize}px Arial`;
      ctx.textAlign = 'end';
      ctx.textBaseline = 'bottom';
      
      const watermarkText = 'www.spevents.live';
      const metrics = ctx.measureText(watermarkText);
      const watermarkPadding = watermarkSize * 0.5;
      const watermarkX = canvas.width - watermarkPadding;
      const watermarkY = canvas.height - watermarkPadding;

      // Add watermark background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(
        watermarkX - metrics.width - watermarkPadding,
        watermarkY - watermarkSize,
        metrics.width + watermarkPadding * 2,
        watermarkSize + watermarkPadding
      );

      // Draw watermark text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(watermarkText, watermarkX, watermarkY);

      setCollageUrl(canvas.toDataURL('image/jpeg', 0.92));
    } catch (error) {
      console.error('Error creating collage:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleShare = async () => {
    if (!collageUrl) return;
    try {
      await shareToInstagram(collageUrl);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-4 text-lg font-playfair text-white">Mock Shaadi Collage</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Theme Color Selection */}
          <div>
            <h2 className="text-white mb-2 font-playfair">Theme Color</h2>
            <div className="flex gap-2">
              {Object.entries(THEME_COLORS).map(([name, color]) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-white' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <h2 className="text-white mb-2 font-playfair">Font Style</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFont('playfair')}
                className={`p-3 rounded-lg text-white font-playfair ${
                  selectedFont === 'playfair' ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                Mock Shaadi
              </button>
              <button
                onClick={() => setSelectedFont('instrumentSerif')}
                className={`p-3 rounded-lg text-white font-instrument ${
                  selectedFont === 'instrumentSerif' ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                Mock Shaadi
              </button>
            </div>
          </div>

          {/* Selected Photos Preview */}
          <div>
            <h2 className="text-white mb-2 font-playfair">Selected Photos (4 required)</h2>
            <div className="grid grid-cols-2 gap-2">
              {limitedPhotos.map((photo, index) => (
                <div key={index} className="aspect-video bg-white/10 rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - limitedPhotos.length) }).map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="aspect-video bg-white/10 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white/40">Photo needed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview or Creation Button */}
          {!collageUrl ? (
            <button
              onClick={createCollage}
              disabled={isCreating || limitedPhotos.length !== 4}
              className={`w-full rounded-full py-3 font-medium ${
                limitedPhotos.length === 4 && !isCreating
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {isCreating 
                ? 'Creating...' 
                : limitedPhotos.length !== 4
                  ? `Select ${4 - limitedPhotos.length} more photos`
                  : 'Create Collage'
              }
            </button>
          ) : (
            <div className="space-y-4">
              <img
                src={collageUrl}
                alt="Collage preview"
                className="w-full rounded-lg"
              />
              <div className="flex gap-2">
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
    </div>
  );
};

export default MockShaadiCollage;