import { Module } from '@nestjs/common';
import { DiscordUpdate } from './discord.update.js';
import { NecordModule } from 'necord';
import { ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { LevelsModule } from './levels/levels.module.js';
import { SteamModule } from '../steam/steam.module.js';
import { BibliotecaCommands } from './commands/library.commands.js';
import { SteamLinkCommands } from './commands/steam-link.commands.js';
import { SteamAuthModule } from '../steam/auth/steam-auth.module.js';
import { GameNightCommands } from './commands/gamenight/gamenight.commands.js';
import { ProfileCommands } from './commands/profile/profile.commands.js';
import { ProfileModule } from './profile/profile.module.js';
import { StatsModule } from './stats/stats.module.js';
import { StatsCommands } from './commands/stats/stats.command.js';
import { AchievementsModule } from './achievements/achievements.module.js';

@Module({
  imports: [
    NecordModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow<string>('DISCORD_BOT_TOKEN'),
        intents: [
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.Guilds,
        ],
      }),
    }),
    LevelsModule,
    SteamModule,
    SteamAuthModule,
    ProfileModule,
    StatsModule,
    AchievementsModule,
  ],
  providers: [
    DiscordUpdate,
    BibliotecaCommands,
    SteamLinkCommands,
    GameNightCommands,
    ProfileCommands,
    StatsCommands,
  ],
})
export class DiscordModule {}
