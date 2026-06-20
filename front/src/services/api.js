import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

export const analyzeImage = async (formData) => {
  const response = await api.post('/detections/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getDetections = async () => {
  const response = await api.get('/detections');
  return response.data;
};

export const getDetectionById = async (id) => {
  const response = await api.get(`/detections/${id}`);
  return response.data;
};

export const deleteDetection = async (id) => {
  const response = await api.delete(`/detections/${id}`);
  return response.data;
};

export default {
  analyzeImage,
  getDetections,
  getDetectionById,
  deleteDetection
};
