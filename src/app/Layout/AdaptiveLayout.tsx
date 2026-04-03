import { Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/history', label: 'История', icon: Calendar },
  { path: '/profile', label: 'Профиль', icon: User },
];

export const AdaptiveLayout = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Десктопная навигация (сайдбар или верхнее меню) */}
      {isDesktop && (
        <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary-600">Memoriee</h1>
            <p className="mt-1 text-sm text-gray-500">Ваши воспоминания</p>
          </div>
          <nav className="mt-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 transition ${
                    isActive ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      {/* Основной контент с отступом под сайдбар на десктопе */}
      <main className={isDesktop ? 'ml-64' : ''}>
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Мобильная навигация (таб-бар) */}
      {!isDesktop && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around py-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1 rounded-full transition ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`
                }
              >
                <Icon size={24} />
                <span className="text-xs">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};