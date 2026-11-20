const LEVEL_UP_EVENT = 'userLeveledUp';
const SNAPSHOT_COMPLETED_EVENT = 'snapshotCompleted';

export type LevelUpEvent = {
  userId: string;
  guildId: string;
  channelId: string;
  level: number;
};

export type SnapshotCompletedEvent = {
  userId: string;
  maxHoursSingleGame: number;
};

export { LEVEL_UP_EVENT, SNAPSHOT_COMPLETED_EVENT };
