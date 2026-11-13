import { SteamSnapshotsService } from './steam-snapshots.service.js';
import type { PrismaService } from '../../database/prisma.service.js';
import type { SteamGame, SteamService } from '../steam.service.js';

describe('SteamSnapshotsService', () => {
  const upsert =
    vi.fn<
      (args: { where: { userId_appId_date: { date: Date } } }) => unknown
    >();
  const findMany =
    vi.fn<() => Promise<Array<{ id: string; steamId: string }>>>();
  const getOwnedGames = vi.fn<() => Promise<SteamGame[]>>();

  const prisma = {
    user: { findMany },
    playtimeSnapshot: { upsert },
  } as unknown as PrismaService;

  const steam = { getOwnedGames } as unknown as SteamService;
  let service: SteamSnapshotsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SteamSnapshotsService(prisma, steam);
    findMany.mockResolvedValue([
      { id: 'user-1', steamId: 'steam-user-1' },
      { id: 'user-2', steamId: 'steam-user-2' },
    ]);
    getOwnedGames.mockResolvedValue([
      { appid: 10, name: 'Played', playtime_forever: 42 },
      { appid: 20, name: 'Not played', playtime_forever: 0 },
    ]);
  });

  it('guarda una fila por cada juego jugado', async () => {
    await service.takeDailySnapshot();

    expect(upsert).toHaveBeenCalledTimes(2);
  });

  it('usa la misma fecha en todos los upsert', async () => {
    await service.takeDailySnapshot();

    const dates = upsert.mock.calls.map(([args]) =>
      args.where.userId_appId_date.date.getTime(),
    );

    expect(dates.length).toBeGreaterThan(0);
    expect(new Set(dates).size).toBe(1);
  });

  it('continúa con el siguiente usuario si Steam falla', async () => {
    getOwnedGames
      .mockRejectedValueOnce(new Error('Steam unavailable'))
      .mockResolvedValueOnce([
        { appid: 30, name: 'Played', playtime_forever: 10 },
      ]);

    await service.takeDailySnapshot();

    expect(getOwnedGames).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it('no llama a Steam si no hay usuarios vinculados', async () => {
    findMany.mockResolvedValue([]);

    await service.takeDailySnapshot();

    expect(getOwnedGames).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });
});
