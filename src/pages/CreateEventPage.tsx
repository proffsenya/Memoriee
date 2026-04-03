import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../app/store/hooks';
import { createEvent } from '../features/eventSlice/eventSlice';
import { Card, Input, Button } from '../shared/ui';

const categories = ['Свадьба', 'День рождения', 'Корпоратив', 'Путешествие', 'Другое'];
const filters = [
  { value: 'warm', label: 'Теплый' },
  { value: 'bw', label: 'Черно-белый' },
  { value: 'vintage', label: 'Винтаж' },
];

export const CreateEventPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'Свадьба');
  const [photosPerGuest, setPhotosPerGuest] = useState(30);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('warm');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(createEvent({ name, date, category, photosPerGuest, filter })).unwrap();
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
          <Input
            placeholder="Название события"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Лимит фото на одного гостя
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={photosPerGuest}
              onChange={(e) => setPhotosPerGuest(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Фильтр для фото</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              {filters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Создаём...' : 'Создать событие'}
          </Button>
        </form>
      </Card>
    </div>
  );
};