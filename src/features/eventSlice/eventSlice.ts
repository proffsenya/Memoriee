import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Event, CreateEventDTO } from '../../entities/event/types';
import { mockBackend } from '../../shared/api/mockBackend';

interface EventState {
  currentEvent: Event | null;
  loading: boolean;
  events: Event[]
  error: string | null;
}

const initialState: EventState = {
  currentEvent: null,
  loading: false,
  events: [],
  error: null,
};

// Асинхронный thunk для создания события
export const createEvent = createAsyncThunk(
  'event/createEvent',
  async (dto: CreateEventDTO) => {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBackend.createEvent(dto);
  }
);

// Асинхронный thunk для получения события
export const fetchEvent = createAsyncThunk(
  'event/fetchEvent',
  async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const event = mockBackend.getEvent(id);
    if (!event) throw new Error('Event not found');
    return event;
  }
);

export const fetchUserEvents = createAsyncThunk('event/fetchUserEvents', async () => {
  const stored = localStorage.getItem('memoriee_events');
  return stored ? JSON.parse(stored) : [];
});

export const deleteEvent = createAsyncThunk(
  'event/deleteEvent',
  async (eventId: string) => {
    // Удаляем событие
    const events = JSON.parse(localStorage.getItem('memoriee_events') || '[]');
    const updatedEvents = events.filter((e: any) => e.id !== eventId);
    localStorage.setItem('memoriee_events', JSON.stringify(updatedEvents));
    // Удаляем все фото этого события
    const photos = JSON.parse(localStorage.getItem('memoriee_photos') || '[]');
    const remainingPhotos = photos.filter((p: any) => p.eventId !== eventId);
    localStorage.setItem('memoriee_photos', JSON.stringify(remainingPhotos));
    // Удаляем usage гостей
    const usage = JSON.parse(localStorage.getItem('memoriee_guest_usage') || '{}');
    const newUsage = Object.fromEntries(
      Object.entries(usage).filter(([key]) => !key.startsWith(eventId))
    );
    localStorage.setItem('memoriee_guest_usage', JSON.stringify(newUsage));
    return eventId;
  }
);

export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) => {
    const events = JSON.parse(localStorage.getItem('memoriee_events') || '[]');
    const index = events.findIndex((e: Event) => e.id === eventId);
    if (index === -1) throw new Error('Event not found');
    const updatedEvent = { ...events[index], ...updates };
    events[index] = updatedEvent;
    localStorage.setItem('memoriee_events', JSON.stringify(events));
    return updatedEvent;
  }
);



const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearEvent: (state) => {
      state.currentEvent = null;
      state.error = null;
    },
    updateEventName: (state, action: PayloadAction<string>) => {
      if (state.currentEvent) {
        state.currentEvent.name = action.payload;
      }
    },
  },
  
extraReducers: (builder) => {
  builder
    // createEvent
    .addCase(createEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateEvent.fulfilled, (state, action) => {
    state.currentEvent = action.payload;
    state.events = state.events.map(e => e.id === action.payload.id ? action.payload : e);
    })
    .addCase(createEvent.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEvent = action.payload;
      state.events = [action.payload, ...state.events];
      localStorage.setItem('memoriee_events', JSON.stringify(state.events));
    })
    .addCase(createEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create event';
    })
    
    // fetchEvent
    .addCase(fetchEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchEvent.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEvent = action.payload;
    })
    .addCase(fetchEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch event';
    })
    // fetchUserEvents
    .addCase(fetchUserEvents.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchUserEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
    })
    .addCase(deleteEvent.fulfilled, (state, action) => {
      state.events = state.events.filter(e => e.id !== action.payload);
      if (state.currentEvent?.id === action.payload) state.currentEvent = null;
    })
    .addCase(fetchUserEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch user events';
    });
}
});

export const { clearEvent, updateEventName } = eventSlice.actions;
export default eventSlice.reducer;