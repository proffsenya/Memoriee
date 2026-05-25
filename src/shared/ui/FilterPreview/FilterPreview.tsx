import { useEffect, useRef } from 'react';
import { FilterParams } from '../../../entities/filter/types';
import { usePhotoFilter } from '../../hooks/usePhotoFilter';

interface FilterPreviewProps {
  params: FilterParams;
  className?: string;
}

// Default preview image (1x1 gradient)
const DEFAULT_PREVIEW_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad"%3E%3Cstop offset="0%25" style="stop-color:rgb(255,100,50);stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:rgb(50,150,255);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(100,255,150);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23grad)"%3E%3C/rect%3E%3Ccircle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.3)" /%3E%3C/svg%3E';

export function FilterPreview({ params, className = '' }: FilterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { applyFilterToImageData } = usePhotoFilter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load preview image
    const img = new Image();
    img.onload = () => {
      // Draw image to canvas
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply filter
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filteredData = applyFilterToImageData(imageData, params);
      ctx.putImageData(filteredData, 0, 0);
    };
    img.src = DEFAULT_PREVIEW_DATA_URL;
  }, [params, applyFilterToImageData]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-32 bg-slate-700 rounded-lg border border-slate-600 ${className}`}
      style={{ maxHeight: '180px', objectFit: 'cover' }}
    />
  );
}
