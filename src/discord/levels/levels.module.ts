import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module.js';
import { LevelsService } from './levels.service.js';

@Module({
  imports: [PrismaModule],
  providers: [LevelsService],
  exports: [LevelsService],
})
export class LevelsModule {}
