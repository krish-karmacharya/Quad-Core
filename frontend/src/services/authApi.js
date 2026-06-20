import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const login = async (email, password) => {
  const response = await authApi.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await authApi.post('/auth/register', { name, email, password });
  return response.data;
};

export const logout = async () => {
  const response = await authApi.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

export default {
  login,
  register,
  logout,
  getMe
};
