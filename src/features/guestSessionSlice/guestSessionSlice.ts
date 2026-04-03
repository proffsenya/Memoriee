import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GuestSession } from '../../entities/guestSession/types';
import { InMemoryLimiter } from '../../shared/lib/limiter/InMemoryLimiter';
import { MAX_PHOTOS_PER_GUEST } from '../../shared/config';

interface GuestSessionState {
  currentSession: GuestSession | null;
  remainingShots: number;
  isLimitReached: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: GuestSessionState = {
  currentSession: null,
  remainingShots: MAX_PHOTOS_PER_GUEST,
  isLimitReached: false,
  loading: false,
  error: null,
};

export const initGuestSession = createAsyncThunk(
  'guestSession/init',
  async ({ eventId, guestId }: { eventId: string; guestId: string }) => {
    const limiter = new InMemoryLimiter(MAX_PHOTOS_PER_GUEST);
    const remaining = await limiter.getRemaining(eventId, guestId);
    return { eventId, guestId, remainingShots: remaining, limiter };
  }
);

export const usePhotoFrame = createAsyncThunk(
  'guestSession/useFrame',
  async ({ eventId, guestId }: { eventId: string; guestId: string }) => {
    const limiter = new InMemoryLimiter(MAX_PHOTOS_PER_GUEST);
    const remaining = await limiter.getRemaining(eventId, guestId);
    if (remaining <= 0) throw new Error('Лимит фото исчерпан');
    await limiter.increment(eventId, guestId);
    const newRemaining = await limiter.getRemaining(eventId, guestId);
    return { remainingShots: newRemaining, isLimitReached: newRemaining === 0 };
  }
);

const guestSessionSlice = createSlice({
  name: 'guestSession',
  initialState,
  reducers: {
    resetSession: (state) => {
      state.currentSession = null;
      state.remainingShots = MAX_PHOTOS_PER_GUEST;
      state.isLimitReached = false;
    },
    decrementRemaining: (state) => {
      if (state.remainingShots > 0) {
        state.remainingShots--;
        state.isLimitReached = state.remainingShots === 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initGuestSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initGuestSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = {
          eventId: action.payload.eventId,
          guestId: action.payload.guestId,
          remainingShots: action.payload.remainingShots,
        };
        state.remainingShots = action.payload.remainingShots;
        state.isLimitReached = action.payload.remainingShots === 0;
      })
      .addCase(initGuestSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to init session';
      })
      .addCase(usePhotoFrame.pending, (state) => {
        state.loading = true;
      })
      .addCase(usePhotoFrame.fulfilled, (state, action) => {
        state.loading = false;
        state.remainingShots = action.payload.remainingShots;
        state.isLimitReached = action.payload.isLimitReached;
        if (state.currentSession) {
          state.currentSession.remainingShots = action.payload.remainingShots;
        }
      })
      .addCase(usePhotoFrame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

export const { resetSession, decrementRemaining } = guestSessionSlice.actions;
export default guestSessionSlice.reducer;