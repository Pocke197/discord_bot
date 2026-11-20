const LEVEL_UP_EVENT = 'userLeveledUp';

export type LevelUpEvent = {
  userId: string;
  guildId: string;
  channelId: string;
  level: number;
};

export { LEVEL_UP_EVENT };
