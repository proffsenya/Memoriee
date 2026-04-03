import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { updateUserProfile, logout } from '../features/userSlice/userSlice';
import { User, LogOut, Save } from 'lucide-react';
import { Button, Input } from '../shared/ui';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = () => {
    dispatch(updateUserProfile(formData));
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  return (
    <div className="pt-6 mobile-container">
      <div className="mb-6 text-center card">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-3 rounded-full bg-beige">
          <User size={48} className="text-brown" />
        </div>
        <h2 className="text-xl font-semibold">{user?.name || 'Гость'}</h2>
        <p className="text-sm text-brown-light">{user?.email || 'Не указан'}</p>
      </div>

      <div className="space-y-4 card">
        <h3 className="text-lg font-semibold">Личные данные</h3>
        <div>
          <label className="block mb-1 text-sm text-brown-light">Имя</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ваше имя"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-brown-light">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@mail.ru"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-brown-light">Телефон</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save size={18} className="mr-2" />
          Сохранить
        </Button>
      </div>

      <div className="mt-4 card">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 py-2 text-red-600"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </div>
  );
};