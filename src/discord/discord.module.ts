import { Module } from '@nestjs/common';
import { DiscordUpdate } from './discord.update.js';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { LevelsModule } from './levels/levels.module.js';
import { SteamModule } from '../steam/steam.module.js';

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
  ],
  providers: [DiscordUpdate],
})
export class DiscordModule {}
