import { FilterParams, Filter } from '../filter/types';

export type Event = {
  id: string;
  name: string;
  date: string;
  category: string;
  filter?: string;
  filterId?: string;
  filterParams?: FilterParams;
  filters?: Filter[];
  plan?: string;
  extraPhotos?: number;
  photosPerGuest: number;
  guestCount: number;
  totalPhotos: number;
  usedPhotos: number;
  createdAt: string;
};

export type CreateEventDTO = {
  name: string;
  date: string;
  category: string;
  filter?: string;
  filterId?: string;
  filterParams?: FilterParams;
  filters?: Array<{ id: string; name: string; params: FilterParams }>;
  plan?: string;
  extraPhotos?: number;
  photosPerGuest: number;
  guestCount: number;
};