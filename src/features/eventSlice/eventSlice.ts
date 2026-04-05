import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../shared/api/apiClient';
import { Event, CreateEventDTO } from '../../entities/event/types';

interface EventState {
  currentEvent: Event | null;
  events: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  currentEvent: null,
  events: [],
  loading: false,
  error: null,
};

export const createEvent = createAsyncThunk(
  'event/createEvent',
  async (dto: { name: string; date: string; category: string; filter: string; photosPerGuest: number; guestCount: number }) => {
    const res = await apiClient.post('/events', dto);
    return res.data;
  }
);

export const fetchEvent = createAsyncThunk('event/fetchEvent', async (id: string) => {
  const res = await apiClient.get(`/events/${id}`);
  return res.data;
});

export const fetchUserEvents = createAsyncThunk('event/fetchUserEvents', async () => {
  const res = await apiClient.get('/events');
  return res.data;
});

export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) => {
    const res = await apiClient.put(`/events/${eventId}`, updates);
    return res.data;
  }
);

export const deleteEvent = createAsyncThunk('event/deleteEvent', async (eventId: string) => {
  await apiClient.delete(`/events/${eventId}`);
  return eventId;
});

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearEvent: (state) => { state.currentEvent = null; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
        state.events = [action.payload, ...state.events];
      })
      .addCase(createEvent.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(fetchEvent.pending, (state) => { state.loading = true; })
      .addCase(fetchEvent.fulfilled, (state, action) => { state.loading = false; state.currentEvent = action.payload; })
      .addCase(fetchEvent.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(fetchUserEvents.pending, (state) => { state.loading = true; })
      .addCase(fetchUserEvents.fulfilled, (state, action) => { state.loading = false; state.events = action.payload; })
      .addCase(fetchUserEvents.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.currentEvent = action.payload;
        state.events = state.events.map(e => e.id === action.payload.id ? action.payload : e);
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e.id !== action.payload);
        if (state.currentEvent?.id === action.payload) state.currentEvent = null;
      });
  },
});

export const { clearEvent } = eventSlice.actions;
export default eventSlice.reducer;