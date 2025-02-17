// src/utils/collage.ts
export async function createCollage(images: string[]): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Set canvas size based on number of images
  const size = Math.ceil(Math.sqrt(images.length));
  const imageSize = 800;
  canvas.width = size * imageSize;
  canvas.height = size * imageSize;

  // Fill background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  try {
    // Load all images using signed URLs
    console.log("Loading images with signed URLs...");
    const loadedImages = await Promise.all(
      images.map(
        (url) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              console.log(
                `Successfully loaded image: ${url.substring(0, 50)}...`,
              );
              resolve(img);
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${url.substring(0, 50)}...`);
              reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
          }),
      ),
    );

    // Draw images in a grid with padding
    const imagePadding = 20;
    const effectiveSize = imageSize - imagePadding * 2;

    loadedImages.forEach((img, i) => {
      try {
        const row = Math.floor(i / size);
        const col = i % size;
        const x = col * imageSize + imagePadding;
        const y = row * imageSize + imagePadding;

        // Calculate aspect ratio preserving dimensions
        const scale = Math.min(
          effectiveSize / img.width,
          effectiveSize / img.height,
        );
        const width = img.width * scale;
        const height = img.height * scale;
        const offsetX = (imageSize - width) / 2;
        const offsetY = (imageSize - height) / 2;

        // Add a white border/background for each image
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(col * imageSize, row * imageSize, imageSize, imageSize);

        // Draw the image
        ctx.drawImage(
          img,
          x + (offsetX - imagePadding),
          y + (offsetY - imagePadding),
          width,
          height,
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

    // Add watermark background
    const metrics = ctx.measureText("spevents");
    const watermarkPadding = watermarkSize * 0.5;
    const watermarkX = canvas.width - watermarkPadding;
    const watermarkY = canvas.height - watermarkPadding;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(
      watermarkX - metrics.width - watermarkPadding,
      watermarkY - watermarkSize,
      metrics.width + watermarkPadding * 2,
      watermarkSize + watermarkPadding,
    );

    // Draw watermark text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("www.spevents.live", watermarkX, watermarkY);

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (error) {
    console.error("Error creating collage:", error);
    throw error;
  }
}
/**
 * Convert a data URL to a File object
 */
const dataUrlToFile = async (dataUrl: string): Promise<File> => {
  const blob = await fetch(dataUrl).then((res) => res.blob());
  return new File([blob], "spevents-collage.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

/**
 * Share image and optionally open Instagram
 */
export async function shareToInstagram(imageDataUrl: string) {
  try {
    const file = await dataUrlToFile(imageDataUrl);

    // Check if Web Share API is available and can share files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Made with  spevents.live",
        });
        return; // Successfully shared
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Web Share API error:", error);
        }
      }
    } else {
      // Fallback for browsers without Web Share API support
      const fileBlob = await dataUrlToFile(imageDataUrl).then((file) => file);
      const url = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "spevents-collage.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Small delay to ensure download starts
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Open Instagram after download
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Try deep linking to Instagram Stories first
        try {
          window.location.href = "instagram-stories://share";
        } catch {
          // Fallback to camera
          window.location.href = "instagram://camera";
        }
      } else {
        window.open("https://instagram.com", "_blank");
      }
    }
  } catch (error: unknown) {
    console.error("Error sharing to Instagram:", error);
    throw error;
  }
}
