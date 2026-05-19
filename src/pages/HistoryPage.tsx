import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchUserEvents } from '../features/eventSlice/eventSlice';
import { Link } from 'react-router-dom';
import { Calendar, Users, Search, ArrowRight } from 'lucide-react';

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
    return (
      <div className="py-12 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-400">Загрузка событий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-white">История событий</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2" size={18} />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pl-12 pr-4 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <p className="text-gray-400 text-lg">События не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <Link to={`/event/${event.id}/dashboard`} key={event.id}>
              <div className="group p-6 transition bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition">{event.name}</h3>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-indigo-400 transition" />
                </div>
                <div className="flex flex-col gap-3 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar size={16} className="text-indigo-400" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users size={16} className="text-indigo-400" />
                    <span>{event.guestCount || 0} гостей</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-gray-500">
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