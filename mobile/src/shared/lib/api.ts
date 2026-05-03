import axios, {AxiosError, AxiosRequestConfig} from 'axios';

import {
  API_CONFIG,
  API_ENDPOINTS,
  AUTH_HEADER,
  HTTP_STATUS,
} from '../constants';
import {tokenService} from '../services/tokenService';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeoutMs,
});

const withBearerToken = (token: string) => `${AUTH_HEADER.bearerPrefix} ${token}`;

const setAuthorizationHeader = (
  request: AxiosRequestConfig,
  accessToken: string,
) => {
  request.headers = {
    ...request.headers,
    [AUTH_HEADER.name]: withBearerToken(accessToken),
  };
};

api.interceptors.request.use(config => {
  const accessToken = tokenService.getAccessToken();

  if (accessToken?.trim()) {
    config.headers.Authorization = withBearerToken(accessToken);
  }

  return config;
});

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

api.interceptors.response.use(
  response => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== HTTP_STATUS.unauthorized ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            setAuthorizationHeader(originalRequest, token);
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        tokenService.clearTokens();
        return Promise.reject(error);
      }

      const response = await axios.post<RefreshResponse>(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.refresh}`,
        {refreshToken},
      );

      tokenService.setTokens(response.data);

      queue.forEach(request => request.resolve(response.data.accessToken));
      queue = [];

      setAuthorizationHeader(originalRequest, response.data.accessToken);

      return api(originalRequest);
    } catch (err) {
      queue.forEach(request => request.reject(err));
      queue = [];
      tokenService.clearTokens();

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
