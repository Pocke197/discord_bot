import { EmbedBuilder, User } from 'discord.js';
import type { Profile } from '../../profile/profile.service.js';

export function buildProfileEmbed(user: User, profile: Profile) {
  const xpForNextLevel = Math.max((profile.level + 1) * 100, profile.xp);
  const progress = Math.min(profile.xp / xpForNextLevel, 1);
  const progressBar = `${'█'.repeat(Math.round(progress * 12))}${'░'.repeat(
    12 - Math.round(progress * 12),
  )}`;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({
      name: user.username,
      iconURL: user.displayAvatarURL({ extension: 'png', size: 128 }),
    })
    .setTitle(`Level ${profile.level}`)
    .setThumbnail(
      user.displayAvatarURL({
        extension: 'png',
        size: 256,
      }),
    )
    .addFields(
      {
        name: 'XP',
        value: `${progressBar}\n${profile.xp} / ${xpForNextLevel} XP`,
        inline: false,
      },
      { name: 'Aura', value: profile.aura.toString(), inline: true },
      { name: 'Luck', value: profile.luck.toString(), inline: true },
      { name: 'Charisma', value: profile.charisma.toString(), inline: true },
      { name: 'Endurance', value: profile.endurance.toString(), inline: true },
      { name: 'Skill', value: profile.skill.toString(), inline: true },
    )
    .setFooter({
      text: `Available Points: ${profile.availablePoints.toString()}`,
    });

  const backgroundPicture = user.bannerURL({
    extension: 'png',
    size: 1024,
  });

  if (backgroundPicture) {
    embed.setImage(backgroundPicture);
  }

  return embed;
}
