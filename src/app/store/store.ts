import { configureStore } from '@reduxjs/toolkit';
import eventReducer from '../../features/eventSlice/eventSlice';
import photosReducer from '../../features/photosSlice/photosSlice';
import guestSessionReducer from '../../features/guestSessionSlice/guestSessionSlice';
import userReducer from '../../features/userSlice/userSlice';

export const store = configureStore({
  reducer: {
    event: eventReducer,
    photos: photosReducer,
    guestSession: guestSessionReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;