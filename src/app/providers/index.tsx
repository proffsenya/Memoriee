import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { StoreProvider } from './StoreProvider';

export const AppProviders = () => (
  <StoreProvider>
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  </StoreProvider>
);