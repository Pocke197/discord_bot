import { SlashCommand, Context } from 'necord';
import type { SlashCommandContext } from 'necord';
import { Injectable, Logger } from '@nestjs/common';
import { SteamService } from '../../steam/steam.service.js';
import { SteamAuthService } from '../../steam/auth/steam-auth.service.js';
import { formatLibrary } from '../../steam/library/steam-library.utils.js';

@Injectable()
export class BibliotecaCommands {
  private readonly logger = new Logger(BibliotecaCommands.name);
  constructor(
    private steamAuthService: SteamAuthService,
    private steamService: SteamService,
  ) {}
  @SlashCommand({
    name: 'biblioteca',
    description: 'View your Steam library',
  })
  public async biblioteca(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;

    await interaction.deferReply({});

    try {
      const steamId = await this.steamAuthService.getUserSteamId(userId);

      if (!steamId) {
        return interaction.editReply({
          content: 'You are not logged in to Steam. Use /steam-login first.',
        });
      }

      const games = await this.steamService.getOwnedGames(steamId);
      const formattedLibrary = formatLibrary(games);

      return interaction.editReply({
        content: formattedLibrary,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(
        'Error fetching the user from the database:',
        errorName,
      );

      return interaction.editReply({
        content: 'Unable to fetch your Steam library. Please try again later.',
      });
    }
  }
}
