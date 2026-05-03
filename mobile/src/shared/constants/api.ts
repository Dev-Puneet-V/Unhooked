export const API_CONFIG = {
  baseURL: 'http://localhost:3000/api/v1',
  timeoutMs: 10000,
} as const;

export const API_ENDPOINTS = {
  auth: {
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
