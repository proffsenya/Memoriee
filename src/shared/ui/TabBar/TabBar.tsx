import { NavLink } from 'react-router-dom';
import { Home, Calendar, User, Camera } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/history', label: 'История', icon: Calendar },
  { path: '/profile', label: 'Профиль', icon: User },
  { path: '/guest/latest', label: 'Камера', icon: Camera, hideOnMain: true }, // для гостя, скрываем для невесты
];

export const TabBar = () => {
  // Определяем, показывать ли камеру (если есть активная гостевая сессия)
  const isGuestMode = window.location.pathname.includes('/guest/');
  const visibleTabs = isGuestMode ? tabs.filter(t => t.path === '/guest/latest') : tabs.filter(t => t.path !== '/guest/latest');

  return (
    <div className="tab-bar flex justify-around items-center py-2 px-4">
      {visibleTabs.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 rounded-full transition ${
              isActive ? 'text-brown bg-beige' : 'text-brown-light'
            }`
          }
        >
          <Icon size={24} />
          <span className="text-xs">{label}</span>
        </NavLink>
      ))}
    </div>
  );
};