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

// Исправленный thunk – принимает guestId
export const uploadPhoto = createAsyncThunk(
  'photos/uploadPhoto',
  async ({ eventId, guestId, photoBlob }: { eventId: string; guestId: string; photoBlob: Blob }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const url = URL.createObjectURL(photoBlob);
    const result = mockBackend.addPhoto(eventId, guestId, url);
    if (!result) throw new Error('Failed to upload photo');
    return result;
  }
);

export const fetchPhotos = createAsyncThunk(
  'photos/fetchPhotos',
  async (eventId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBackend.getPhotos(eventId);
  }
);

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearPhotos: (state) => {
      state.photos = [];
    },
    removePhoto: (state, action: PayloadAction<string>) => {
      state.photos = state.photos.filter(photo => photo.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { clearPhotos, removePhoto } = photosSlice.actions;
export default photosSlice.reducer;