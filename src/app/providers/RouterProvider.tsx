import { createBrowserRouter, RouterProvider as RRDRouterProvider } from 'react-router-dom';
import { AdaptiveLayout } from '../Layout/AdaptiveLayout';
import { LandingPage } from '../../pages/LandingPage';
import { CreateEventPage } from '../../pages/CreateEventPage';
import { EventDashboardPage } from '../../pages/EventDashboardPage';
import { GuestCameraPage } from '../../pages/GuestCameraPage';
import { AlbumPage } from '../../pages/AlbumPage';
import { HistoryPage } from '../../pages/HistoryPage';
import { ProfilePage } from '../../pages/ProfilePage';

const router = createBrowserRouter([
  {
    element: <AdaptiveLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/create-event', element: <CreateEventPage /> },
      { path: '/event/:eventId/dashboard', element: <EventDashboardPage /> },
      { path: '/guest/:eventId', element: <GuestCameraPage /> },
      { path: '/album/:eventId', element: <AlbumPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
]);

export const RouterProvider = () => <RRDRouterProvider router={router} />;