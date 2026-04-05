import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { logout } from '../features/userSlice/userSlice';
import { Button, Card } from '../shared/ui';
import { User, LogOut } from 'lucide-react';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <div className="pt-6 mobile-container">
      <Card className="mb-6 text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-3 rounded-full bg-primary-100">
          <User size={48} className="text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold">{user?.name || 'Гость'}</h2>
        <p className="text-sm text-gray-500">{user?.email || 'Не указан'}</p>
      </Card>
      <Card>
        <Button onClick={handleLogout} variant="secondary" className="w-full text-red-600">
          <LogOut size={18} className="mr-2" /> Выйти
        </Button>
      </Card>
    </div>
  );
};