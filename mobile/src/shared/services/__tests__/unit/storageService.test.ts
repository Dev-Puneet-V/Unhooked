import * as Keychain from 'react-native-keychain';
import {createMMKV} from 'react-native-mmkv';

import {STORAGE_CONFIG} from '../../../constants';
import {StorageService} from '../../storageService';

const createStorage = () => {
  const normalStorage = {
    getString: jest.fn(),
    remove: jest.fn(),
    set: jest.fn(),
  };

  jest.mocked(createMMKV).mockReturnValue(normalStorage);

  return {
    normalStorage,
    service: new StorageService(),
  };
};

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates normal MMKV storage with the configured id', () => {
    createStorage();

    expect(createMMKV).toHaveBeenCalledWith({
      id: STORAGE_CONFIG.normalStorageId,
    });
  });

  it('reads and writes normal values through MMKV', async () => {
    const {normalStorage, service} = createStorage();
    normalStorage.getString.mockReturnValue('normal-value');

    await expect(service.get('home.cache')).resolves.toBe('normal-value');
    await service.set('home.cache', 'new-value');
    await service.remove('home.cache');

    expect(normalStorage.getString).toHaveBeenCalledWith('home.cache');
    expect(normalStorage.set).toHaveBeenCalledWith('home.cache', 'new-value');
    expect(normalStorage.remove).toHaveBeenCalledWith('home.cache');
  });

  it('reads secure values through Keychain service names', async () => {
    const {normalStorage, service} = createStorage();
    jest.mocked(Keychain.getGenericPassword).mockResolvedValue({
      password: 'secure-value',
      service: `${STORAGE_CONFIG.keychainServicePrefix}.auth.accessToken`,
      username: 'auth.accessToken',
    });

    await expect(
      service.get('auth.accessToken', {mode: 'secure'}),
    ).resolves.toBe('secure-value');

    expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
      service: `${STORAGE_CONFIG.keychainServicePrefix}.auth.accessToken`,
    });
    expect(normalStorage.getString).not.toHaveBeenCalled();
  });

  it('stores secure values through Keychain', async () => {
    const {normalStorage, service} = createStorage();

    await service.set('auth.refreshToken', 'refresh-token', {mode: 'secure'});

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'auth.refreshToken',
      'refresh-token',
      {
        service: `${STORAGE_CONFIG.keychainServicePrefix}.auth.refreshToken`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    );
    expect(normalStorage.set).not.toHaveBeenCalled();
  });

  it('removes secure values through Keychain', async () => {
    const {normalStorage, service} = createStorage();

    await service.remove('auth.refreshToken', {mode: 'secure'});

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: `${STORAGE_CONFIG.keychainServicePrefix}.auth.refreshToken`,
    });
    expect(normalStorage.remove).not.toHaveBeenCalled();
  });
});
