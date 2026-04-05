import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { StoreProvider } from './StoreProvider';
import { ToastProvider } from '../../shared/context/ToastContext';

export const AppProviders = () => (
  <StoreProvider>
    <QueryProvider>
      <ToastProvider>
        <RouterProvider />
      </ToastProvider>
    </QueryProvider>
  </StoreProvider>
);