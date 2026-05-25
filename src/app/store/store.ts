import { configureStore } from '@reduxjs/toolkit';
import eventReducer from '../../features/eventSlice/eventSlice';
import photosReducer from '../../features/photosSlice/photosSlice';
import guestSessionReducer from '../../features/guestSessionSlice/guestSessionSlice';
import userReducer from '../../features/userSlice/userSlice';
import filtersReducer from '../../features/filtersSlice/filtersSlice';

export const store = configureStore({
  reducer: {
    event: eventReducer,
    photos: photosReducer,
    guestSession: guestSessionReducer,
    user: userReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;