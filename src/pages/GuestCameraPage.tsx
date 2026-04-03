// src/pages/GuestCameraPage.tsx
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
  const [cameraStarted, setCameraStarted] = useState(false);
  const { videoRef, requestPermission, takePhoto, error: cameraError } = useCamera();
  const { applyFilter, processing: filterProcessing } = usePhotoFilter(filterName);
  const { handleCapture, remaining, loading, isLimitReached } = useGuestUpload(eventId!, guestId);

  // Загружаем фильтр события
  useEffect(() => {
    const loadEvent = async () => {
      if (eventId) {
        const event = mockBackend.getEvent(eventId);
        if (event) setFilterName(event.filter);
      }
    };
    loadEvent();
  }, [eventId]);

  const startCamera = async () => {
    const success = await requestPermission();
    if (success) setCameraStarted(true);
  };

  const onCapture = async () => {
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
      alert('Ошибка: ' + (err as Error).message);
    }
  };

  // Если камера ещё не запущена – показываем кнопку включения
  if (!cameraStarted && !cameraError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
        <Button onClick={startCamera} className="px-6 py-3 text-lg">
          Включить камеру
        </Button>
        <p className="mt-4 text-sm text-center text-gray-400">
          Потребуется разрешить доступ к камере
        </p>
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      <div className="mt-6 text-center">
        <div className="mb-4 text-white">
          Осталось фото: <span className="text-2xl font-bold">{remaining ?? '...'}</span>
        </div>
        <Button
          onClick={onCapture}
          disabled={filterProcessing || loading || isLimitReached}
        >
          {filterProcessing
            ? 'Обработка...'
            : loading
            ? 'Загрузка...'
            : 'Сделать фото'}
        </Button>
        {isLimitReached && (
          <p className="mt-4 text-yellow-400">Лимит фото исчерпан. Спасибо!</p>
        )}
      </div>
    </div>
  );
};