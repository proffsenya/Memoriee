import { useEffect, useRef, useState } from 'react';
import { FilterParams } from '../../../entities/filter/types';
import { X } from 'lucide-react';

interface FilterPreviewCameraProps {
  params: FilterParams;
  onClose: () => void;
}

// Apply filter to ImageData
const applyFilterToImageData = (imageData: ImageData, params: FilterParams): ImageData => {
  const data = imageData.data;

  // Apply base filter type
  switch (params.filterType) {
    case 'bw':
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      break;
    case 'vintage':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;
    case 'cool':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * 0.85;
        data[i + 2] = Math.min(255, data[i + 2] * 1.2);
      }
      break;
    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // More saturated yellow sepia tone
        data[i] = Math.min(255, r * 0.4 + g * 0.8 + b * 0.2);
        data[i + 1] = Math.min(255, r * 0.35 + g * 0.7 + b * 0.15);
        data[i + 2] = Math.min(255, r * 0.2 + g * 0.5 + b * 0.1);
      }
      break;
    case 'warm':
    default:
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2);
        data[i + 2] = data[i + 2] * 0.8;
      }
      break;
  }

  // Apply brightness and contrast
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * params.brightness * params.contrast));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * params.brightness * params.contrast));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * params.brightness * params.contrast));
  }

  // Apply saturation
  if (params.saturation !== 1.0) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      data[i] = Math.min(255, Math.max(0, gray + (r - gray) * params.saturation));
      data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * params.saturation));
      data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * params.saturation));
    }
  }

  // Apply hue shift (simple approximation)
  if (params.hue !== 0) {
    const hueShift = params.hue / 360;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      
      if (max === min) {
        h = 0;
      } else if (max === r) {
        h = ((g - b) / (max - min)) / 6;
      } else if (max === g) {
        h = ((b - r) / (max - min) + 2) / 6;
      } else {
        h = ((r - g) / (max - min) + 4) / 6;
      }
      
      h = (h + hueShift) % 1;
      
      const s = max === 0 ? 0 : (max - min) / max;
      const v = max;
      
      const c = v * s;
      const hp = h * 6;
      const x = c * (1 - Math.abs((hp % 2) - 1));
      
      let r2, g2, b2;
      if (hp < 1) {
        [r2, g2, b2] = [c, x, 0];
      } else if (hp < 2) {
        [r2, g2, b2] = [x, c, 0];
      } else if (hp < 3) {
        [r2, g2, b2] = [0, c, x];
      } else if (hp < 4) {
        [r2, g2, b2] = [0, x, c];
      } else if (hp < 5) {
        [r2, g2, b2] = [x, 0, c];
      } else {
        [r2, g2, b2] = [c, 0, x];
      }
      
      const m = v - c;
      data[i] = Math.round((r2 + m) * 255);
      data[i + 1] = Math.round((g2 + m) * 255);
      data[i + 2] = Math.round((b2 + m) * 255);
    }
  }

  // Apply warmth
  if (params.warmth !== 0) {
    const warmthAmount = params.warmth / 50;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * (1 + warmthAmount * 0.1)));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * (1 - warmthAmount * 0.1)));
    }
  }

  // Apply tint
  if (params.tint !== 0) {
    const tintAmount = params.tint / 50;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * (1 + tintAmount * 0.1)));
    }
  }

  // Apply fade
  if (params.fade !== 0) {
    const fadeAmount = params.fade / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(data[i], 255 * fadeAmount);
      data[i + 1] = Math.max(data[i + 1], 255 * fadeAmount);
      data[i + 2] = Math.max(data[i + 2], 255 * fadeAmount);
    }
  }

  // Apply vignette
  if (params.vignette !== 0) {
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const vignetteNormalized = params.vignette / 100; // Normalize to 0-1
    
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      
      const distX = x - centerX;
      const distY = y - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const vignetteFactor = 1 - (distance / maxDistance) * vignetteNormalized;
      
      data[i] = Math.max(0, data[i] * Math.max(0, vignetteFactor));
      data[i + 1] = Math.max(0, data[i + 1] * Math.max(0, vignetteFactor));
      data[i + 2] = Math.max(0, data[i + 2] * Math.max(0, vignetteFactor));
    }
  }

  return imageData;
};

export function FilterPreviewCamera({ params, onClose }: FilterPreviewCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setLoading(false);
            renderFrame();
          };
        }
      } catch (err) {
        setError('Не удалось получить доступ к камере');
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Apply filter
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const filteredData = applyFilterToImageData(imageData, params);
    ctx.putImageData(filteredData, 0, 0);

    animationRef.current = requestAnimationFrame(renderFrame);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-lg transition"
        >
          <X size={24} className="text-white" />
        </button>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full"></div>
              </div>
              <p className="text-gray-400">Включение камеры...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full pt-[75%] bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover hidden"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <p className="text-center text-gray-300 text-sm">
            Предпросмотр фильтра в реальном времени
          </p>
        </div>
      </div>
    </div>
  );
}
