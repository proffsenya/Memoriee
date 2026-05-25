import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { logout } from '../features/userSlice/userSlice';
import { Card } from '../shared/ui';
import { User, LogOut, Mail } from 'lucide-react';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-5 blur-3xl top-20 -left-40"></div>
      </div>
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6">
      {/* Profile Card */}
      <Card className="mb-8 text-center bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
          <User size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{user?.name || 'Гость'}</h2>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Mail size={16} />
          <p className="text-sm">{user?.email || 'Не указан'}</p>
        </div>
      </Card>

      {/* Logout Button */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span>Выйти из аккаунта</span>
        </button>
      </Card>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">О приложении</h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <p>✨ <span className="text-gray-400">Версия 1.0.0</span></p>
          <p>📸 <span className="text-gray-400">Ваша платформа для сбора воспоминаний</span></p>
          <p>🎯 <span className="text-gray-400">Создавайте события, приглашайте гостей, собирайте фото</span></p>
        </div>
      </div>
      </div>
    </div>
  );
};