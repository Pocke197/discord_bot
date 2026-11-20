import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { LevelsModule } from '../levels/levels.module.js';
import { PrismaModule } from '../../database/prisma.module.js';
import { AchievementsModule } from '../achievements/achievements.module.js';

@Module({
  imports: [LevelsModule, PrismaModule, AchievementsModule],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
