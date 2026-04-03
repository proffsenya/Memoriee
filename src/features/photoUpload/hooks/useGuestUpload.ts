import { useState, useEffect } from 'react';
import { mockBackend } from '../../../shared/api/mockBackend';

export const useGuestUpload = (eventId: string, guestId: string) => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRemaining = async () => {
    const event = mockBackend.getEvent(eventId);
    if (!event) return;
    const used = mockBackend.getGuestUsage(eventId, guestId);
    const rem = Math.max(0, event.photosPerGuest - used);
    setRemaining(rem);
  };

  useEffect(() => {
    loadRemaining();
  }, [eventId, guestId]);

  const handleCapture = async (photoBlob: Blob) => {
    setLoading(true);
    try {
      const event = mockBackend.getEvent(eventId);
      if (!event) throw new Error('Событие не найдено');
      const used = mockBackend.getGuestUsage(eventId, guestId);
      if (used >= event.photosPerGuest) {
        throw new Error('Лимит фото исчерпан');
      }
      const url = URL.createObjectURL(photoBlob);
      mockBackend.addPhoto(eventId, guestId, url);
      await loadRemaining();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleCapture, remaining, loading, isLimitReached: remaining === 0 };
};