import { EmbedBuilder, type User } from 'discord.js';
import { buildProfileEmbed } from './profile.embed.js';
import {
  ACHIEVEMENTS,
  type AchievementDefinition,
} from '../../achievements/achievements.definitions.js'

type Profile = Parameters<typeof buildProfileEmbed>[1];

const profile: Profile = {
  level: 1,
  xp: 300,
  currentXp: 154,
  neededXp: 155,
  aura: 13,
  luck: 2,
  charisma: 4,
  endurance: 6,
  skill: 8,
  availablePoints: 7,
  achievements: [],
};

const achievements: AchievementDefinition[] = [
  {
    id: 'a',
    name: 'A',
    description: 'A',
    emoji: '🏆',
    scope: 'local',
    metric: 'level',
    threshold: 5,
  },
  {
    id: 'b',
    name: 'B',
    description: 'B',
    emoji: '🎉',
    scope: 'local',
    metric: 'level',
    threshold: 10,
  },
];

const createUser = (banner?: string) =>
  ({
    username: 'test-user',
    displayAvatarURL: vi.fn(() => 'https://example.com/avatar.png'),
    bannerURL: vi.fn(() => banner),
  }) as unknown as User;

describe('buildProfileEmbed', () => {
  it('returns a Discord embed with the profile data', () => {
    const embed = buildProfileEmbed(createUser(), profile);

    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(embed.data.author?.name).toBe('test-user');
    expect(embed.data.title).toBe('Level 1');
    expect(embed.data.thumbnail?.url).toBe('https://example.com/avatar.png');
    const xpField = embed.data.fields?.find((field) => field.name === 'XP');
    const auraField = embed.data.fields?.find((field) => field.name === 'Aura');

    expect(xpField?.value).toContain('154 / 155');
    expect(auraField?.value).toBe('13');
    expect(embed.data.footer?.text).toContain('7');
    expect(embed.data.image).toBeUndefined();
  });

  it('adds the banner when the user has one', () => {
    const embed = buildProfileEmbed(
      createUser('https://example.com/banner.png'),
      profile,
    );

    expect(embed.data.image?.url).toBe('https://example.com/banner.png');
  });

  it('shows an empty XP bar when current XP is zero', () => {
    const embed = buildProfileEmbed(createUser(), {
      ...profile,
      currentXp: 0,
    });
    const xpField = embed.data.fields?.find((field) => field.name === 'XP');

    expect(xpField?.value).toContain('0 / 155');
    expect(xpField?.value).not.toContain('█');
  });

  it('does not show a full XP bar at 154 / 155', () => {
    const embed = buildProfileEmbed(createUser(), profile);
    const xpField = embed.data.fields?.find((field) => field.name === 'XP');

    expect(xpField?.value).toContain('154 / 155');
    expect(xpField?.value).toContain('░');
  });

  it('shows two achievements and their count', () => {
    const embed = buildProfileEmbed(createUser(), {
      ...profile,
      achievements,
    });
    const achievementsField = embed.data.fields?.find((field) =>
      field.name.startsWith('Achievements'),
    );

    expect(achievementsField?.name).toContain(`(2/${ACHIEVEMENTS.length})`);
    expect(achievementsField?.value).toContain('🏆');
    expect(achievementsField?.value).toContain('🎉');
  });

  it('shows None yet when there are no achievements', () => {
    const embed = buildProfileEmbed(createUser(), profile);
    const achievementsField = embed.data.fields?.find((field) =>
      field.name.startsWith('Achievements'),
    );

    expect(achievementsField?.value).toBe('None yet');
  });
});
