import { Event, CreateEventDTO } from '../../entities/event/types';
import { Photo } from '../../entities/photo/types';

const EVENTS_KEY = 'memoriee_events';
const PHOTOS_KEY = 'memoriee_photos';
const GUEST_USAGE_KEY = 'memoriee_guest_usage'; // { "eventId:guestId": count }

export const mockBackend = {
  createEvent: (dto: CreateEventDTO): Event => {
    const events: Event[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    const newEvent: Event = {
    id: crypto.randomUUID(),
    name: dto.name,
    date: dto.date,
    category: dto.category,
    photosPerGuest: dto.photosPerGuest,
    filter: dto.filter,
    createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return newEvent;
  },
  getEvent: (id: string): Event | null => {
    const events: Event[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    return events.find(e => e.id === id) || null;
  },
addPhoto: async (eventId: string, guestId: string, photoBlob: Blob): Promise<Photo> => {
  const event = mockBackend.getEvent(eventId);
  if (!event) throw new Error('Event not found');
  const usageKey = `${eventId}:${guestId}`;
  const usage = JSON.parse(localStorage.getItem(GUEST_USAGE_KEY) || '{}');
  const currentCount = usage[usageKey] || 0;
  if (currentCount >= event.photosPerGuest) {
    throw new Error('Лимит фото для этого гостя исчерпан');
  }
  // Конвертируем Blob в base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(photoBlob);
  });
  const photos: Photo[] = JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]');
  const newPhoto: Photo = {
    id: crypto.randomUUID(),
    eventId,
    url: base64,
    uploadedAt: new Date().toISOString(),
  };
  photos.push(newPhoto);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  usage[usageKey] = currentCount + 1;
  localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
  return newPhoto;
},
  getPhotos: (eventId: string): Photo[] => {
    const photos: Photo[] = JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]');
    return photos.filter(p => p.eventId === eventId);
  },
  getGuestUsage: (eventId: string, guestId: string): number => {
    const usage = JSON.parse(localStorage.getItem(GUEST_USAGE_KEY) || '{}');
    return usage[`${eventId}:${guestId}`] || 0;
  }
};