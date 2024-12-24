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
    // Load all images directly using signed URLs
    const loadedImages = await Promise.all(
      images.map(
        (url) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            // Now we can use crossOrigin since we have signed URLs
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
            console.log("Loading image:", url.substring(0, 100) + "...");
          })
      )
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
          effectiveSize / img.height
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
      watermarkSize + watermarkPadding
    );

    // Draw watermark text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("spevents", watermarkX, watermarkY);

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (error) {
    console.error("Error creating collage:", error);
    throw error;
  }
}

export async function shareToInstagram(imageDataUrl: string) {
  try {
    // For mobile devices, first download the image
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = "spevents-collage.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Small delay to ensure download starts
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Then open Instagram
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = "instagram://camera";
    } else {
      window.open("https://instagram.com", "_blank");
    }
  } catch (error) {
    console.error("Error sharing to Instagram:", error);
  }
}
