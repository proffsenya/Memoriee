import { Outlet } from 'react-router-dom';
import { TabBar } from '../../shared/ui/TabBar/TabBar';

export const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-cream">
      <div className="pb-16">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
};