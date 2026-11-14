import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { LevelsService } from '../levels/levels.service.js';
import { getAvailablePoints, getAura } from '../stats/stats.utils.js';

export type Profile = {
  xp: number;
  level: number;
  luck: number;
  charisma: number;
  endurance: number;
  skill: number;
  availablePoints: number;
  aura: number;
};

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private levels: LevelsService,
  ) {}

  async getProfile(userId: string, guildId: string): Promise<Profile> {
    const profile = await this.prisma.member.findUnique({
      where: { guildId_userId: { guildId: guildId, userId: userId } },
    });

    const emptyProfile = {
      xp: 0,
      charisma: 0,
      luck: 0,
      skill: 0,
      endurance: 0,
    };

    const member = profile ?? emptyProfile;
    const memberStats = {
      luck: member.luck,
      charisma: member.charisma,
      endurance: member.endurance,
      skill: member.skill,
    };

    const level = await this.levels.getUserLevel(userId, guildId);

    const availablePoints = getAvailablePoints(level, memberStats);
    const aura = getAura(memberStats);

    return {
      xp: member.xp,
      level,
      ...memberStats,
      availablePoints,
      aura,
    };
  }
}
