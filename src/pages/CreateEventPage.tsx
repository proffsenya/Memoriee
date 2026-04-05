import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../app/store/hooks';
import { createEvent } from '../features/eventSlice/eventSlice';
import { Card, Input, Button } from '../shared/ui';

const categories = ['Свадьба', 'День рождения', 'Корпоратив', 'Путешествие', 'Другое'];
const PRICE_PER_PHOTO = 10; // рублей за одно фото

export const CreateEventPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
    // Имитация оплаты (позже замените на реальный платёж)
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
    } catch (err) {
      alert('Ошибка создания события');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md py-8 mx-auto">
      <Card>
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Новое событие</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input placeholder="Название" value={name} onChange={e => setName(e.target.value)} required />
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Фильтр для гостей</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="warm">Тёплый</option>
              <option value="bw">Ч/Б</option>
              <option value="vintage">Винтаж</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Количество гостей</label>
            <Input type="number" min="1" value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} required />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Фото на одного гостя</label>
            <Input type="number" min="1" value={photosPerGuest} onChange={e => setPhotosPerGuest(Number(e.target.value))} required />
          </div>

          <div className="p-4 text-center rounded-lg bg-gray-50">
            <p className="text-gray-600">Общее количество фото: <strong>{totalPhotos}</strong></p>
            <p className="text-2xl font-bold text-primary-600">{totalPrice} ₽</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Обработка...' : `Оплатить ${totalPrice} ₽`}
          </Button>
        </form>
      </Card>
    </div>
  );
};