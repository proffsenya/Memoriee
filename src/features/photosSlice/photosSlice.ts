import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../shared/api/apiClient';
import { Photo } from '../../entities/photo/types';

interface PhotosState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
}

const initialState: PhotosState = {
  photos: [],
  loading: false,
  error: null,
};

export const fetchPhotos = createAsyncThunk('photos/fetchPhotos', async (eventId: string) => {
  const res = await apiClient.get(`/photos/${eventId}`);
  return res.data;
});

export const deletePhoto = createAsyncThunk('photos/deletePhoto', async (photoId: string) => {
  await apiClient.delete(`/photos/${photoId}`);
  return photoId;
});

export const deleteAllPhotos = createAsyncThunk('photos/deleteAllPhotos', async (eventId: string) => {
  await apiClient.delete(`/photos/all/${eventId}`);
  return eventId;
});

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearPhotos: (state) => { state.photos = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPhotos.fulfilled, (state, action) => { state.loading = false; state.photos = action.payload; })
      .addCase(fetchPhotos.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter(p => p.id !== action.payload);
      })
      .addCase(deleteAllPhotos.fulfilled, (state) => {
        state.photos = [];
      });
  },
});

export const { clearPhotos } = photosSlice.actions;
export default photosSlice.reducer;