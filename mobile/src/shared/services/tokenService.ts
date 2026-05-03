import {STORAGE_KEYS} from '../constants';
import {StorageService, storageService} from './storageService';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class TokenService {
  constructor(private storage: StorageService) {}

  getAccessToken() {
    return this.storage.get(STORAGE_KEYS.accessToken, {mode: 'secure'});
  }

  getRefreshToken() {
    return this.storage.get(STORAGE_KEYS.refreshToken, {mode: 'secure'});
  }

  async setTokens(tokens: AuthTokens) {
    await Promise.all([
      this.storage.set(STORAGE_KEYS.accessToken, tokens.accessToken, {
        mode: 'secure',
      }),
      this.storage.set(STORAGE_KEYS.refreshToken, tokens.refreshToken, {
        mode: 'secure',
      }),
    ]);
  }

  async clearTokens() {
    await Promise.all([
      this.storage.remove(STORAGE_KEYS.accessToken, {mode: 'secure'}),
      this.storage.remove(STORAGE_KEYS.refreshToken, {mode: 'secure'}),
    ]);
  }
}

export const tokenService = new TokenService(storageService);
