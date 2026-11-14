import { Module } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { PrismaModule } from '../../database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
