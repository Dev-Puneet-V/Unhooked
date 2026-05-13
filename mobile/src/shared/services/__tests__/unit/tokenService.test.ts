import {STORAGE_KEYS} from '../../../constants';
import {AuthTokens, TokenService} from '../../tokenService';

const createStorage = () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
});

describe('TokenService', () => {
  it('reads access and refresh tokens from secure storage', async () => {
    const storage = createStorage();
    storage.get
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    const service = new TokenService(storage);

    await expect(service.getAccessToken()).resolves.toBe('access-token');
    await expect(service.getRefreshToken()).resolves.toBe('refresh-token');

    expect(storage.get).toHaveBeenNthCalledWith(1, STORAGE_KEYS.accessToken, {
      mode: 'secure',
    });
    expect(storage.get).toHaveBeenNthCalledWith(2, STORAGE_KEYS.refreshToken, {
      mode: 'secure',
    });
  });

  it('stores tokens in secure storage', async () => {
    const storage = createStorage();
    const service = new TokenService(storage);
    const tokens: AuthTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    await service.setTokens(tokens);

    expect(storage.set).toHaveBeenCalledWith(
      STORAGE_KEYS.accessToken,
      tokens.accessToken,
      {mode: 'secure'},
    );
    expect(storage.set).toHaveBeenCalledWith(
      STORAGE_KEYS.refreshToken,
      tokens.refreshToken,
      {mode: 'secure'},
    );
  });

  it('clears tokens from secure storage', async () => {
    const storage = createStorage();
    const service = new TokenService(storage);

    await service.clearTokens();

    expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.accessToken, {
      mode: 'secure',
    });
    expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.refreshToken, {
      mode: 'secure',
    });
  });
});
