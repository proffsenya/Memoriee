import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { selectAllFilters } from '../../../features/filtersSlice/selectors';
import { fetchAllFilters } from '../../../features/filtersSlice/filtersSlice';
import { Filter } from '../../../entities/filter/types';

interface FilterSelectorProps {
  onSelectFilter: (filter: Filter) => void;
  currentFilterId?: string;
}

export function FilterSelector({ onSelectFilter, currentFilterId }: FilterSelectorProps) {
  const dispatch = useAppDispatch();
  const allFilters = useAppSelector(selectAllFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (allFilters.length === 0) {
      dispatch(fetchAllFilters());
    }
    setIsOpen(!isOpen);
  };

  const handleSelectFilter = (filter: Filter) => {
    onSelectFilter(filter);
    setIsOpen(false);
  };

  const currentFilter = allFilters.find(f => f.id === currentFilterId);

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-sm font-medium text-white hover:bg-slate-600 transition"
      >
        {currentFilter?.name || 'Выбрать фильтр'}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50">
          <div className="max-h-48 overflow-y-auto">
            {allFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleSelectFilter(filter)}
                className={`w-full text-left px-3 py-2 text-sm transition ${
                  filter.id === currentFilterId
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-200 hover:bg-slate-600'
                }`}
              >
                <div className="font-medium">{filter.name}</div>
                {filter.description && (
                  <div className="text-xs opacity-75">{filter.description}</div>
                )}
                <div className="text-xs opacity-50 mt-1">
                  {filter.type === 'preset' ? 'Стандартный' : 'Пользовательский'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
