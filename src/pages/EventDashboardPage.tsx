import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchEvent } from '../features/eventSlice/eventSlice';
import QRCode from 'qrcode';
import { Card, Button } from '../shared/ui';

export const EventDashboardPage = () => {
  const { eventId } = useParams();
  const dispatch = useAppDispatch();
  const { currentEvent, loading, error } = useAppSelector((state) => state.event);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (eventId && !currentEvent) {
      dispatch(fetchEvent(eventId));
    }
  }, [eventId, currentEvent, dispatch]);

  useEffect(() => {
    if (eventId) {
      const guestUrl = `${window.location.origin}/guest/${eventId}`;
      QRCode.toDataURL(guestUrl).then(setQrDataUrl);
    }
  }, [eventId]);

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Ошибка: {error}</div>;
  if (!currentEvent) return <div className="p-8 text-center">Событие не найдено</div>;

  const albumUrl = `/album/${eventId}`;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <Card className="max-w-2xl mx-auto">
        <h1 className="mb-4 text-2xl font-bold">{currentEvent.name}</h1>
        <p className="mb-6 text-gray-600">Дата: {new Date(currentEvent.date).toLocaleDateString()}</p>
        <p>Категория: {currentEvent.category}</p>
        <p>Лимит на гостя: {currentEvent.photosPerGuest} фото</p>
        <p>Фильтр для гостей: {currentEvent.filter === 'warm' ? 'Теплый' : currentEvent.filter === 'bw' ? 'Черно-белый' : 'Винтаж'}</p>
        <p>Лимит на гостя: {currentEvent.photosPerGuest} фото</p>
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">QR-код для гостей</h2>
          {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-48 h-48 mx-auto" />}
          <p className="mt-2 text-sm text-gray-500">Гости сканируют и загружают фото</p>
        </div>
        
        <div className="space-y-2 text-center">
          <a href={albumUrl} target="_blank" className="block text-blue-600 underline">
            Открыть альбом
          </a>
          <Button
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/guest/${eventId}`)}
          >
            Скопировать ссылку для гостей
          </Button>
        </div>
      </Card>
    </div>
  );
};