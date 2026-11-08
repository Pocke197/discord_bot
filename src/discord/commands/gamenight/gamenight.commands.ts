import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GameNightDto } from './gamenight.dto.js';
import { parseMentionedUsersIds } from '../mentions/mentions.utils.js';
import { Logger } from '@nestjs/common';
import { SteamAuthService } from '../../../steam/auth/steam-auth.service.js';
import { SteamService } from '../../../steam/steam.service.js';
import type { SteamGame } from '../../../steam/steam.service.js';
import {
  formatCommonGames,
  getCommonGames,
} from '../../../steam/library/steam-library.utils.js';
import constants from '../../../constants.js';

@Injectable()
export class GameNightCommands {
  private readonly logger = new Logger(GameNightCommands.name);
  constructor(
    private steamAuthService: SteamAuthService,
    private steamService: SteamService,
  ) {}
  @SlashCommand({
    name: 'gamenight',
    description: 'Start a game night with your friends!',
  })
  public async gamenight(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: GameNightDto,
  ) {
    const userId = interaction.user.id;
    const mentionedUsers = [
      ...new Set([...parseMentionedUsersIds(options.users), userId]),
    ];

    await interaction.deferReply();

    if (mentionedUsers.length < 2) {
      return await interaction.editReply({
        content:
          'You need to mention at least one other user to start a game night.',
      });
    }

    try {
      const formattedMentionedUsers = mentionedUsers.map((id) => `<@${id}>`);

      const userNotLinked: string[] = [];
      const steamIds: string[] = [];

      for (const mentionedUserId of mentionedUsers) {
        const user =
          await this.steamAuthService.getUserSteamId(mentionedUserId);
        if (!user) {
          userNotLinked.push(`<@${mentionedUserId}>`);
          continue;
        }
        steamIds.push(user);
      }

      if (userNotLinked.length > 0) {
        return await interaction.editReply({
          content: `The following users are not linked to a Steam account: ${userNotLinked.join(', ')}. Please link your Steam account using /steam-login.`,
        });
      }

      const libraries: SteamGame[][] = [];
      for (const steamId of steamIds) {
        libraries.push(await this.steamService.getOwnedGames(steamId));
      }

      const commonGames = getCommonGames(libraries);

      if (commonGames.length === 0) {
        return await interaction.editReply({
          content: 'No common games found among the mentioned users.',
        });
      }

      const header = `Game night started! Inviting the following users: ${formattedMentionedUsers.join(', ')}`;
      const boundedHeader = header.slice(0, constants.LIMIT_CHARACTERS);
      const commonGamesHeader = '\n\nCommon games:\n';
      const availableCharacters = Math.max(
        0,
        constants.LIMIT_CHARACTERS -
          boundedHeader.length -
          commonGamesHeader.length,
      );
      const commonGamesText = formatCommonGames(
        commonGames,
        availableCharacters,
      );
      const content = commonGamesText
        ? `${boundedHeader}${commonGamesHeader}${commonGamesText}`
        : boundedHeader;

      await interaction.editReply({
        content: content.slice(0, constants.LIMIT_CHARACTERS),
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(
        `Error fetching the user from the database: ${errorName}`,
      );

      return interaction.editReply({
        content: 'Unable to fetch your Steam library. Please try again later.',
      });
    }
  }
}
