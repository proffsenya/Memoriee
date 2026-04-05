import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchUserEvents } from '../features/eventSlice/eventSlice';
import { Search, Sparkles, Camera, Heart, ArrowRight } from 'lucide-react';
import { Button, Card } from '../shared/ui';

const categories = ['Свадьба', 'День рождения', 'Корпоратив', 'Путешествие'];

export const LandingPage = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const events = useAppSelector((state) => state.event.events ?? []);
  const loading = useAppSelector((state) => state.event.loading);

  useEffect(() => {
    dispatch(fetchUserEvents());
  }, [dispatch]);

  const filteredEvents = events.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-primary-50 text-primary-600">
          <Sparkles size={16} />
          <span>Ваше решение — один клик</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Memoriee</h1>
        <p className="max-w-md mx-auto text-gray-500">Создайте альбом, пригласите гостей — воспоминания будут жить вечно</p>
      </div>
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
        <input type="text" placeholder="Поиск события..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Категории</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat} to={`/create-event?category=${encodeURIComponent(cat)}`} className="p-3 text-center transition bg-white shadow-sm rounded-xl hover:shadow-md">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-primary-100">
                <Camera size={20} className="text-primary-600" />
              </div>
              <span className="text-sm text-gray-700">{cat}</span>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Мои события</h2>
          <Link to="/history" className="flex items-center gap-1 text-sm text-primary-600">Все <ArrowRight size={16} /></Link>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Загрузка...</div>
        ) : filteredEvents.length === 0 ? (
          <Card className="py-12 text-center">
            <Heart size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">У вас пока нет событий</p>
            <Link to="/create-event"><Button className="mt-4">Создать событие</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link to={`/event/${event.id}/dashboard`} key={event.id}>
                <div className="p-4 transition bg-white shadow-sm rounded-xl hover:shadow-md">
                  <h3 className="font-semibold text-gray-800">{event.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};