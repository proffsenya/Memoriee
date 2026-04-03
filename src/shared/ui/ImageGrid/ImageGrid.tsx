import { Photo } from '../../../entities/photo/types';

export const ImageGrid = ({ photos }: { photos: Photo[] }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {photos.map((photo) => (
      <div key={photo.id} className="overflow-hidden bg-gray-100 rounded-lg aspect-square">
        <img src={photo.url} alt="wedding" className="object-cover w-full h-full transition duration-300 hover:scale-105" />
      </div>
    ))}
  </div>
);