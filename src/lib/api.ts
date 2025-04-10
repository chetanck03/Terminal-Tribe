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
  try {
    // Get the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return config;
    }
    
    const token = data.session?.access_token;
    
    if (token) {
      console.log('Attaching auth token to request');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token available for request');
    }
  } catch (err) {
    console.error('Error in auth interceptor:', err);
  }
  
  return config;
});

// Add caching for dashboard stats to improve loading performance
let dashboardStatsCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

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
export const getDashboardStats = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (dashboardStatsCache && (now - lastFetchTime < CACHE_TTL)) {
    return { data: dashboardStatsCache };
  }
  
  try {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock dashboard data
    const mockData = {
      stats: {
        userCount: 1248,
        eventCount: 56,
        clubCount: 32,
        pendingEvents: 12
      },
      recentUsers: [
        { id: 1, name: "Jane Cooper", email: "jane@example.com", createdAt: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
        { id: 2, name: "Robert Smith", email: "robert@example.com", createdAt: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
        { id: 3, name: "Emily Johnson", email: "emily@example.com", createdAt: new Date(Date.now() - 259200000).toISOString() }, // 3 days ago
        { id: 4, name: "Michael Brown", email: "michael@example.com", createdAt: new Date(Date.now() - 345600000).toISOString() }, // 4 days ago
        { id: 5, name: "Sarah Davis", email: "sarah@example.com", createdAt: new Date(Date.now() - 432000000).toISOString() }, // 5 days ago
      ],
      recentEvents: [
        { id: 1, title: "Campus Tech Conference", createdBy: { name: "Tech Club" }, status: "APPROVED", date: new Date(Date.now() + 604800000).toISOString() }, // 7 days from now
        { id: 2, title: "Cultural Festival", createdBy: { name: "Cultural Society" }, status: "PENDING", date: new Date(Date.now() + 1209600000).toISOString() }, // 14 days from now
        { id: 3, title: "Career Fair", createdBy: { name: "Career Services" }, status: "APPROVED", date: new Date(Date.now() + 1814400000).toISOString() }, // 21 days from now
        { id: 4, title: "Sports Tournament", createdBy: { name: "Sports Club" }, status: "REJECTED", date: new Date(Date.now() + 2419200000).toISOString() }, // 28 days from now
        { id: 5, title: "Science Exhibition", createdBy: { name: "Science Club" }, status: "PENDING", date: new Date(Date.now() + 3024000000).toISOString() }, // 35 days from now
      ]
    };
    
    // Update cache
    dashboardStatsCache = mockData;
    lastFetchTime = now;
    
    return { data: mockData };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export default api; 