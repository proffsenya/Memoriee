import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { usePhotoFilter } from '../shared/hooks/usePhotoFilter';
import { useToast } from '../shared/context/ToastContext';
import { FilterParams, Filter } from '../entities/filter/types';
import apiClient from '../shared/api/apiClient';
import { Button, Input } from '../shared/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const GuestCameraPage = () => {
  const { eventId } = useParams();
  const [guestName, setGuestName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [filterParams, setFilterParams] = useState<FilterParams>({
    filterType: 'warm',
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    hue: 0,
    warmth: 0,
    tint: 0,
    fade: 0,
    vignette: 0
  });
  const [filters, setFilters] = useState<Filter[]>([]); // Массив фильтров для плана
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);
  const [eventExists, setEventExists] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const { applyFilter, processing: filterProcessing } = usePhotoFilter(filterParams);
  const { showToast } = useToast();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await apiClient.get(`/guest/event/${eventId}`);
        setEventExists(true);
        
        // Проверяем есть ли массив фильтров (для плана) или один filterParams
        if (res.data.filters && res.data.filters.length > 0) {
          // Это план с несколькими фильтрами
          setFilters(res.data.filters);
          setFilterParams(res.data.filters[0].params);
          setCurrentFilterIndex(0);
        } else if (res.data.filterParams) {
          // Это обычное событие с одним фильтром
          setFilterParams(res.data.filterParams);
          setFilters([]);
        }

        const storedGuestId = localStorage.getItem(`guestId_${eventId}`);
        const storedName = storedGuestId ? localStorage.getItem(`guestName_${eventId}_${storedGuestId}`) : null;
        if (storedGuestId && storedName) {
          setGuestId(storedGuestId);
          setGuestName(storedName);
          setNameSubmitted(true);
          const usageRes = await apiClient.get(`/guest/usage/${eventId}/${storedGuestId}`);
          setRemaining(usageRes.data.remaining);
        } else {
          setRemaining(null);
        }
      } catch {
        setEventExists(false);
      }
    };
    if (eventId) loadEvent();
  }, [eventId]);

  const handleFilterChange = (direction: 'prev' | 'next') => {
    const maxIndex = filters.length - 1;
    let newIndex = currentFilterIndex;
    
    if (direction === 'next') {
      newIndex = currentFilterIndex === maxIndex ? 0 : currentFilterIndex + 1;
    } else {
      newIndex = currentFilterIndex === 0 ? maxIndex : currentFilterIndex - 1;
    }
    
    setCurrentFilterIndex(newIndex);
    setFilterParams(filters[newIndex].params);
  };

  const handleSubmitName = async () => {
    if (!guestName.trim()) {
      showToast('Введите ваше имя', 'error');
      return;
    }
    let newGuestId = localStorage.getItem(`guestId_${eventId}`);
    if (!newGuestId) {
      newGuestId = crypto.randomUUID();
      localStorage.setItem(`guestId_${eventId}`, newGuestId);
    }
    setGuestId(newGuestId);
    localStorage.setItem(`guestName_${eventId}_${newGuestId}`, guestName);
    setNameSubmitted(true);
    try {
      const usageRes = await apiClient.get(`/guest/usage/${eventId}/${newGuestId}`);
      setRemaining(usageRes.data.remaining);
    } catch {
      showToast('Ошибка загрузки лимита', 'error');
    }
  };

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
    // Применяем фильтр
    const filteredBlob = await applyFilter(blob);
    const formData = new FormData();
    formData.append('photo', filteredBlob, 'photo.jpg');
    formData.append('eventId', eventId!);
    formData.append('guestId', guestId);
    formData.append('guestName', guestName);
    setUploadLoading(true);
    try {
      await apiClient.post('/guest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newRemaining = remaining !== null ? remaining - 1 : 0;
      setRemaining(newRemaining);
      if (newRemaining === 0) {
        showToast('🎉 Лимит достигнут! Спасибо за фото!', 'success');
      } else if (newRemaining <= 3) {
        showToast(`✓ Фото загружено! Осталось: ${newRemaining}`, 'success');
      } else {
        showToast('✓ Фото загружено!', 'success');
      }
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

  if (eventExists === null) {
    return <div className="flex items-center justify-center h-screen text-white bg-black">Загрузка...</div>;
  }

  if (!nameSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="w-full max-w-md p-6 bg-slate-800 border border-slate-700 shadow-xl rounded-2xl">
          <h2 className="mb-4 text-2xl font-bold text-center text-white">Представьтесь, пожалуйста</h2>
          <p className="mb-4 text-center text-gray-300">Введите ваше имя и фамилию</p>
          <Input
            placeholder="Иван Иванов"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSubmitName} className="w-full">
            Продолжить
          </Button>
        </div>
      </div>
    );
  }

  if (remaining === null) {
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
      
      {/* Top counter - guest name and remaining photos */}
      <div className="absolute left-0 right-0 top-0 flex justify-between items-start p-4 text-white">
        <div className="text-left">
          <div className="text-sm text-gray-300 uppercase tracking-widest">Гость</div>
          <div className="text-lg font-semibold">{guestName}</div>
        </div>
        <div className="text-right backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-300 uppercase tracking-widest">Осталось</div>
          <div className="text-3xl font-bold">{remaining}</div>
        </div>
      </div>

      {/* Bottom center camera button */}
      <div className="absolute left-0 right-0 flex justify-center gap-4 bottom-8 px-4">
        {/* Left filter button */}
        {filters.length > 1 && (
          <button
            onClick={() => handleFilterChange('prev')}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}

        {/* Center camera button */}
        <button
          onClick={capture}
          disabled={filterProcessing || uploadLoading || remaining === 0}
          className="w-20 h-20 transition border-4 border-white rounded-full shadow-lg bg-white/30 backdrop-blur-md active:scale-95 disabled:opacity-50"
          style={{ boxShadow: '0 0 0 6px rgba(255,255,255,0.3)' }}
        >
          <div className="w-full h-full bg-white rounded-full"></div>
        </button>

        {/* Right filter button */}
        {filters.length > 1 && (
          <button
            onClick={() => handleFilterChange('next')}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        )}
      </div>

      {/* Filter name indicator */}
      {filters.length > 0 && (
        <div className="absolute left-0 right-0 text-center bottom-32">
          <div className="inline-block px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full">
            <p className="text-sm font-semibold text-white">
              {filters[currentFilterIndex]?.name} ({currentFilterIndex + 1} из {filters.length})
            </p>
          </div>
        </div>
      )}

      {/* Bottom left status indicator */}
      <div className="absolute left-4 bottom-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2">
        <div className="text-xs text-gray-300 uppercase tracking-widest">Статус</div>
        <div className="text-sm font-semibold text-white">
          {uploadLoading ? '⏳ Загрузка...' : filterProcessing ? '🎨 Обработка...' : remaining === 0 ? '✓ Лимит достигнут' : '📸 Готово'}
        </div>
      </div>

      {cameraError && (
        <div className="absolute left-0 right-0 py-2 text-sm text-center text-red-400 bottom-28 bg-black/50">
          Ошибка камеры: {cameraError}
        </div>
      )}
    </div>
  );
};