import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Загрузка профиля из localStorage при старте
export const loadUserFromStorage = createAsyncThunk('user/load', async () => {
  const stored = localStorage.getItem('memoriee_user');
  if (stored) return JSON.parse(stored);
  return null;
});

export const updateUserProfile = createAsyncThunk(
  'user/update',
  async (data: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // имитация API
    const existing = localStorage.getItem('memoriee_user');
    const current = existing ? JSON.parse(existing) : { id: crypto.randomUUID() };
    const updated = { ...current, ...data };
    localStorage.setItem('memoriee_user', JSON.stringify(updated));
    return updated;
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  localStorage.removeItem('memoriee_user');
  return null;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка обновления';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default userSlice.reducer;