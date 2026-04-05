import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchPhotos, deletePhoto, deleteAllPhotos } from '../features/photosSlice/photosSlice';
import { Button } from '../shared/ui';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Info } from 'lucide-react';

export const AlbumPage = () => {
  const { eventId } = useParams();
  const dispatch = useAppDispatch();
  const { photos, loading } = useAppSelector((state) => state.photos);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPhotoInfo, setSelectedPhotoInfo] = useState<{ url: string; guestName: string; uploadedAt: string } | null>(null);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchPhotos(eventId));
    }
  }, [eventId, dispatch]);

  const handleSelectPhoto = (id: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedPhotos(newSelected);
    setSelectAll(newSelected.size === photos.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
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
    if (selectedPhotos.size === 0) {
      alert('Выберите хотя бы одно фото');
      return;
    }
    downloadPhotos(selectedPhotos);
  };

  const handleDownloadAll = () => {
    downloadPhotos(new Set(photos.map(p => p.id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) {
      alert('Выберите фото для удаления');
      return;
    }
    if (confirm(`Удалить ${selectedPhotos.size} фото?`)) {
      for (const id of selectedPhotos) {
        await dispatch(deletePhoto(id)).unwrap();
      }
      setSelectedPhotos(new Set());
      setSelectAll(false);
      dispatch(fetchPhotos(eventId!));
    }
  };

  const handleDeleteAll = async () => {
    if (photos.length === 0) return;
    if (confirm(`Удалить ВСЕ фото (${photos.length})?`)) {
      await dispatch(deleteAllPhotos(eventId!)).unwrap();
      setSelectedPhotos(new Set());
      setSelectAll(false);
    }
  };

  const handleShowInfo = (photo: any) => {
    setSelectedPhotoInfo({
      url: photo.url,
      guestName: photo.guestName || 'Неизвестный',
      uploadedAt: new Date(photo.createdAt).toLocaleString(),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">Загрузка фото...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Альбом</h1>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleSelectAll}>
                {selectAll ? 'Снять все' : 'Выбрать все'}
              </Button>
              <Button variant="secondary" onClick={handleDownloadSelected} disabled={selectedPhotos.size === 0}>
                Скачать выбранные ({selectedPhotos.size})
              </Button>
              <Button variant="secondary" onClick={handleDownloadAll}>
                Скачать всё ({photos.length})
              </Button>
              <Button variant="secondary" onClick={handleDeleteSelected} disabled={selectedPhotos.size === 0}>
                Удалить выбранные
              </Button>
              <Button variant="secondary" onClick={handleDeleteAll}>
                Удалить всё
              </Button>
            </div>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="py-12 text-center bg-white shadow-sm rounded-xl">
            <p className="text-gray-500">Пока нет загруженных фото</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                  selectedPhotos.has(photo.id) ? 'border-blue-500 shadow-lg' : 'border-transparent'
                }`}
              >
                <img
                  src={photo.url}
                  alt="wedding"
                  className="object-cover w-full h-48"
                  onClick={() => handleSelectPhoto(photo.id)}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleShowInfo(photo); }}
                  className="absolute p-1 text-white rounded-full bottom-2 right-2 bg-black/50 backdrop-blur-sm hover:bg-black/70"
                >
                  <Info size={18} />
                </button>
                {selectedPhotos.has(photo.id) && (
                  <div className="absolute flex items-center justify-center w-6 h-6 text-sm font-bold text-white bg-blue-500 rounded-full top-2 left-2">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно с информацией о фото */}
      {selectedPhotoInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedPhotoInfo(null)}>
          <div className="w-full max-w-sm p-4 bg-white rounded-xl" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhotoInfo.url} alt="preview" className="object-cover w-full h-48 mb-4 rounded" />
            <p><strong>Автор:</strong> {selectedPhotoInfo.guestName}</p>
            <p><strong>Дата и время:</strong> {selectedPhotoInfo.uploadedAt}</p>
            <Button onClick={() => setSelectedPhotoInfo(null)} className="w-full mt-4">Закрыть</Button>
          </div>
        </div>
      )}
    </div>
  );
};