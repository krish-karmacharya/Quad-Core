import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL
});

// Interceptor to attach the JWT Bearer token automatically from localStorage
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await adminApi.post('/auth/login', { email, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getMe = async () => {
  const response = await adminApi.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
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

export default {
  login,
  getMe,
  logout,
  getAdminDetections,
  getAdminDetectionById,
  verifyDetection,
  rejectDetection,
  deleteAdminDetection
};
