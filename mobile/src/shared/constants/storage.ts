export const STORAGE_CONFIG = {
  normalStorageId: 'unhooked.normal',
  keychainServicePrefix: 'com.unhooked.mobile',
} as const;

export const STORAGE_AUTH_PROMPT = {
  title: 'Authenticate',
  subtitle: 'Confirm it is you',
  description: 'Use biometrics to access this secure data.',
  cancel: 'Cancel',
} as const;

export const STORAGE_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
} as const;
