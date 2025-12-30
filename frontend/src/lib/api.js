import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Trips API
export const tripsAPI = {
  create: (tripData) => api.post('/trips/plan', tripData),
  getById: (id) => api.get(`/trips/${id}`),
  getUserTrips: (userId) => api.get(`/trips/user/${userId}`),
  update: (id, tripData) => api.put(`/trips/${id}`, tripData),
  delete: (id) => api.delete(`/trips/${id}`),
};

// Recommendations API
export const recommendationsAPI = {
  getItinerary: (data) => api.post('/recommendations/itinerary', data),
  getHotels: (data) => api.post('/recommendations/hotels', data),
  getTours: (data) => api.post('/recommendations/tours', data),
};

// Users API
export const usersAPI = {
  getPreferences: (userId) => api.get(`/users/${userId}/preferences`),
  updatePreferences: (userId, preferences) => 
    api.put(`/users/${userId}/preferences`, preferences),
  linkTelegram: (userId, telegramId) => 
    api.post(`/users/${userId}/telegram`, { telegramId }),
};

export default api;


