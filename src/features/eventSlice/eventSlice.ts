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
    .addCase(fetchUserEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch user events';
    });
}
});

export const { clearEvent, updateEventName } = eventSlice.actions;
export default eventSlice.reducer;