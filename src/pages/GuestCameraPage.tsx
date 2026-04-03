import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCamera } from '../shared/hooks/useCamera';
import { usePhotoFilter } from '../shared/hooks/usePhotoFilter';
import { useGuestUpload } from '../features/photoUpload/hooks/useGuestUpload';
import { Button } from '../shared/ui';
import { mockBackend } from '../shared/api/mockBackend';

export const GuestCameraPage = () => {
  const { eventId } = useParams();
  const guestId = localStorage.getItem('guestId') || crypto.randomUUID();
  localStorage.setItem('guestId', guestId);

  const [filterName, setFilterName] = useState<string>('warm');
  const [eventExists, setEventExists] = useState<boolean | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const { videoRef, error: cameraError, startCamera, playVideo, takePhoto, isCameraReady } = useCamera();
  const { applyFilter } = usePhotoFilter(filterName);
  const { handleCapture, remaining, isLimitReached } = useGuestUpload(eventId!, guestId);

  useEffect(() => {
    if (eventId) {
      const ev = mockBackend.getEvent(eventId);
      setEventExists(!!ev);
      if (ev) setFilterName(ev.filter);
    } else {
      setEventExists(false);
    }
  }, [eventId]);

  // Когда камера получила поток, показываем кнопку "Запустить видео"
  useEffect(() => {
    if (isCameraReady) {
      setShowPlayButton(true);
    }
  }, [isCameraReady]);

  const handlePlayVideo = async () => {
    await playVideo();
    setShowPlayButton(false); // убираем кнопку после успешного запуска
  };

  if (eventExists === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center text-white bg-black">
        <p className="mb-4 text-lg text-red-500">Событие не найдено</p>
        <p>Проверьте ссылку или обратитесь к организатору</p>
      </div>
    );
  }

  if (eventExists === null || remaining === null) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-black">Загрузка...</div>;
  }

  // Этап 1: включаем камеру (запрос разрешения)
  if (!isCameraReady && !cameraError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
        <Button onClick={startCamera} className="px-6 py-3 text-lg">
          Включить камеру
        </Button>
        <p className="mt-4 text-sm text-center text-gray-400">
          Разрешите доступ к камере для создания фото
        </p>
      </div>
    );
  }

  // Этап 2: камера подключена, но видео не запущено – показываем кнопку "Запустить видео"
  if (showPlayButton) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-md rounded-lg"
        />
        <Button onClick={handlePlayVideo} className="px-6 py-3 mt-4 text-lg">
          Запустить видео
        </Button>
        <p className="mt-2 text-sm text-gray-400">Нажмите, чтобы начать показ</p>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black">
        <p className="mb-4 text-red-500">{cameraError}</p>
        <Button onClick={startCamera}>Попробовать снова</Button>
      </div>
    );
  }

  // Этап 3: видео запущено – интерфейс съёмки
  return (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
    
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full max-w-md rounded-lg shadow-lg"
    />

    {showPlayButton && (
      <Button onClick={handlePlayVideo} className="px-6 py-3 mt-4 text-lg">
        Запустить видео
      </Button>
    )}

    {!showPlayButton && (
      <div className="mt-6 text-center">
        <div className="mb-4 text-white">
          Осталось фото: <span className="text-2xl font-bold">{remaining}</span>
        </div>

        <Button
          onClick={async () => {
            if (isLimitReached) {
              alert('Лимит фото исчерпан');
              return;
            }

            try {
              const rawBlob = await takePhoto();
              const filteredBlob = await applyFilter(rawBlob);
              await handleCapture(filteredBlob);
              alert('Фото загружено!');
            } catch (err) {
              alert('Ошибка: ' + err);
            }
          }}
        >
          Сделать фото
        </Button>
      </div>
    )}
  </div>
);
};