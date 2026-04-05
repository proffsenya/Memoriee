import { useState, useEffect } from 'react';
import { mockBackend } from '../../../shared/api/mockBackend';

export const useGuestUpload = (eventId: string, guestId: string) => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRemaining = async () => {
    try {
      const event = mockBackend.getEvent(eventId);
      if (!event) {
        setError('Событие не найдено');
        setRemaining(null);
        return;
      }
      const used = mockBackend.getGuestUsage(eventId, guestId);
      setRemaining(Math.max(0, event.photosPerGuest - used));
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки лимита');
    }
  };

  useEffect(() => {
    if (eventId && guestId) {
      loadRemaining();
    }
  }, [eventId, guestId]);

  const handleCapture = async (photoBlob: Blob) => {
    setLoading(true);
    setError(null);
    try {
      const event = mockBackend.getEvent(eventId);
      if (!event) throw new Error('Событие не найдено');
      const used = mockBackend.getGuestUsage(eventId, guestId);
      if (used >= event.photosPerGuest) throw new Error('Лимит фото исчерпан');
      // Передаём Blob напрямую в mockBackend (он сам сконвертирует в base64)
      await mockBackend.addPhoto(eventId, guestId, photoBlob);
      await loadRemaining();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleCapture, remaining, loading, error, isLimitReached: remaining === 0 };
};