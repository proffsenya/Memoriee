import { createBrowserRouter, RouterProvider as RRDRouterProvider } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchMe } from '../../features/userSlice/userSlice';
import { SplashScreen } from '../../pages/SplashScreen';
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
  { path: '/guest/:eventId', element: <GuestCameraPage /> },
]);

// Компонент-обёртка для вызова fetchMe
const RouterProviderWithAuth = () => {
  const dispatch = useAppDispatch();
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!splashComplete) {
    return <SplashScreen onComplete={() => setSplashComplete(true)} />;
  }

  return <RRDRouterProvider router={router} />;
};

export const RouterProvider = () => <RouterProviderWithAuth />;