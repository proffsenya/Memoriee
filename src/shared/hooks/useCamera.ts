import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setIsCameraReady(false);
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Не вызываем play() автоматически, только подключаем поток
        setIsCameraReady(true);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось получить доступ к камере. Убедитесь, что сайт открыт по HTTPS, и разрешите доступ.');
      setIsCameraReady(false);
    }
  }, [stream]);

  const playVideo = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
    } catch (err) {
      console.error('Video play failed:', err);
      setError('Не удалось запустить видео. Нажмите ещё раз.');
      throw err;
    }
  }, []);

  const takePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState !== 4 || video.videoWidth === 0) {
        reject('Видео не активно. Нажмите "Запустить видео" и убедитесь, что картинка появилась.');
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Ошибка canvas');
        return;
      }
      ctx.drawImage(video, 0, 0);
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

  return { videoRef, error, startCamera, playVideo, takePhoto, isCameraReady };
};