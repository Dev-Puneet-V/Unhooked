export const STORAGE_CONFIG = {
  secureStorageId: 'unhooked.secure.auth',
  encryptionKey: 'unhooked-mobile-auth-v1',
  encryptionType: 'AES-256',
} as const;

export const STORAGE_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
} as const;
