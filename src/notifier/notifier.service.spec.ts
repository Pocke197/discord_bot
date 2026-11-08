import { Client } from 'discord.js';
import { NotifierService } from './notifier.service.js';

describe('NotifierService', () => {
  const users = {
    fetch: vi.fn(),
  };
  const client = { users } as unknown as Client;
  const service = new NotifierService(client);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('notifies a user successfully', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    users.fetch.mockResolvedValue({ send });

    await expect(service.notifyUser('user-1', 'Hello')).resolves.toBe(true);

    expect(users.fetch).toHaveBeenCalledWith('user-1');
    expect(send).toHaveBeenCalledWith('Hello');
  });

  it.each([
    [
      'when fetching the user fails',
      () => Promise.reject(new Error('fetch failed')),
    ],
    [
      'when sending the message fails',
      () =>
        Promise.resolve({
          send: vi.fn().mockRejectedValue(new Error('send failed')),
        }),
    ],
  ])('returns false %s', async (_reason, createFetchResult) => {
    users.fetch.mockReturnValue(createFetchResult());

    await expect(service.notifyUser('user-1', 'Hello')).resolves.toBe(false);
  });
});
