import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../shared/api/apiClient';
import { Filter, FilterParams } from '../../entities/filter/types';

export const fetchAllFilters = createAsyncThunk('filters/fetchAll', async () => {
  const res = await apiClient.get('/filters/all');
  return res.data;
});

export const fetchUserFilters = createAsyncThunk('filters/fetchUser', async () => {
  const res = await apiClient.get('/filters/user');
  return res.data;
});

export const fetchPresets = createAsyncThunk('filters/fetchPresets', async () => {
  const res = await apiClient.get('/filters/presets');
  return res.data;
});

export const createFilter = createAsyncThunk(
  'filters/createFilter',
  async (payload: { name: string; description?: string; params: FilterParams }) => {
    const res = await apiClient.post('/filters', payload);
    return res.data;
  }
);

export const updateFilter = createAsyncThunk(
  'filters/updateFilter',
  async (payload: { id: string; name?: string; description?: string; params?: FilterParams }) => {
    const { id, ...data } = payload;
    const res = await apiClient.put(`/filters/${id}`, data);
    return res.data;
  }
);

export const deleteFilter = createAsyncThunk('filters/deleteFilter', async (id: string) => {
  await apiClient.delete(`/filters/${id}`);
  return id;
});

interface FiltersState {
  all: Filter[];
  presets: Filter[];
  custom: Filter[];
  loading: boolean;
  error: string | null;
}

const initialState: FiltersState = {
  all: [],
  presets: [],
  custom: [],
  loading: false,
  error: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllFilters.fulfilled, (state, action) => {
        state.all = action.payload;
        state.presets = action.payload.filter((f: Filter) => f.type === 'preset');
        state.custom = action.payload.filter((f: Filter) => f.type === 'custom');
        state.loading = false;
      })
      .addCase(fetchAllFilters.rejected, (state, action) => {
        state.error = action.error.message || 'Error fetching filters';
        state.loading = false;
      })
      .addCase(fetchUserFilters.fulfilled, (state, action) => {
        state.custom = action.payload;
      })
      .addCase(fetchPresets.fulfilled, (state, action) => {
        state.presets = action.payload;
      })
      .addCase(createFilter.fulfilled, (state, action) => {
        state.all.push(action.payload);
        state.custom.push(action.payload);
      })
      .addCase(updateFilter.fulfilled, (state, action) => {
        const index = state.all.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.all[index] = action.payload;
        }
        const customIndex = state.custom.findIndex((f) => f.id === action.payload.id);
        if (customIndex !== -1) {
          state.custom[customIndex] = action.payload;
        }
      })
      .addCase(deleteFilter.fulfilled, (state, action) => {
        state.all = state.all.filter((f) => f.id !== action.payload);
        state.custom = state.custom.filter((f) => f.id !== action.payload);
      });
  },
});

export default filtersSlice.reducer;
