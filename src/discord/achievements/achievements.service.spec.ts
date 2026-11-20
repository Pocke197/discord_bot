import type { PrismaService } from '../../database/prisma.service.js';
import { ACHIEVEMENTS } from './achievements.definitions.js';
import { AchievementsService } from './achievements.service.js';

describe('AchievementsService', () => {
  const userId = 'user-1';
  const guildId = 'guild-1';
  let service: AchievementsService;
  let prisma: {
    memberAchievement: {
      findMany: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
    };
  };

  const achievementsUpTo = (level: number) =>
    ACHIEVEMENTS.filter(
      ({ metric, threshold }) => metric === 'level' && threshold <= level,
    );

  beforeEach(() => {
    prisma = {
      memberAchievement: {
        findMany: vi.fn().mockResolvedValue([]),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };
    service = new AchievementsService(prisma as unknown as PrismaService);
  });

  it('crea y devuelve los logros de nivel 5 y 10 cuando no hay logros previos', async () => {
    const expected = achievementsUpTo(10);

    const result = await service.checkLevelAchievements(userId, guildId, 10);

    expect(result.map(({ id }) => id)).toEqual(['level-5', 'level-10']);
    expect(prisma.memberAchievement.createMany).toHaveBeenCalledWith({
      data: expected.map(({ id }) => ({ userId, guildId, achievementId: id })),
      skipDuplicates: true,
    });
    expect(result).toEqual(expected);
  });

  it('solo crea el logro de nivel 10 si level-5 ya fue guardado', async () => {
    prisma.memberAchievement.findMany.mockResolvedValue([
      { achievementId: 'level-5' },
    ]);
    const expected = achievementsUpTo(10).filter(({ id }) => id === 'level-10');

    const result = await service.checkLevelAchievements(userId, guildId, 10);

    expect(prisma.memberAchievement.createMany).toHaveBeenCalledWith({
      data: expected.map(({ id }) => ({ userId, guildId, achievementId: id })),
      skipDuplicates: true,
    });
    expect(result).toEqual(expected);
  });

  it('no crea logros para nivel 3 y devuelve un arreglo vacío', async () => {
    const result = await service.checkLevelAchievements(userId, guildId, 3);

    expect(prisma.memberAchievement.createMany).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('usa skipDuplicates al crear logros', async () => {
    await service.checkLevelAchievements(userId, guildId, 10);

    expect(prisma.memberAchievement.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ skipDuplicates: true }),
    );
  });
});
