import { Module } from '@nestjs/common';
import { SteamAuthService } from './steam-auth.service.js';
import { SteamAuthController } from './steam-auth.controller.js';
import { PrismaModule } from '../../database/prisma.module.js';
import { NotifierModule } from '../../notifier/notifier.module.js';

@Module({
  imports: [PrismaModule, NotifierModule],
  providers: [SteamAuthService],
  exports: [SteamAuthService],
  controllers: [SteamAuthController],
})
export class SteamAuthModule {}
