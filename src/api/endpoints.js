import apiClient from './client';

// ==================== AUTH ====================

export const authAPI = {
  login: (username, password, telegramId = null) => {
    const params = new URLSearchParams({ username, password });
    const url = telegramId ? `/token?tgid=${telegramId}` : '/token';
    return apiClient.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  refresh: (refreshToken) =>
    apiClient.post('/refresh', { refresh_token: refreshToken }),

  logout: (refreshToken = null) => {
    // accessToken is already injected by apiClient interceptor
    return apiClient.post('/logout', { refresh_token: refreshToken });
  },

  getMe: () => apiClient.get('/users/me'),

  changePassword: (currentPassword, newPassword) =>
    apiClient.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

// ==================== USERS ====================

export const usersAPI = {
  getMe: () => apiClient.get('/users/me'),

  getAll: (role = null, groupNumber = null) => {
    const params = {};
    if (role) params.role = role;
    if (groupNumber) params.group_number = groupNumber;
    return apiClient.get('/users/', { params });
  },

  create: (userData) => apiClient.post('/users/', userData),

  update: (userId, userData) => apiClient.put(`/users/${userId}`, userData),

  delete: (userId) => apiClient.delete(`/users/${userId}`),

  updateNotificationSettings: (settings) =>
    apiClient.put('/users/me/notification-settings', {
      notification_settings: JSON.stringify(settings),
    }),
};

// ==================== SCHEDULES ====================

export const schedulesAPI = {
  getAll: (groupNumber = null, week = null) => {
    const params = {};
    if (groupNumber) params.group_number = groupNumber;
    if (week) params.week = week; // 'current' or 'next'
    return apiClient.get('/schedules/', { params });
  },

  create: (scheduleData) => apiClient.post('/schedules/', scheduleData),

  update: (scheduleId, scheduleData) =>
    apiClient.put(`/schedules/${scheduleId}`, scheduleData),

  delete: (scheduleId) => apiClient.delete(`/schedules/${scheduleId}`),
};

// ==================== EVENTS ====================

export const eventsAPI = {
  getAll: (groupNumber = null) => {
    const params = {};
    if (groupNumber) params.group_number = groupNumber;
    return apiClient.get('/events/', { params });
  },

  create: (eventData) => apiClient.post('/events/', eventData),

  update: (eventId, eventData) =>
    apiClient.put(`/events/${eventId}`, eventData),

  delete: (eventId) => apiClient.delete(`/events/${eventId}`),
};

// ==================== CHAT ====================

export const chatAPI = {
  getMyChats: () => apiClient.get('/my-chats'),

  getTeachers: () => apiClient.get('/teachers'),

  getChatHistory: (roomId, limit = 50, offset = 0) =>
    apiClient.get(`/chat/history/${roomId}`, {
      params: { limit, offset },
    }),

  getOnlineUsers: (roomId) => apiClient.get(`/chat/online/${roomId}`),
};

// ==================== WEBSOCKET CHAT ====================

export const createWebSocketChat = (roomId, accessToken) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  
  // Get API base URL or default to localhost:8000
  let apiBase = import.meta.env.VITE_API_BASE_URL || 'https://timeofthestars.online';
  
  // Remove protocol prefix from the URL
  let host = apiBase.replace(/^(https?|wss?):\/\//, '');
  
  const wsUrl = `${protocol}://${host}:4443/ws/chat?room=${encodeURIComponent(roomId)}&token=${encodeURIComponent(accessToken)}`;
  return new WebSocket(wsUrl);
};

export default {
  auth: authAPI,
  users: usersAPI,
  schedules: schedulesAPI,
  events: eventsAPI,
  chat: chatAPI,
  createWebSocketChat,
};
