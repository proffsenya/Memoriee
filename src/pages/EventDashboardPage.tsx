import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchEvent, updateEvent, deleteEvent } from '../features/eventSlice/eventSlice';
import QRCode from 'qrcode';
import { Card, Button, Input } from '../shared/ui';
import { useToast } from '../shared/context/ToastContext';
import { X } from 'lucide-react';

const PRICE_PER_PHOTO = 10;

export const EventDashboardPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentEvent, loading, error } = useAppSelector((state) => state.event);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [extraShots, setExtraShots] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleAddShots = () => {
    if (!currentEvent) return;
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!currentEvent) return;
    setUpdating(true);
    const newLimit = currentEvent.photosPerGuest + extraShots;
    const totalCost = extraShots * PRICE_PER_PHOTO * currentEvent.guestCount;
    await dispatch(updateEvent({
      eventId: currentEvent.id,
      updates: { photosPerGuest: newLimit }
    }));
    setUpdating(false);
    setShowPaymentDialog(false);
    showToast(`✅ Лимит увеличен на ${extraShots} фото на каждого гостя. К оплате: ${totalCost} ₽`, 'success');
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    await dispatch(deleteEvent(eventId!));
    navigate('/');
  };

  const handleDeleteEvent = () => {
    setShowDeleteConfirm(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Ошибка: {error}</div>;
  if (!currentEvent) return <div className="p-8 text-center text-gray-400">Событие не найдено</div>;

  const albumUrl = `/album/${eventId}`;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-5 blur-3xl top-20 -left-40"></div>
      </div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <Card>
          {/* Режим просмотра */}
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div>
                  <h1 className="mb-2 text-2xl font-bold text-white">{currentEvent.name}</h1>
                  <p className="text-gray-300">Дата: {new Date(currentEvent.date).toLocaleDateString()}</p>
                  <p className="text-gray-300">Категория: {currentEvent.category}</p>
                  <p className="text-gray-300">Фильтр: {currentEvent.filter === 'warm' ? 'Тёплый' : currentEvent.filter === 'bw' ? 'Ч/Б' : 'Винтаж'}</p>
                  <p className="text-gray-300">Лимит на гостя: {currentEvent.photosPerGuest} фото</p>
                  <p className="text-gray-300">Количество гостей: {currentEvent.guestCount ?? 0}</p>
                  <p className="text-gray-300">Всего фото: {currentEvent.usedPhotos ?? 0} / {currentEvent.totalPhotos ?? (currentEvent.guestCount * currentEvent.photosPerGuest)}</p>
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
              <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                <h3 className="mb-2 font-semibold text-white">Увеличить лимит фото для каждого гостя</h3>
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
                <p className="mt-1 text-sm text-gray-400">Текущий лимит: {currentEvent.photosPerGuest} фото на гостя</p>
              </div>

              {/* QR-код */}
              <div className="text-center">
                <h2 className="mb-2 text-lg font-semibold text-white">QR-код для гостей</h2>
                {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-48 h-48 mx-auto" />}
                <p className="mt-2 text-sm text-gray-400">Гости сканируют и загружают фото</p>
              </div>

              {/* Ссылки */}
              <div className="space-y-2 text-center">
                <a href={albumUrl} target="_blank" className="block text-indigo-400 hover:text-indigo-300 underline">Открыть альбом</a>
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/guest/${eventId}`)}>
                  Скопировать ссылку для гостей
                </Button>
              </div>
            </div>
          ) : (
            // Режим редактирования
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Редактирование события</h2>
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

      {/* Диалог дооплаты */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative max-w-sm p-6 mx-4">
            <button
              onClick={() => setShowPaymentDialog(false)}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-200"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-2xl font-bold text-white">Дооплата за лимит фото</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Дополнительно фото на гостя:</span>
                <span className="font-semibold">{extraShots}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Количество гостей:</span>
                <span className="font-semibold">{currentEvent?.guestCount}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Цена за фото:</span>
                <span className="font-semibold">{PRICE_PER_PHOTO} ₽</span>
              </div>
              <div className="pt-3 border-t border-slate-600">
                <div className="flex justify-between text-lg font-bold text-emerald-400">
                  <span>К оплате:</span>
                  <span>{extraShots * PRICE_PER_PHOTO * (currentEvent?.guestCount || 1)} ₽</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmPayment}
                disabled={updating}
                className="flex-1"
              >
                Оплатить
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative max-w-sm p-6 mx-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-200"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-2xl font-bold text-red-400">Удалить событие?</h2>
            <p className="mb-6 text-gray-300">
              Это действие необратимо! Событие и все загруженные фото будут удалены без возможности восстановления.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmDelete}
                disabled={updating}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Удалить
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};