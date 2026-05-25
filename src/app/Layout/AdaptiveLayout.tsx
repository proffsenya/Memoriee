// src/app/Layout/AdaptiveLayout.tsx
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LogOut, Sliders, Tag } from 'lucide-react';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';
import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '../../features/userSlice/userSlice';
import { useFilterMenu } from '../../shared/context/FilterMenuContext';
import { FilterMenu } from '../../shared/ui';

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/pricing', label: 'Тарифы', icon: Tag },
  { path: '/history', label: 'История', icon: Calendar },
  { path: '/profile', label: 'Профиль', icon: User },
];

export const AdaptiveLayout = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isFilterMenuOpen, openFilterMenu, closeFilterMenu } = useFilterMenu();
  const isGuestPage = location.pathname.startsWith('/guest/');

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Для гостей не показываем навигацию вообще
  if (isGuestPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {isDesktop && (
        <aside className="fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 shadow-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl">📸</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Memoriee</h1>
            </div>
            <p className="text-sm text-gray-400">Ваши воспоминания</p>
          </div>
          <nav className="mt-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 transition ${
                    isActive ? 'bg-indigo-500/20 text-indigo-400 border-r-2 border-indigo-500' : ''
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
            <button
              onClick={openFilterMenu}
              className="flex items-center gap-3 px-6 py-3 w-full text-gray-300 hover:text-white hover:bg-slate-700/50 transition rounded-r-lg"
            >
              <Sliders size={20} />
              <span>Фильтры</span>
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-red-500/10 rounded-lg transition text-sm"
            >
              <LogOut size={18} />
              <span>Выход</span>
            </button>
          </div>
        </aside>
      )}

      <main className={isDesktop ? 'ml-64' : 'pb-20'}>
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {!isDesktop && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-800 to-slate-800/95 border-t border-slate-700 shadow-2xl">
          <div className="flex items-center justify-around py-3 px-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition ${
                    isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-300'
                  }`
                }
              >
                <Icon size={24} />
                <span className="text-xs">{label}</span>
              </NavLink>
            ))}
            <button
              onClick={openFilterMenu}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition text-gray-400 hover:text-gray-300"
            >
              <Sliders size={24} />
              <span className="text-xs">Фильтры</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition text-gray-400 hover:text-red-400"
            >
              <LogOut size={24} />
              <span className="text-xs">Выход</span>
            </button>
          </div>
        </div>
      )}

      <FilterMenu isOpen={isFilterMenuOpen} onClose={closeFilterMenu} />
    </div>
  );
};