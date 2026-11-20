import { ProfileService } from './profile.service.js';
import type { PrismaService } from '../../database/prisma.service.js';
import type { AchievementsService } from '../achievements/achievements.service.js';

describe('ProfileService', () => {
  it('returns level 1 with 60 current XP and 155 needed XP for 160 XP', async () => {
    const service = new ProfileService(
      {
        member: {
          findUnique: vi.fn().mockResolvedValue({
            xp: 160,
            luck: 0,
            charisma: 0,
            endurance: 0,
            skill: 0,
          }),
        },
      } as unknown as PrismaService,
      {
        getUnlockedAchievements: vi.fn().mockResolvedValue([]),
      } as unknown as AchievementsService,
    );

    const result = await service.getProfile('user-id', 'guild-id');

    expect(result).toEqual(
      expect.objectContaining({
        level: 1,
        currentXp: 60,
        neededXp: 155,
      }),
    );
  });

  it('returns an empty profile when the member does not exist', async () => {
    const service = new ProfileService(
      {
        member: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaService,
      {
        getUnlockedAchievements: vi.fn().mockResolvedValue([]),
      } as unknown as AchievementsService,
    );

    const result = await service.getProfile('user-id', 'guild-id');

    expect(result).toEqual(
      expect.objectContaining({
        level: 0,
        currentXp: 0,
        neededXp: 100,
        luck: 0,
        charisma: 0,
        endurance: 0,
        skill: 0,
        aura: 0,
      }),
    );
  });

  it('includes unlocked achievements in the profile', async () => {
    const achievement = {
      id: 'first-message',
      name: 'First Message',
      description: 'Send your first message',
    };
    const service = new ProfileService(
      {
        member: {
          findUnique: vi.fn().mockResolvedValue({
            xp: 0,
            luck: 0,
            charisma: 0,
            endurance: 0,
            skill: 0,
          }),
        },
      } as unknown as PrismaService,
      {
        getUnlockedAchievements: vi.fn().mockResolvedValue([achievement]),
      } as unknown as AchievementsService,
    );

    const result = await service.getProfile('user-id', 'guild-id');

    expect(result).toEqual(
      expect.objectContaining({
        achievements: [achievement],
      }),
    );
  });
});
