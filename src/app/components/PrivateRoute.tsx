import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAppSelector((state) => state.user);
  return user ? children : <Navigate to="/login" />;
};