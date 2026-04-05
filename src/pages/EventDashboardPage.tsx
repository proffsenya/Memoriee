import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchEvent, updateEvent, deleteEvent } from '../features/eventSlice/eventSlice';
import QRCode from 'qrcode';
import { Card, Button, Input } from '../shared/ui';

export const EventDashboardPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentEvent, loading, error } = useAppSelector((state) => state.event);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [extraShots, setExtraShots] = useState(1);
  const [updating, setUpdating] = useState(false);

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

  const handleUpdateEvent = async () => {
    if (!currentEvent) return;
    setUpdating(true);
    await dispatch(updateEvent({
      eventId: currentEvent.id,
      updates: { name: editName, date: editDate }
    }));
    setIsEditing(false);
    setUpdating(false);
  };

  const handleAddShots = async () => {
    if (!currentEvent) return;
    setUpdating(true);
    const newLimit = currentEvent.photosPerGuest + extraShots;
    await dispatch(updateEvent({
      eventId: currentEvent.id,
      updates: { photosPerGuest: newLimit }
    }));
    setUpdating(false);
    alert(`Лимит увеличен на ${extraShots} фото. Теперь каждый гость может загрузить ${newLimit} фото.`);
  };

  const handleDeleteEvent = async () => {
    if (confirm('Вы уверены? Удаление мероприятия удалит все фото без возможности восстановления.')) {
      await dispatch(deleteEvent(eventId!));
      navigate('/');
    }
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Ошибка: {error}</div>;
  if (!currentEvent) return <div className="p-8 text-center">Событие не найдено</div>;

  const albumUrl = `/album/${eventId}`;

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <Card className="max-w-2xl mx-auto">
        {/* Режим просмотра */}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <h1 className="mb-2 text-2xl font-bold">{currentEvent.name}</h1>
                <p className="text-gray-600">Дата: {new Date(currentEvent.date).toLocaleDateString()}</p>
                <p className="text-gray-600">Категория: {currentEvent.category}</p>
                <p className="text-gray-600">Фильтр: {currentEvent.filter === 'warm' ? 'Тёплый' : currentEvent.filter === 'bw' ? 'Ч/Б' : 'Винтаж'}</p>
                <p className="text-gray-600">Лимит на гостя: {currentEvent.photosPerGuest} фото</p>
                <p className="text-gray-600">Количество гостей: {currentEvent.guestCount ?? 0}</p>
                <p className="text-gray-600">Всего фото: {currentEvent.usedPhotos ?? 0} / {currentEvent.totalPhotos ?? (currentEvent.guestCount * currentEvent.photosPerGuest)}</p>
              </div>
              <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto">
                <Button variant="secondary" onClick={() => {
                  setEditName(currentEvent.name);
                  setEditDate(currentEvent.date);
                  setIsEditing(true);
                }}>Редактировать</Button>
                <Button variant="secondary" onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">Удалить событие</Button>
              </div>
            </div>

            {/* Блок докупки лимита */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="mb-2 font-semibold">Увеличить лимит фото для каждого гостя</h3>
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={extraShots}
                  onChange={(e) => setExtraShots(Number(e.target.value))}
                  className="w-24"
                />
                <Button onClick={handleAddShots} disabled={updating}>Докупить лимит</Button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Текущий лимит: {currentEvent.photosPerGuest} фото на гостя</p>
            </div>

            {/* QR-код */}
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold">QR-код для гостей</h2>
              {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-48 h-48 mx-auto" />}
              <p className="mt-2 text-sm text-gray-500">Гости сканируют и загружают фото</p>
            </div>

            {/* Ссылки */}
            <div className="space-y-2 text-center">
              <a href={albumUrl} target="_blank" className="block text-blue-600 underline">Открыть альбом</a>
              <Button variant="secondary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/guest/${eventId}`)}>
                Скопировать ссылку для гостей
              </Button>
            </div>
          </div>
        ) : (
          // Режим редактирования
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Редактирование события</h2>
            <Input
              label="Название"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              type="date"
              label="Дата"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleUpdateEvent} disabled={updating}>Сохранить</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Отмена</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};