import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Photo } from '../../entities/photo/types';
import { mockBackend } from '../../shared/api/mockBackend';

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

// Асинхронный thunk для загрузки фото (создаёт base64 и сохраняет)
export const uploadPhoto = createAsyncThunk(
  'photos/uploadPhoto',
  async ({ eventId, guestId, photoBlob }: { eventId: string; guestId: string; photoBlob: Blob }) => {
    const result = await mockBackend.addPhoto(eventId, guestId, photoBlob);
    return result;
  }
);

// Получение всех фото события
export const fetchPhotos = createAsyncThunk(
  'photos/fetchPhotos',
  async (eventId: string) => {
    return mockBackend.getPhotos(eventId);
  }
);

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    // Удалить все фото ТОЛЬКО для текущего события
    clearAllPhotosForEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      state.photos = state.photos.filter(p => p.eventId !== eventId);
      // Обновляем localStorage
      const allPhotos = JSON.parse(localStorage.getItem('memoriee_photos') || '[]');
      const remaining = allPhotos.filter((p: Photo) => p.eventId !== eventId);
      localStorage.setItem('memoriee_photos', JSON.stringify(remaining));
    },
    // Удалить одно фото по id
    removePhoto: (state, action: PayloadAction<string>) => {
      const photoId = action.payload;
      state.photos = state.photos.filter(photo => photo.id !== photoId);
      const allPhotos = JSON.parse(localStorage.getItem('memoriee_photos') || '[]');
      const updated = allPhotos.filter((p: Photo) => p.id !== photoId);
      localStorage.setItem('memoriee_photos', JSON.stringify(updated));
    },
  },
  extraReducers: (builder) => {
    builder
      // uploadPhoto
      .addCase(uploadPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.photos.push(action.payload);
        }
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload photo';
      })
      // fetchPhotos
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch photos';
      });
  },
});

export const { clearAllPhotosForEvent, removePhoto } = photosSlice.actions;
export default photosSlice.reducer;