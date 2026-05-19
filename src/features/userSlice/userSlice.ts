import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register } from '../../shared/api/auth';
import apiClient from '../../shared/api/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: true,
  error: null,
};

export const registerUser = createAsyncThunk(
  'user/register',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const res = await register(name, email, password);
    localStorage.setItem('token', res.data.token);
    return res.data.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    const res = await login(email, password);
    localStorage.setItem('token', res.data.token);
    return res.data.user;
  }
);

export const fetchMe = createAsyncThunk('user/fetchMe', async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
});

export const logout = createAsyncThunk('user/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

// Alias for convenience
export const logoutUser = logout;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Ошибка регистрации'; })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Ошибка входа'; })
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(fetchMe.rejected, (state) => { state.loading = false; state.user = null; })
      .addCase(logout.fulfilled, (state) => { state.user = null; state.loading = false; });
  },
});

export default userSlice.reducer;