/**
 * Image processing utilities for client-side photo optimization
 */

/**
 * Calculates scaled dimensions preserving aspect ratio within bounding limits
 */
export function calculateScaledDimensions(
  origWidth: number,
  origHeight: number,
  maxWidth = 1280,
  maxHeight = 1280
): { width: number; height: number } {
  if (origWidth <= 0 || origHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }

  if (origWidth <= maxWidth && origHeight <= maxHeight) {
    return { width: origWidth, height: origHeight };
  }

  const ratio = Math.min(maxWidth / origWidth, maxHeight / origHeight);
  return {
    width: Math.round(origWidth * ratio),
    height: Math.round(origHeight * ratio),
  };
}

/**
 * Optimizes an uploaded File or existing base64 string using canvas resizing and compression
 */
export async function optimizeImageFile(
  fileOrDataUrl: File | string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Browser environment required for image optimization'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        const { width, height } = calculateScaledDimensions(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          maxWidth,
          maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If 2d context fails, fallback to original
          resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : img.src);
          return;
        }

        // Enable high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG format
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('Canvas compression failed, falling back to original:', err);
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : img.src);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'));
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reader error'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
