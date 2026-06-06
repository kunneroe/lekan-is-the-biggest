import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error [${status}]:`, data);

      if (status === 401) {
        // Handle unauthorized (e.g., token expired, invalid token)
        console.warn('Unauthorized access - potential token expiration');
        if (logoutHandler) {
          logoutHandler();
        } else {
          // Fallback if context not mounted
          AsyncStorage.removeItem('userToken').catch(() => {});
          AsyncStorage.removeItem('refreshToken').catch(() => {});
          AsyncStorage.removeItem('userData').catch(() => {});
        }
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error: Request setup failed', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
