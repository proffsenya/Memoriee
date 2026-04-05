export type Event = {
  id: string;
  name: string;
  date: string;
  category: string;
  filter: string;
  photosPerGuest: number;
  guestCount: number;     // добавлено
  totalPhotos: number;    // добавлено
  usedPhotos: number;     // добавлено
  createdAt: string;
};

export type CreateEventDTO = {
  name: string;
  date: string;
  category: string;
  filter: string;
  photosPerGuest: number;
  guestCount: number;
};