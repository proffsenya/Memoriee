import { useState } from 'react';

export const usePhotoFilter = (filterName: string) => {
  const [processing, setProcessing] = useState(false);

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
          reject('Canvas context error');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        switch (filterName) {
          case 'bw':
            for (let i = 0; i < imageData.data.length; i += 4) {
              const r = imageData.data[i];
              const g = imageData.data[i+1];
              const b = imageData.data[i+2];
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              imageData.data[i] = gray;
              imageData.data[i+1] = gray;
              imageData.data[i+2] = gray;
            }
            break;
          case 'vintage':
            for (let i = 0; i < imageData.data.length; i += 4) {
              let r = imageData.data[i];
              let g = imageData.data[i+1];
              let b = imageData.data[i+2];
              const tr = 0.393 * r + 0.769 * g + 0.189 * b;
              const tg = 0.349 * r + 0.686 * g + 0.168 * b;
              const tb = 0.272 * r + 0.534 * g + 0.131 * b;
              imageData.data[i] = Math.min(255, tr);
              imageData.data[i+1] = Math.min(255, tg);
              imageData.data[i+2] = Math.min(255, tb);
            }
            break;
          case 'warm':
          default:
            for (let i = 0; i < imageData.data.length; i += 4) {
              let r = imageData.data[i];
              let b = imageData.data[i+2];
              imageData.data[i] = Math.min(255, r * 1.2);
              imageData.data[i+2] = b * 0.8;
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