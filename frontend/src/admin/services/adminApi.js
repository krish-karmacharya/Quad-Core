import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const login = async (email, password) => {
  const response = await adminApi.post('/auth/login', { email, password });
  if (response.data.success && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getMe = async () => {
  const response = await adminApi.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  await adminApi.post('/auth/logout');
  localStorage.removeItem('user');
};

export const getAdminDetections = async (params = {}) => {
  const response = await adminApi.get('/admin/detections', { params });
  return response.data;
};

export const getAdminDetectionById = async (id) => {
  const response = await adminApi.get(`/admin/detections/${id}`);
  return response.data;
};

export const verifyDetection = async (id, { note, correctedPlateText }) => {
  const response = await adminApi.patch(`/admin/detections/${id}/verify`, { note, correctedPlateText });
  return response.data;
};

export const rejectDetection = async (id, { note }) => {
  const response = await adminApi.patch(`/admin/detections/${id}/reject`, { note });
  return response.data;
};

export const deleteAdminDetection = async (id) => {
  const response = await adminApi.delete(`/admin/detections/${id}`);
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await adminApi.get('/admin/users');
  return response.data;
};

export const createAdminUser = async (userData) => {
  const response = await adminApi.post('/admin/users', userData);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await adminApi.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await adminApi.delete(`/admin/users/${id}`);
  return response.data;
};

export default {
  login,
  getMe,
  logout,
  getAdminDetections,
  getAdminDetectionById,
  verifyDetection,
  rejectDetection,
  deleteAdminDetection,
  getAdminUsers,
  createAdminUser,
  updateUserRole,
  deleteUser
};
