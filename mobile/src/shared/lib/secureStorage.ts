import {createMMKV} from 'react-native-mmkv';

import {STORAGE_CONFIG} from '../constants';

export const secureStorage = createMMKV({
  id: STORAGE_CONFIG.secureStorageId,
  encryptionKey: STORAGE_CONFIG.encryptionKey,
  encryptionType: STORAGE_CONFIG.encryptionType,
});
