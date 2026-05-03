import {STORAGE_KEYS} from '../constants';
import {secureStorage} from '../lib/secureStorage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenService = {
  getAccessToken() {
    return secureStorage.getString(STORAGE_KEYS.accessToken);
  },

  getRefreshToken() {
    return secureStorage.getString(STORAGE_KEYS.refreshToken);
  },

  setTokens(tokens: AuthTokens) {
    secureStorage.set(STORAGE_KEYS.accessToken, tokens.accessToken);
    secureStorage.set(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  clearTokens() {
    secureStorage.remove(STORAGE_KEYS.accessToken);
    secureStorage.remove(STORAGE_KEYS.refreshToken);
  },
};
