import * as Keychain from 'react-native-keychain';
import {createMMKV} from 'react-native-mmkv';

import {STORAGE_CONFIG} from '../constants';

type StorageMode = 'normal' | 'secure';

interface StorageOptions {
  mode?: StorageMode;
}

export class StorageService {

  private normalStorage = createMMKV({
    id: STORAGE_CONFIG.normalStorageId,
  });

  async get(key: string, options: StorageOptions = {}) {
    if (this.isSecure(options)) {
      return this.getSecureValue(key);
    }
    return this.normalStorage.getString(key);
  }

  async set(key: string, value: string, options: StorageOptions = {}) {
    if (this.isSecure(options)) {
      await this.setSecureValue(key, value);
      return;
    }

    this.normalStorage.set(key, value);
  }

  async remove(key: string, options: StorageOptions = {}) {
    if (this.isSecure(options)) {
      await this.removeSecureValue(key);
      return;
    }

    this.normalStorage.remove(key);
  }

  private isSecure(options: StorageOptions) {
    return options.mode === 'secure';
  }

  private getKeychainService(key: string) {
    return `${STORAGE_CONFIG.keychainServicePrefix}.${key}`;
  }

  private async getSecureValue(key: string) {
    const credentials = await Keychain.getGenericPassword({
      service: this.getKeychainService(key),
    });

    return credentials ? credentials.password : undefined;
  }

  private async setSecureValue(key: string, value: string) {
    await Keychain.setGenericPassword(key, value, {
      service: this.getKeychainService(key),
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
    });
  }

  private async removeSecureValue(key: string) {
    await Keychain.resetGenericPassword({
      service: this.getKeychainService(key),
    });
  }
}

export const storageService = new StorageService();
