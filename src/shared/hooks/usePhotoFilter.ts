import { useState } from 'react';
import { FilterParams } from '../../entities/filter/types';

export const usePhotoFilter = (filterParams?: FilterParams) => {
  const [processing, setProcessing] = useState(false);

  const applyFilterToImageData = (imageData: ImageData, params: FilterParams): ImageData => {
    const data = imageData.data;

    // Apply base filter type
    switch (params.filterType) {
      case 'bw':
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
          data[i] = gray;
          data[i+1] = gray;
          data[i+2] = gray;
        }
        break;
      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case 'cool':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * 0.85;
          data[i+2] = Math.min(255, data[i+2] * 1.2);
        }
        break;
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          data[i] = Math.min(255, r * 0.4 + g * 0.769 + b * 0.189);
          data[i+1] = Math.min(255, r * 0.35 + g * 0.686 + b * 0.168);
          data[i+2] = Math.min(255, r * 0.2 + g * 0.534 + b * 0.131);
        }
        break;
      case 'warm':
      default:
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.2);
          data[i+2] = data[i+2] * 0.8;
        }
        break;
    }

    // Apply adjustments
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * params.brightness * params.contrast);
      data[i+1] = Math.min(255, data[i+1] * params.brightness * params.contrast);
      data[i+2] = Math.min(255, data[i+2] * params.brightness * params.contrast);
    }

    // Apply saturation
    if (params.saturation !== 1.0) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        data[i] = Math.min(255, gray + (r - gray) * params.saturation);
        data[i+1] = Math.min(255, gray + (g - gray) * params.saturation);
        data[i+2] = Math.min(255, gray + (b - gray) * params.saturation);
      }
    }

    // Apply warmth
    if (params.warmth !== 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + params.warmth);
        data[i+2] = Math.max(0, data[i+2] - params.warmth / 2);
      }
    }

    // Apply tint
    if (params.tint !== 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i+1] = Math.min(255, data[i+1] + params.tint);
      }
    }

    // Apply fade
    if (params.fade !== 0) {
      const fadeAmount = params.fade / 100;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + (255 - data[i]) * fadeAmount);
        data[i+1] = Math.min(255, data[i+1] + (255 - data[i+1]) * fadeAmount);
        data[i+2] = Math.min(255, data[i+2] + (255 - data[i+2]) * fadeAmount);
      }
    }

    return imageData;
  };

  const applyFilter = async (blob: Blob): Promise<Blob> => {
    setProcessing(true);
    return new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas error');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const params = filterParams || {
          filterType: 'warm',
          brightness: 1.0,
          contrast: 1.0,
          saturation: 1.0,
          hue: 0,
          warmth: 0,
          tint: 0,
          fade: 0,
          vignette: 0
        };

        const filteredImageData = applyFilterToImageData(imageData, params);
        ctx.putImageData(filteredImageData, 0, 0);

        // Apply vignette
        if (params.vignette !== 0) {
          const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2
          );
          gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
          gradient.addColorStop(1, `rgba(0, 0, 0, ${params.vignette / 100})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        canvas.toBlob((filteredBlob) => {
          if (filteredBlob) resolve(filteredBlob);
          else reject('Filter failed');
          URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = () => reject('Image load error');
      img.src = url;
    }).finally(() => setProcessing(false));
  };

  return { applyFilter, applyFilterToImageData, processing };
};