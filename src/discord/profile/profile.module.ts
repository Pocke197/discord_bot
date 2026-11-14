import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { LevelsModule } from '../levels/levels.module.js';
import { PrismaModule } from '../../database/prisma.module.js';

@Module({
  imports: [LevelsModule, PrismaModule],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
