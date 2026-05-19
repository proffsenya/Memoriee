import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../app/store/hooks';
import { createEvent } from '../features/eventSlice/eventSlice';
import { Card, Input, Button } from '../shared/ui';
import { ChevronLeft } from 'lucide-react';

const categories = [
  { name: 'Свадьба', emoji: '💍' },
  { name: 'День рождения', emoji: '🎂' },
  { name: 'Корпоратив', emoji: '💼' },
  { name: 'Путешествие', emoji: '✈️' },
  { name: 'Другое', emoji: '🎉' }
];

const filters = [
  { value: 'warm', label: 'Тёплый', emoji: '🔥' },
  { value: 'bw', label: 'Ч/Б', emoji: '⚫' },
  { value: 'vintage', label: 'Винтаж', emoji: '📷' }
];

const PRICE_PER_PHOTO = 10;

export const CreateEventPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'Свадьба');
  const [filter, setFilter] = useState('warm');
  const [guestCount, setGuestCount] = useState(20);
  const [photosPerGuest, setPhotosPerGuest] = useState(30);
  const [loading, setLoading] = useState(false);

  const totalPhotos = guestCount * photosPerGuest;
  const totalPrice = totalPhotos * PRICE_PER_PHOTO;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const confirmed = confirm(`Оплатить ${totalPrice} руб. за ${totalPhotos} фото?`);
    if (!confirmed) {
      setLoading(false);
      return;
    }
    try {
      const result = await dispatch(createEvent({
        name, date, category, filter, photosPerGuest, guestCount
      })).unwrap();
      navigate(`/event/${result.id}/dashboard`);
    } catch (error) {
      console.error('Event creation error:', error);
      alert('Ошибка создания события');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-5 blur-3xl top-20 -left-40"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 py-6 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Новое событие</h1>
            <p className="text-gray-400 text-sm">Шаг {step} из 5</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${s <= step ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Occasion */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>🎯</span> Какой тип события?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => { setCategory(cat.name); setStep(2); }}
                      className={`p-4 rounded-xl border-2 transition text-center ${
                        category === cat.name
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.emoji}</div>
                      <div className="text-white font-medium">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Event name */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>📝</span> Название события
                </h2>
                <p className="text-gray-400 text-sm">Это увидят гости при сканировании QR</p>
                <Input
                  placeholder="Например: Свадьба Иван & Мария"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button onClick={() => setStep(1)} variant="secondary" className="flex-1">Назад</Button>
                  <Button onClick={() => name && setStep(3)} className="flex-1">Далее</Button>
                </div>
              </div>
            )}

            {/* Step 3: Date and filter */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>📅</span> Когда событие?
                </h2>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🎨</span> Фильтр для фото
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {filters.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`p-4 rounded-xl border-2 transition text-center ${
                          filter === f.value
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-3xl mb-1">{f.emoji}</div>
                        <div className="text-white text-sm font-medium">{f.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => setStep(2)} variant="secondary" className="flex-1">Назад</Button>
                  <Button onClick={() => date && setStep(4)} className="flex-1">Далее</Button>
                </div>
              </div>
            )}

            {/* Step 4: Guests and photos */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>👥</span> Сколько гостей?
                </h2>
                <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-white mb-2">{guestCount}</div>
                    <input
                      type="range"
                      min="1"
                      max="250"
                      value={guestCount}
                      onChange={e => setGuestCount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-6">
                  <span>📸</span> Фото на одного гостя?
                </h3>
                <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-white mb-2">{photosPerGuest}</div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={photosPerGuest}
                      onChange={e => setPhotosPerGuest(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setStep(3)} variant="secondary" className="flex-1">Назад</Button>
                  <Button onClick={() => setStep(5)} className="flex-1">Далее</Button>
                </div>
              </div>
            )}

            {/* Step 5: Review and pay */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>✨</span> Готово к созданию!
                </h2>

                <div className="space-y-3 bg-slate-700/50 border border-slate-600 rounded-xl p-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Событие:</span>
                    <span className="text-white font-semibold">{name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Дата:</span>
                    <span className="text-white font-semibold">{date}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Тип:</span>
                    <span className="text-white font-semibold">{category}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3 mt-3 flex justify-between text-lg">
                    <span className="text-white font-semibold">Всего фото:</span>
                    <span className="text-indigo-400 font-bold">{totalPhotos}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-white">К оплате:</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text">{totalPrice} ₽</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setStep(4)} variant="secondary" className="flex-1">Назад</Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Обработка...' : `Оплатить ${totalPrice} ₽`}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};