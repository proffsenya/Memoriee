import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchPhotos, removePhoto, clearAllPhotosForEvent } from '../features/photosSlice/photosSlice';
import { Button } from '../shared/ui';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const AlbumPage = () => {
  const { eventId } = useParams();
  const dispatch = useAppDispatch();
  const { photos, loading } = useAppSelector((state) => state.photos);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (eventId) dispatch(fetchPhotos(eventId));
  }, [eventId, dispatch]);

  const handleSelectPhoto = (id: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedPhotos(newSelected);
    setSelectAll(newSelected.size === photos.length);
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedPhotos(new Set());
    else setSelectedPhotos(new Set(photos.map(p => p.id)));
    setSelectAll(!selectAll);
  };

  const downloadPhotos = async (photoIds: Set<string>) => {
    const photosToDownload = photos.filter(p => photoIds.has(p.id));
    if (photosToDownload.length === 0) return;
    const zip = new JSZip();
    for (const photo of photosToDownload) {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      zip.file(`${photo.id}.jpg`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `album_${eventId}.zip`);
  };

  const handleDownloadSelected = () => {
    if (selectedPhotos.size === 0) return alert('Выберите фото');
    downloadPhotos(selectedPhotos);
  };

  const handleDownloadAll = () => downloadPhotos(new Set(photos.map(p => p.id)));

  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) return alert('Выберите фото');
    if (confirm(`Удалить ${selectedPhotos.size} фото?`)) {
      for (const id of selectedPhotos) await dispatch(removePhoto(id));
      setSelectedPhotos(new Set());
      setSelectAll(false);
      dispatch(fetchPhotos(eventId!));
    }
  };

  const handleDeleteAll = async () => {
    if (photos.length === 0) return;
    if (confirm(`Удалить ВСЕ фото (${photos.length})?`)) {
      dispatch(clearAllPhotosForEvent(eventId!));
      setSelectedPhotos(new Set());
      setSelectAll(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-100">Загрузка...</div>;

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Альбом</h1>
          <div className="flex flex-wrap gap-2">
            {photos.length > 0 && (
              <>
                <Button variant="secondary" onClick={handleSelectAll}>
                  {selectAll ? 'Снять все' : 'Выбрать все'}
                </Button>
                <Button variant="secondary" onClick={handleDownloadSelected} disabled={selectedPhotos.size === 0}>
                  Скачать выбранные
                </Button>
                <Button variant="secondary" onClick={handleDownloadAll}>
                  Скачать всё
                </Button>
                <Button variant="secondary" onClick={handleDeleteSelected} disabled={selectedPhotos.size === 0}>
                  Удалить выбранные
                </Button>
                <Button variant="secondary" onClick={handleDeleteAll}>
                  Удалить всё
                </Button>
              </>
            )}
          </div>
        </div>
        {photos.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-xl">
            <p className="text-gray-500">Пока нет загруженных фото</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 ${
                  selectedPhotos.has(photo.id) ? 'border-primary-500' : 'border-transparent'
                }`}
                onClick={() => handleSelectPhoto(photo.id)}
              >
                <img src={photo.url} alt="фото" className="object-cover w-full h-48" />
                {selectedPhotos.has(photo.id) && (
                  <div className="absolute flex items-center justify-center w-6 h-6 text-sm text-white rounded-full top-2 left-2 bg-primary-500">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};