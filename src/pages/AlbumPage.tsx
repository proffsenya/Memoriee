import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchPhotos } from '../features/photosSlice/photosSlice';
import { ImageGrid, Button } from '../shared/ui';

export const AlbumPage = () => {
  const { eventId } = useParams();
  const dispatch = useAppDispatch();
  const { photos, loading } = useAppSelector((state) => state.photos);

  useEffect(() => {
    if (eventId) dispatch(fetchPhotos(eventId));
  }, [eventId, dispatch]);

  if (loading) return <div className="py-12 text-center">Загрузка фото...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Альбом</h1>
        {photos.length > 0 && (
          <Button variant="secondary">Скачать всё ({photos.length})</Button>
        )}
      </div>
      <ImageGrid photos={photos} />
    </div>
  );
};