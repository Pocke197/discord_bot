import { Module } from '@nestjs/common';
import { DiscordUpdate } from './discord.update.js';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { LevelsModule } from './levels/levels.module.js';
import { SteamModule } from '../steam/steam.module.js';
import { SteamCommands } from './steam.commands.js';
import { SteamAuthModule } from '../steam/auth/steam-auth.module.js';
import { SteamAuthService } from '../steam/auth/steam-auth.service.js';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN ?? 'YOUR_BOT_TOKEN',
      intents: [
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds,
      ],
    }),
    LevelsModule,
    SteamModule,
    SteamAuthModule,
  ],
  providers: [DiscordUpdate, SteamCommands],
})
export class DiscordModule {}
