import { useState } from 'react';

export const usePhotoFilter = (filterName: string) => {
  const [processing, setProcessing] = useState(false);

  const applyFilter = async (blob: Blob): Promise<Blob> => {
    setProcessing(true);
    return new Promise((resolve, reject) => {
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
        const data = imageData.data;

        switch (filterName) {
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
              let r = data[i];
              let g = data[i+1];
              let b = data[i+2];
              data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
              data[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
              data[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            break;
          case 'warm':
          default:
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.min(255, data[i] * 1.2);     // R
              data[i+2] = data[i+2] * 0.8;               // B
            }
            break;
        }
        ctx.putImageData(imageData, 0, 0);
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

  return { applyFilter, processing };
};