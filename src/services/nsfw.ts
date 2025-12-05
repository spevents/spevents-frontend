// src/services/nsfw.ts

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export interface NSFWCheckResponse {
  isNSFW: boolean;
  score: number;
  label: string;
}

// Compress image before sending to API
async function compressImage(file: File, _maxSizeMB: number = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions (max 1024px on longest side)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1024;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            console.log(`📦 Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          0.85 // Quality (0.85 = 85%)
        );
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
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
  console.log(
    "🔍 checkNSFW called with file:",
    file.name,
    "size:",
    (file.size / 1024 / 1024).toFixed(2) + "MB",
  );

  try {
    // Compress if file is larger than 1MB
    let fileToCheck = file;
    if (file.size > 1024 * 1024) {
      console.log("🗜️ Compressing image...");
      fileToCheck = await compressImage(file);
    }

    // Convert file to base64
    const fileData = await fileToBase64(fileToCheck);

    console.log("📤 Sending to API, base64 length:", fileData.length);

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/api/check-nsfw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileData,
        contentType: fileToCheck.type,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NSFW Check API Error:", response.status, errorText);
      
      // Handle specific error for file size
      if (response.status === 413) {
        return {
          isNSFW: false,
          score: 0,
          label: "file_too_large",
        };
      }
      
      // Fail open - allow upload if API fails
      return { isNSFW: false, score: 0, label: "error" };
    }

    const result: NSFWCheckResponse = await response.json();

    console.log("✅ NSFW Check Result:", result);

    return result;
  } catch (error) {
    console.error("Error checking NSFW:", error);
    // Fail open - allow upload if exception occurs
    return { isNSFW: false, score: 0, label: "exception" };
  }
}