import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// API endpoints

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id: string) => api.get(`/users/${id}`);
export const updateUser = (id: string, data: any) => api.put(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Events
export const getEvents = (params?: any) => api.get('/events', { params });
export const getEventById = (id: string) => api.get(`/events/${id}`);
export const createEvent = (data: any) => api.post('/events', data);
export const updateEvent = (id: string, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/events/${id}`);
export const approveEvent = (id: string) => api.post(`/events/${id}/approve`);
export const rejectEvent = (id: string) => api.post(`/events/${id}/reject`);
export const joinEvent = (id: string) => api.post(`/events/${id}/join`);
export const leaveEvent = (id: string) => api.delete(`/events/${id}/join`);

// Clubs
export const getClubs = (params?: any) => api.get('/clubs', { params });
export const getClubById = (id: string) => api.get(`/clubs/${id}`);
export const createClub = (data: any) => api.post('/clubs', data);
export const updateClub = (id: string, data: any) => api.put(`/clubs/${id}`, data);
export const deleteClub = (id: string) => api.delete(`/clubs/${id}`);
export const joinClub = (id: string) => api.post(`/clubs/${id}/join`);
export const leaveClub = (id: string) => api.delete(`/clubs/${id}/join`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id: string) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id: string) => api.delete(`/notifications/${id}`);

// Posts
export const getPosts = (params?: any) => api.get('/posts', { params });
export const getPostById = (id: string) => api.get(`/posts/${id}`);
export const createPost = (data: any) => api.post('/posts', data);
export const updatePost = (id: string, data: any) => api.put(`/posts/${id}`, data);
export const deletePost = (id: string) => api.delete(`/posts/${id}`);

// Admin
export const getDashboardStats = () => api.get('/admin/dashboard');

export default api; 