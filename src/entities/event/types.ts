export type Event = {
  id: string;
  name: string;
  date: string;
  category: string;
  photosPerGuest: number;   // лимит на гостя
  filter: string;           // выбранный фильтр ('warm', 'bw', 'vintage')
  createdAt: string;
};

export type CreateEventDTO = {
  name: string;
  date: string;
  category: string;
  photosPerGuest: number;
  filter: string;
};