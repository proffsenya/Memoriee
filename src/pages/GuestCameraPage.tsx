// src/pages/GuestCameraPage.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { usePhotoFilter } from '../shared/hooks/usePhotoFilter';
import { useGuestUpload } from '../features/photoUpload/hooks/useGuestUpload';
import { mockBackend } from '../shared/api/mockBackend';
import { useToast } from '../shared/context/ToastContext';

export const GuestCameraPage = () => {
  const { eventId } = useParams();
  const guestId = localStorage.getItem('guestId') || crypto.randomUUID();
  localStorage.setItem('guestId', guestId);

  const webcamRef = useRef<Webcam>(null);
  const { showToast } = useToast();
  const [filterName, setFilterName] = useState<string>('warm');
  const [eventExists, setEventExists] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { applyFilter, processing: filterProcessing } = usePhotoFilter(filterName);
  const { handleCapture, remaining, loading: uploadLoading, error: uploadError, isLimitReached } = useGuestUpload(eventId!, guestId);

  useEffect(() => {
    if (eventId) {
      const ev = mockBackend.getEvent(eventId);
      setEventExists(!!ev);
      if (ev) setFilterName(ev.filter);
    } else {
      setEventExists(false);
    }
  }, [eventId]);

  const capture = async () => {
    if (isLimitReached) {
      showToast('Лимит фото исчерпан', 'error');
      return;
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      showToast('Не удалось сделать фото', 'error');
      return;
    }
    const blob = await (await fetch(imageSrc)).blob();
    try {
      const filteredBlob = await applyFilter(blob);
      await handleCapture(filteredBlob);
      showToast('Фото загружено!', 'success');
    } catch (err) {
      showToast('Ошибка: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  if (eventExists === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center text-white bg-black">
        <p className="mb-4 text-lg text-red-500">Событие не найдено</p>
        <p>Проверьте ссылку или обратитесь к организатору</p>
      </div>
    );
  }

  if (eventExists === null || remaining === null) {
    return <div className="flex items-center justify-center h-screen text-white bg-black">Загрузка...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Видео на весь экран */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'environment' }}
        onUserMediaError={(err) => {
          const errorMessage = typeof err === 'string' ? err : err.message;
          setCameraError(errorMessage);
        }}
        className="absolute inset-0 object-cover w-full h-full"
      />

      {/* Счётчик оставшихся фото (вверху) */}
      <div className="absolute left-0 right-0 text-center top-8">
        <div className="inline-block px-4 py-2 text-lg font-medium text-white rounded-full bg-black/50 backdrop-blur-md">
          Осталось фото: <span className="text-2xl font-bold">{remaining}</span>
        </div>
      </div>

      {/* Круглая кнопка спуска */}
      <div className="absolute left-0 right-0 flex justify-center bottom-8">
        <button
          onClick={capture}
          disabled={filterProcessing || uploadLoading || isLimitReached}
          className={`w-20 h-20 rounded-full border-4 border-white bg-white/30 backdrop-blur-md shadow-lg transition active:scale-95 ${
            (filterProcessing || uploadLoading || isLimitReached) ? 'opacity-50' : ''
          }`}
          style={{
            boxShadow: '0 0 0 6px rgba(255,255,255,0.3)',
          }}
        >
          <div className="w-full h-full bg-white rounded-full"></div>
        </button>
      </div>

      {/* Сообщения об ошибках или лимите */}
      {cameraError && (
        <div className="absolute left-0 right-0 py-2 text-sm text-center text-red-400 bottom-28 bg-black/50">
          Ошибка камеры: {cameraError}
        </div>
      )}
      {uploadError && (
        <div className="absolute left-0 right-0 py-2 text-sm text-center text-red-400 bottom-28 bg-black/50">
          {uploadError}
        </div>
      )}
      {isLimitReached && (
        <div className="absolute left-0 right-0 py-2 text-sm text-center text-yellow-400 bottom-28 bg-black/50">
          Лимит фото исчерпан. Спасибо!
        </div>
      )}
    </div>
  );
};