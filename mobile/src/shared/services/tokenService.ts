import {STORAGE_KEYS} from '../constants';
import {StorageService, storageService} from './storageService';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  constructor(private storage: StorageService) {}

  getAccessToken() {
    return this.storage.get(STORAGE_KEYS.accessToken, {secure: true});
  }

  getRefreshToken() {
    return this.storage.get(STORAGE_KEYS.refreshToken, {secure: true});
  }

  async setTokens(tokens: AuthTokens) {
    await Promise.all([
      this.storage.set(STORAGE_KEYS.accessToken, tokens.accessToken, {
        secure: true,
      }),
      this.storage.set(STORAGE_KEYS.refreshToken, tokens.refreshToken, {
        secure: true,
      }),
    ]);
  }

  async clearTokens() {
    await Promise.all([
      this.storage.remove(STORAGE_KEYS.accessToken, {secure: true}),
      this.storage.remove(STORAGE_KEYS.refreshToken, {secure: true}),
    ]);
  }
}

export const tokenService = new TokenService(storageService);
