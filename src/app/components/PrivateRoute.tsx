import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAppSelector((state) => state.user);
  if (loading) return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  return user ? children : <Navigate to="/login" />;
};