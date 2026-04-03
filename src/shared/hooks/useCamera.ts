import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Нет доступа к камере');
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    const play = async () => {
      try {
        await video.play();
        setIsCameraReady(true);
      } catch (e) {
        console.error("play error", e);
      }
    };

    video.onloadedmetadata = play;

    play();

  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const takePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;

      if (!video || video.videoWidth === 0) {
        reject("video not ready");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("canvas error");
        return;
      }

      ctx.drawImage(video, 0, 0);

      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject("blob error");
      }, "image/jpeg", 0.95);
    });
  }, []);

  return {
    videoRef,
    startCamera,
    takePhoto,
    error,
    isCameraReady
  };
};