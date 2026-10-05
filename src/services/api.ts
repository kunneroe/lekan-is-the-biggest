import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseApiError } from '../utils/parseApiError';

// Set your backend base URL here using EXPO_PUBLIC_API_URL environment variable.
// If not set, it defaults to localhost.
// Note: When running on a physical device or Android emulator, localhost will not work.
// You MUST set the LAN IP of your machine.
// Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api/v1 npx expo start
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

// Request interceptor to attach the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track whether a token refresh is already in-flight to avoid duplicate calls
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const friendlyMessage = parseApiError(error);
    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error [${status}]:`, data, '→', friendlyMessage);

      if (status === 401 && !originalRequest._retry) {
        // Avoid retrying the refresh endpoint itself
        if (originalRequest.url?.includes('/auth/refresh')) {
          console.warn('Refresh token invalid or expired — logging out');
          if (logoutHandler) logoutHandler();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Queue this request until refresh completes
          return new Promise((resolve) => {
            addRefreshSubscriber((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const { data: refreshData } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const newAccessToken: string = refreshData.accessToken;
          await AsyncStorage.setItem('userToken', newAccessToken);

          onRefreshed(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.warn('Token refresh failed — logging out');
          refreshSubscribers = [];
          if (logoutHandler) {
            logoutHandler();
          } else {
            await AsyncStorage.removeItem('userToken').catch(() => {});
            await AsyncStorage.removeItem('refreshToken').catch(() => {});
            await AsyncStorage.removeItem('userData').catch(() => {});
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    } else if (error.request) {
      console.error('API Error: Network unavailable →', friendlyMessage);
    } else {
      console.error('API Error: Request setup failed →', friendlyMessage);
    }

    return Promise.reject(error);
  }
);

export default api;
