// src/shared/hooks/useCamera.ts
import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestPermission = useCallback(async () => {
    if (isRequesting) return false;
    setIsRequesting(true);
    try {
      // Останавливаем предыдущий поток, если есть
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setError(null);
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      setError('Не удалось получить доступ к камере. Пожалуйста, разрешите доступ и убедитесь, что сайт открыт по HTTPS.');
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [stream, isRequesting]);

  const takePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) {
        reject('Видео не готово');
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Ошибка Canvas');
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Не удалось сделать фото');
      }, 'image/jpeg', 0.9);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return { videoRef, error, requestPermission, takePhoto };
};