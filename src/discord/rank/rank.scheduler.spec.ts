import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';
import { RankScheduler } from './rank.scheduler.js';
import { RankService } from './rank.service.js';

describe('RankScheduler', () => {
  const getWeeklyRanking = vi.fn().mockResolvedValue([]);
  const rankService = {
    getWeeklyRanking,
  } as unknown as RankService;
  const fetchChannel = vi.fn();
  const client = {
    channels: { fetch: fetchChannel },
  } as unknown as Client;
  const getConfig = vi.fn().mockReturnValue('channel-1');
  const configService = {
    get: getConfig,
  } as unknown as ConfigService;
  let scheduler: RankScheduler;

  const makeChannel = (isDMBased = false) => ({
    isSendable: () => true,
    isDMBased: () => isDMBased,
    guildId: 'guild-1',
    send: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getConfig.mockReturnValue('channel-1');
    getWeeklyRanking.mockResolvedValue([]);
    scheduler = new RankScheduler(rankService, client, configService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch a channel when the variable is missing', async () => {
    getConfig.mockReturnValueOnce(undefined);

    await scheduler.sendWeeklySummary();

    expect(fetchChannel).not.toHaveBeenCalled();
  });

  it('does not get the ranking when the channel does not exist', async () => {
    fetchChannel.mockResolvedValueOnce(null);

    await scheduler.sendWeeklySummary();

    expect(getWeeklyRanking).not.toHaveBeenCalled();
  });

  it('does not send to a DM', async () => {
    const channel = makeChannel(true);
    fetchChannel.mockResolvedValueOnce(channel as never);
    const send = channel.send;

    await scheduler.sendWeeklySummary();

    expect(send).not.toHaveBeenCalled();
  });

  it('gets the guild ranking and sends the summary', async () => {
    const channel = makeChannel();
    fetchChannel.mockResolvedValueOnce(channel as never);
    const send = channel.send;

    await scheduler.sendWeeklySummary();

    expect(getWeeklyRanking).toHaveBeenCalledWith('guild-1');
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ embeds: expect.any(Array) }),
    );
  });

  it('does not throw when fetching the channel fails', async () => {
    fetchChannel.mockRejectedValueOnce(new Error('failed'));
    const errorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(scheduler.sendWeeklySummary()).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
