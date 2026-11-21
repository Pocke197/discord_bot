import type { PlaytimeSnapshot } from '../../generated/prisma/client.js';
import { playtimeToHours } from '../../steam/library/steam-library.utils.js';

export type RankEntry = {
  userId: string;
  hours: number;
};

export type SnapshotPlaytime = Pick<
  PlaytimeSnapshot,
  'userId' | 'playtimeForever' | 'appId'
>;

export const calculateWeeklyRanking = (
  current: SnapshotPlaytime[],
  previous: SnapshotPlaytime[],
): RankEntry[] => {
  const previousMinutes = new Map<string, number>();
  for (const snapshot of previous) {
    previousMinutes.set(
      `${snapshot.userId}:${snapshot.appId}`,
      snapshot.playtimeForever,
    );
  }

  const usersWithPrevious = new Set<string>();
  for (const snapshot of previous) {
    usersWithPrevious.add(snapshot.userId);
  }

  const weeklyMinutes = new Map<string, number>();
  for (const snapshot of current) {
    if (!usersWithPrevious.has(snapshot.userId)) continue;

    const key = `${snapshot.userId}:${snapshot.appId}`;
    const previousPlaytime = previousMinutes.get(key) ?? 0;
    const weeklyPlaytime = Math.max(
      0,
      snapshot.playtimeForever - previousPlaytime,
    );

    const accumulated = weeklyMinutes.get(snapshot.userId) ?? 0;
    weeklyMinutes.set(snapshot.userId, accumulated + weeklyPlaytime);
  }

  return [...weeklyMinutes.entries()]
    .map(([userId, minutes]) => ({
      userId,
      hours: playtimeToHours(minutes),
    }))
    .filter((entry) => entry.hours > 0)
    .sort((a, b) => b.hours - a.hours);
};
