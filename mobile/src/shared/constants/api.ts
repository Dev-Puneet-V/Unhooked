import {Platform} from 'react-native';

const localApiBaseURL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

export const API_CONFIG = {
  baseURL: localApiBaseURL,
  timeoutMs: 10000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    email: '/auth/email',
    google: '/auth/google',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
} as const;

export const HTTP_STATUS = {
  unauthorized: 401,
} as const;

export const AUTH_HEADER = {
  name: 'Authorization',
  bearerPrefix: 'Bearer',
} as const;
