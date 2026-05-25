import { RootState } from '../../app/store/store';

export const selectAllFilters = (state: RootState) => state.filters.all;
export const selectPresetFilters = (state: RootState) => state.filters.presets;
export const selectCustomFilters = (state: RootState) => state.filters.custom;
export const selectFiltersLoading = (state: RootState) => state.filters.loading;
export const selectFiltersError = (state: RootState) => state.filters.error;

export const selectFilterById = (state: RootState, id: string) => {
  return state.filters.all.find(f => f.id === id);
};
