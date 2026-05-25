import { createContext, useContext, useState } from 'react';

interface FilterMenuContextType {
  isFilterMenuOpen: boolean;
  openFilterMenu: () => void;
  closeFilterMenu: () => void;
}

const FilterMenuContext = createContext<FilterMenuContextType | undefined>(undefined);

export function FilterMenuProvider({ children }: { children: React.ReactNode }) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const openFilterMenu = () => setIsFilterMenuOpen(true);
  const closeFilterMenu = () => setIsFilterMenuOpen(false);

  return (
    <FilterMenuContext.Provider value={{ isFilterMenuOpen, openFilterMenu, closeFilterMenu }}>
      {children}
    </FilterMenuContext.Provider>
  );
}

export function useFilterMenu() {
  const context = useContext(FilterMenuContext);
  if (!context) {
    throw new Error('useFilterMenu must be used within FilterMenuProvider');
  }
  return context;
}
