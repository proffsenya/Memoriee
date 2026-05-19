import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { fetchUserEvents } from '../features/eventSlice/eventSlice';
import { Search, ArrowRight, Plus, Zap } from 'lucide-react';
import { Button, Card } from '../shared/ui';

const categories = [
  { name: 'Свадьба', emoji: '💍' },
  { name: 'День рождения', emoji: '🎂' },
  { name: 'Путешествие', emoji: '✈️' },
  { name: 'Фестиваль', emoji: '🎪' },
  { name: 'Выпускной', emoji: '🎓' },
  { name: 'Встреча', emoji: '🥳' },
  { name: 'Корпоратив', emoji: '💼' },
  { name: 'Другое', emoji: '🎉' },
];

export const LandingPage = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const events = useAppSelector((state) => state.event.events ?? []);
  const loading = useAppSelector((state) => state.event.loading);

  useEffect(() => {
    dispatch(fetchUserEvents());
  }, [dispatch]);

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-5 blur-3xl top-20 -left-40"></div>
        <div className="absolute w-80 h-80 bg-blue-500 rounded-full opacity-5 blur-3xl -bottom-40 -right-40"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-12 pb-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30">
            <span className="text-sm text-gray-200">Добро пожаловать в Memoriee</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Ваши воспоминания
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">живут вечно</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Создавайте события, приглашайте гостей, собирайте фото. Все в одном месте 📸
          </p>
        </div>

        {/* Search */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Поиск события..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-4 pl-12 pr-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Create Event CTA */}
        <div className="mb-16 text-center">
          <Link to="/create-event">
            <Button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg">
              <Plus size={24} />
              <span>Создать мероприятие</span>
              <Zap size={20} className="ml-1" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-gray-400">Бесплатно до 10 гостей</p>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-white">По категориям</h2>
            <span className="text-gray-400 text-sm">Выберите тип события</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/create-event?category=${encodeURIComponent(cat.name)}`}
                className="group p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col items-center gap-3"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">{cat.emoji}</div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* My Events */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Мои события</h2>
            {!loading && filteredEvents.length > 0 && (
              <Link to="/history" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition">
                Все события <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-gray-400">Загрузка ваших событий...</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="py-16 text-center bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-gray-300 text-lg mb-2">Нет событий</p>
              <p className="text-gray-400 text-sm mb-6">Создайте первое событие, чтобы начать собирать фото</p>
              <Link to="/create-event">
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl">
                  Создать событие
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(0, 6).map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}/dashboard`}
                  className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition">{event.name}</h3>
                      <p className="text-sm text-gray-400">{event.category}</p>
                    </div>
                    <div className="text-2xl">📸</div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span className="text-xs text-gray-400">{event.totalPhotos} фото</span>
                    <span className="text-xs text-gray-400">{event.guestCount} гостей</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};