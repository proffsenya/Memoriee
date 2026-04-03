
import { RootState } from '../../app/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectAllPhotos = (state: RootState) => state.photos.photos;
export const selectPhotosLoading = (state: RootState) => state.photos.loading;

// Мемоизированный селектор для сортировки фото по дате
export const selectPhotosSortedByDate = createSelector(
  [selectAllPhotos],
  (photos) => [...photos].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )
);