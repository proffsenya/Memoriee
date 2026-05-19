import { NavLink } from 'react-router-dom';
import { Home, Calendar, User, Camera } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/history', label: 'История', icon: Calendar },
  { path: '/profile', label: 'Профиль', icon: User },
  { path: '/guest/latest', label: 'Камера', icon: Camera, hideOnMain: true },
];

export const TabBar = () => {
  const isGuestMode = window.location.pathname.includes('/guest/');
  const visibleTabs = isGuestMode ? tabs.filter(t => t.path === '/guest/latest') : tabs.filter(t => t.path !== '/guest/latest');

  return (
    <div className="tab-bar flex justify-around items-center py-3 px-4 bg-gradient-to-r from-slate-800 to-slate-800 border-t border-slate-700">
      {visibleTabs.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
              isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-300'
            }`
          }
        >
          <Icon size={24} />
          <span className="text-xs font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  );
};