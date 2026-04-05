import { createBrowserRouter, RouterProvider as RRDRouterProvider } from 'react-router-dom';
import { AdaptiveLayout } from '../Layout/AdaptiveLayout';
import { LandingPage } from '../../pages/LandingPage';
import { CreateEventPage } from '../../pages/CreateEventPage';
import { EventDashboardPage } from '../../pages/EventDashboardPage';
import { GuestCameraPage } from '../../pages/GuestCameraPage';
import { AlbumPage } from '../../pages/AlbumPage';
import { HistoryPage } from '../../pages/HistoryPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { PrivateRoute } from '../components/PrivateRoute';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <AdaptiveLayout />,
    children: [
      { path: '/', element: <PrivateRoute><LandingPage /></PrivateRoute> },
      { path: '/create-event', element: <PrivateRoute><CreateEventPage /></PrivateRoute> },
      { path: '/event/:eventId/dashboard', element: <PrivateRoute><EventDashboardPage /></PrivateRoute> },
      { path: '/album/:eventId', element: <PrivateRoute><AlbumPage /></PrivateRoute> },
      { path: '/history', element: <PrivateRoute><HistoryPage /></PrivateRoute> },
      { path: '/profile', element: <PrivateRoute><ProfilePage /></PrivateRoute> },
    ],
  },
  { path: '/guest/:eventId', element: <GuestCameraPage /> }, // публичный
]);

export const RouterProvider = () => <RRDRouterProvider router={router} />;