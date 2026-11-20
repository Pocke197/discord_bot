export type AchievementDefinition = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  scope: 'global' | 'local';
  metric: 'level' | 'hours-single-game';
  threshold: number;
};

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'level-5',
    name: 'Learner',
    description: 'Reach level 5',
    emoji: '🥉',
    scope: 'local',
    metric: 'level',
    threshold: 5,
  },
  {
    id: 'level-10',
    name: 'Veteran',
    description: 'Reach level 10',
    emoji: '🥈',
    scope: 'local',
    metric: 'level',
    threshold: 10,
  },
  {
    id: 'level-15',
    name: 'Legend',
    description: 'Reach level 15',
    emoji: '🥇',
    scope: 'local',
    metric: 'level',
    threshold: 15,
  },
  {
    id: 'game-100-hours',
    name: 'Fanatic',
    description: 'Reach 100 hours in a single game',
    emoji: '🎮',
    scope: 'global',
    metric: 'hours-single-game',
    threshold: 100,
  },
  {
    id: 'game-500-hours',
    name: 'No social life',
    description: 'Reach 500 hours in a single game',
    emoji: '🕹️',
    scope: 'global',
    metric: 'hours-single-game',
    threshold: 500,
  },
];
