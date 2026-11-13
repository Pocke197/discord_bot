import type { SteamGame } from '../steam.service.js';
import constants from '../../constants.js';

const getTopGamesByPlaytime = (
  games: SteamGame[],
  limit: number = constants.LIMIT_TOP_GAMES,
): SteamGame[] => {
  const sortedGames = [...games].sort(
    (a, b) => b.playtime_forever - a.playtime_forever,
  );
  return sortedGames.slice(0, limit);
};

const notPlayedGames = (games: SteamGame[]): SteamGame[] => {
  return games.filter((game) => game.playtime_forever === 0);
};

const playedGames = (games: SteamGame[]): SteamGame[] => {
  return games.filter((game) => game.playtime_forever > 0);
};

const playtimeToHours = (minutes: number): number => {
  return Math.round(minutes / 6) / 10;
};

const formatLibrary = (games: SteamGame[]): string => {
  if (games.length === 0) {
    return 'Your Steam profile is private or empty.';
  }

  const amountOfGames = games.length;
  const amountOfNotPlayedGames = notPlayedGames(games).length;
  const amountOfPlayedGames = amountOfGames - amountOfNotPlayedGames;

  const summary = `Total games: ${amountOfGames}\nPlayed games: ${amountOfPlayedGames}\nUnplayed games: ${amountOfNotPlayedGames}\n\n`;
  const heading = 'Most played games:\n';
  const topGamesFormatted = getTopGamesByPlaytime(games).map((game, index) => {
    const hours = playtimeToHours(game.playtime_forever);
    const gameName = game.name.slice(0, 50);
    return `${index + 1}. ${gameName} - ${hours} hours played`;
  });

  return summary + heading + topGamesFormatted.join('\n');
};

const getCommonGames = (libraries: SteamGame[][]): SteamGame[] => {
  if (libraries.length === 0) {
    return [];
  }

  const table = new Map<number, { game: SteamGame; count: number }>();

  for (const library of libraries) {
    for (const game of library) {
      if (table.has(game.appid)) {
        const entry = table.get(game.appid)!;
        entry.count++;
        entry.game.playtime_forever += game.playtime_forever;
      } else {
        table.set(game.appid, { game: { ...game }, count: 1 });
      }
    }
  }

  const commonGames = Array.from(table.values())
    .filter((entry) => entry.count === libraries.length)
    .map((entry) => entry.game)
    .sort((a, b) => b.playtime_forever - a.playtime_forever);

  return commonGames;
};

const formatCommonGames = (
  games: SteamGame[],
  maxCharacters: number,
): string => {
  const gamesToShow = games.slice(0, constants.LIMIT_COMMON_GAMES);
  const lines = gamesToShow.map(
    (game, index) => `${index + 1}. ${game.name.slice(0, 50)}`,
  );

  const format = (count: number) => {
    const omitted = games.length - count;
    const list = lines.slice(0, count).join('\n');
    return omitted > 0 ? `${list}\nand ${omitted} more` : list;
  };

  let count = 0;
  while (count < lines.length && format(count + 1).length <= maxCharacters) {
    count++;
  }

  return format(count).slice(0, maxCharacters);
};

export {
  getTopGamesByPlaytime,
  notPlayedGames,
  playedGames,
  playtimeToHours,
  formatLibrary,
  getCommonGames,
  formatCommonGames,
};
