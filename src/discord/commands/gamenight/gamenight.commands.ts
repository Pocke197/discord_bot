import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GameNightDto } from './gamenight.dto.js';
import { parseMentionedUsersIds } from '../mentions/mentions.utils.js';
import { MessageFlags } from 'discord.js';

@Injectable()
export class GameNightCommands {
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

    if (mentionedUsers.length < 2) {
      return await interaction.reply({
        content:
          'You need to mention at least one other user to start a game night.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const formattedMentionedUsers = mentionedUsers.map((id) => `<@${id}>`);

    await interaction.reply({
      content: `Game night started! Inviting the following users: ${formattedMentionedUsers.join(', ')}`,
    });
  }
}
