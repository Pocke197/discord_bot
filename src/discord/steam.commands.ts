import { Injectable, Logger } from '@nestjs/common';
import { SteamAuthService } from '../steam/auth/steam-auth.service.js';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { MessageFlags } from 'discord.js';
import { SteamService } from '../steam/steam.service.js';

@Injectable()
export class SteamCommands {
  private readonly logger = new Logger(SteamCommands.name);

  constructor(
    private steamAuthService: SteamAuthService,
    private steamService: SteamService,
  ) {}

  @SlashCommand({
    name: 'steam-login',
    description: 'Login to Steam',
  })
  public async steamLogin(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;
    try {
      const token = await this.steamAuthService.createLinkToken(userId);
      const authUrl = this.steamAuthService.buildLoginUrl(token);

      return interaction.reply({
        content: `Please login to Steam using the following link: ${authUrl}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      this.logger.error('Error creating link token:', errorName);

      return interaction.reply({
        content: 'Failed to create Steam login URL. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  @SlashCommand({
    name: 'steam-status',
    description: 'Check your Steam login status',
  })
  public async steamStatus(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;

    try {
      const steamId = await this.steamAuthService.getUserSteamId(userId);

      if (steamId) {
        return interaction.reply({
          content: `You are logged in to Steam with Steam ID: ${steamId}`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          content: 'You are not logged in to Steam.',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error('Error fetching user from database:', errorName);

      return interaction.reply({
        content:
          'Failed to fetch your Steam login status. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  @SlashCommand({
    name: 'biblioteca',
    description: 'Check your Steam library',
  })
  public async biblioteca(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;

    await interaction.deferReply({});

    try {
      const steamId = await this.steamAuthService.getUserSteamId(userId);

      if (!steamId) {
        return interaction.editReply({
          content:
            'You are not logged in to Steam. Please use /steam-login first.',
        });
      }
      const games = await this.steamService.getOwnedGames(steamId);

      return interaction.editReply({
        content: `You own ${games.length} games on Steam.`,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error('Error fetching user from database:', errorName);

      return interaction.editReply({
        content: 'Failed to fetch your Steam library. Please try again later.',
      });
    }
  }
}
