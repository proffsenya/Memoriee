import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { StoreProvider } from './StoreProvider';
import { ToastProvider } from '../../shared/context/ToastContext';
import { FilterMenuProvider } from '../../shared/context/FilterMenuContext';

export const AppProviders = () => (
  <StoreProvider>
    <QueryProvider>
      <ToastProvider>
        <FilterMenuProvider>
          <RouterProvider />
        </FilterMenuProvider>
      </ToastProvider>
    </QueryProvider>
  </StoreProvider>
);