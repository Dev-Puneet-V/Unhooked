/* eslint-disable no-dupe-class-members */
import * as Keychain from 'react-native-keychain';
import {createMMKV} from 'react-native-mmkv';

import {STORAGE_AUTH_PROMPT, STORAGE_CONFIG} from '../constants';

interface StorageOptions {
  secure?: boolean;
  biometric?: boolean;
}

type SecureStorageOptions = StorageOptions & {secure: true};
type BiometricStorageOptions = SecureStorageOptions & {biometric: true};

export class StorageService {
  private normalStorage = createMMKV({
    id: STORAGE_CONFIG.normalStorageId,
  });

  async get(key: string): Promise<string | undefined>;
  async get(
    key: string,
    options: SecureStorageOptions,
  ): Promise<string | undefined>;
  async get(
    key: string,
    options: BiometricStorageOptions,
  ): Promise<string | undefined>;
  async get(key: string, options: StorageOptions = {}) {
    if (this.isSecure(options)) {
      return this.getSecureValue(key, options);
    }

    return this.normalStorage.getString(key);
  }

  async set(key: string, value: string): Promise<void>;
  async set(
    key: string,
    value: string,
    options: SecureStorageOptions,
  ): Promise<void>;
  async set(
    key: string,
    value: string,
    options: BiometricStorageOptions,
  ): Promise<void>;
  async set(key: string, value: string, options: StorageOptions = {}) {
    if (this.isSecure(options)) {
      await this.setSecureValue(key, value, options);
      return;
    }

    this.normalStorage.set(key, value);
  }

  async remove(key: string): Promise<void>;
  async remove(key: string, options: SecureStorageOptions): Promise<void>;
  async remove(key: string, options: BiometricStorageOptions): Promise<void>;
  async remove(key: string, options: StorageOptions = {}) {
    if (this.isSecure(options)) {
      await this.removeSecureValue(key);
      return;
    }

    this.normalStorage.remove(key);
  }

  getSupportedBiometryType() {
    return Keychain.getSupportedBiometryType();
  }

  async isBiometricAvailable() {
    return (await this.getSupportedBiometryType()) !== null;
  }

  private isSecure(options: StorageOptions) {
    return options.secure === true;
  }

  private isBiometricProtected(options: StorageOptions) {
    return options.biometric === true;
  }

  private getKeychainService(key: string) {
    return `${STORAGE_CONFIG.keychainServicePrefix}.${key}`;
  }

  private async getSecureValue(key: string, options: StorageOptions) {
    const credentials = await Keychain.getGenericPassword({
      service: this.getKeychainService(key),
      ...this.getBiometricKeychainOptions(options),
    });

    return credentials ? credentials.password : undefined;
  }

  private async setSecureValue(
    key: string,
    value: string,
    options: StorageOptions,
  ) {
    if (this.isBiometricProtected(options)) {
      await this.assertBiometricAvailable();
    }

    await Keychain.setGenericPassword(key, value, {
      service: this.getKeychainService(key),
      ...this.getBiometricKeychainOptions(options),
    });
  }

  private async removeSecureValue(key: string) {
    await Keychain.resetGenericPassword({
      service: this.getKeychainService(key),
    });
  }

  private getBiometricKeychainOptions(options: StorageOptions) {
    if (!this.isBiometricProtected(options)) {
      return {};
    }

    return {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      authenticationPrompt: STORAGE_AUTH_PROMPT,
    };
  }

  private async assertBiometricAvailable() {
    const biometryType = await this.getSupportedBiometryType();

    if (!biometryType) {
      throw new Error('Biometric authentication is not available on this device.');
    }
  }
}

export const storageService = new StorageService();
