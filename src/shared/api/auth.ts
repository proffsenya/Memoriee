import apiClient from './apiClient';

export const register = (name: string, email: string, password: string) =>
  apiClient.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  apiClient.post('/auth/login', { email, password });