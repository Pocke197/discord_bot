import type { PrismaService } from '../../database/prisma.service.js';
import { RankService } from './rank.service.js';

describe('RankService', () => {
  const guildId = 'guild-1';
  let service: RankService;
  let prisma: {
    playtimeSnapshot: {
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      playtimeSnapshot: {
        findFirst: vi.fn().mockResolvedValue({ date: new Date('2026-11-21') }),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    service = new RankService(prisma as unknown as PrismaService);
  });

  it('devuelve un arreglo vacío sin buscar snapshots cuando no hay ninguno', async () => {
    prisma.playtimeSnapshot.findFirst.mockResolvedValue(null);

    const result = await service.getWeeklyRanking(guildId);

    expect(result).toEqual([]);
    expect(prisma.playtimeSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('consulta los snapshots de las fechas actual y anterior', async () => {
    await service.getWeeklyRanking(guildId);

    expect(
      prisma.playtimeSnapshot.findMany.mock.calls[0][0].where.date,
    ).toEqual(new Date('2026-11-21'));
    expect(
      prisma.playtimeSnapshot.findMany.mock.calls[1][0].where.date,
    ).toEqual(new Date('2026-11-14'));
  });

  it('filtra los snapshots por servidor', async () => {
    await service.getWeeklyRanking(guildId);

    expect(prisma.playtimeSnapshot.findMany).toHaveBeenCalledTimes(2);

    for (const call of prisma.playtimeSnapshot.findMany.mock.calls) {
      expect(call[0].where).toEqual(
        expect.objectContaining({
          user: { members: { some: { guildId } } },
        }),
      );
    }
  });

  it('calcula el ranking semanal', async () => {
    prisma.playtimeSnapshot.findMany
      .mockResolvedValueOnce([
        { userId: 'user-1', appId: 730, playtimeForever: 720 },
      ])
      .mockResolvedValueOnce([
        { userId: 'user-1', appId: 730, playtimeForever: 600 },
      ]);

    await expect(service.getWeeklyRanking(guildId)).resolves.toEqual([
      { userId: 'user-1', hours: 2 },
    ]);
  });

  it('propaga los errores de Prisma', async () => {
    const error = new Error('database error');
    prisma.playtimeSnapshot.findFirst.mockRejectedValue(error);

    await expect(service.getWeeklyRanking(guildId)).rejects.toThrow(error);
  });
});
