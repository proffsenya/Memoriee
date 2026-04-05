import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { usePhotoFilter } from '../shared/hooks/usePhotoFilter';
import { useToast } from '../shared/context/ToastContext';
import apiClient from '../shared/api/apiClient';

export const GuestCameraPage = () => {
  const { eventId } = useParams();
  const guestId = localStorage.getItem('guestId') || crypto.randomUUID();
  localStorage.setItem('guestId', guestId);

  const webcamRef = useRef<Webcam>(null);
  const [filterName, setFilterName] = useState<string>('warm');
  const [eventExists, setEventExists] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { applyFilter, processing: filterProcessing } = usePhotoFilter(filterName);
  const { showToast } = useToast();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await apiClient.get(`/guest/event/${eventId}`);
        setEventExists(true);
        setFilterName(res.data.filter);
        const usageRes = await apiClient.get(`/guest/usage/${eventId}/${guestId}`);
        setRemaining(usageRes.data.remaining);
      } catch {
        setEventExists(false);
      }
    };
    if (eventId) loadEvent();
  }, [eventId, guestId]);

  const capture = async () => {
    if (remaining === 0) {
      showToast('Лимит фото исчерпан', 'error');
      return;
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      showToast('Не удалось сделать фото', 'error');
      return;
    }
    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append('photo', blob, 'photo.jpg');
    formData.append('eventId', eventId!);
    formData.append('guestId', guestId);
    setUploadLoading(true);
    try {
      const res = await apiClient.post('/guest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRemaining(prev => (prev !== null ? prev - 1 : null));
      showToast('Фото загружено!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Ошибка загрузки', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  if (eventExists === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center text-white bg-black">
        <p className="mb-4 text-lg text-red-500">Событие не найдено</p>
      </div>
    );
  }
  if (eventExists === null || remaining === null) {
    return <div className="flex items-center justify-center h-screen text-white bg-black">Загрузка...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'environment' }}
        onUserMediaError={(err) => setCameraError(typeof err === 'string' ? err : err.message)}
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div className="absolute left-0 right-0 text-center top-8">
        <div className="inline-block px-4 py-2 text-lg font-medium text-white rounded-full bg-black/50 backdrop-blur-md">
          Осталось фото: <span className="text-2xl font-bold">{remaining}</span>
        </div>
      </div>
      <div className="absolute left-0 right-0 flex justify-center bottom-8">
        <button
          onClick={capture}
          disabled={filterProcessing || uploadLoading || remaining === 0}
          className="w-20 h-20 transition border-4 border-white rounded-full shadow-lg bg-white/30 backdrop-blur-md active:scale-95"
          style={{ boxShadow: '0 0 0 6px rgba(255,255,255,0.3)' }}
        >
          <div className="w-full h-full bg-white rounded-full"></div>
        </button>
      </div>
      {cameraError && (
        <div className="absolute left-0 right-0 py-2 text-sm text-center text-red-400 bottom-28 bg-black/50">
          Ошибка камеры: {cameraError}
        </div>
      )}
    </div>
  );
};