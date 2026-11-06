import { Module } from '@nestjs/common';
import { SteamAuthService } from './steam-auth.service.js';
import { SteamAuthController } from './steam-auth.controller.js';
import { PrismaModule } from '../../database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [SteamAuthService],
  exports: [SteamAuthService],
  controllers: [SteamAuthController],
})
export class SteamAuthModule {}
