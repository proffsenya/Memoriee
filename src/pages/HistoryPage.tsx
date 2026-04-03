import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchUserEvents } from '../features/eventSlice/eventSlice';
import { Link } from 'react-router-dom';
import { Calendar, Users, Search } from 'lucide-react';

export const HistoryPage = () => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((state) => state.event);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchUserEvents());
  }, [dispatch]);

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800">История событий</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 pr-3 text-sm border border-gray-200 rounded-lg pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl">
          <p className="text-gray-500">События не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <Link to={`/event/${event.id}/dashboard`} key={event.id}>
              <div className="p-5 transition bg-white shadow-sm rounded-xl hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{0} гостей</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Создано: {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};