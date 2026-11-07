import { SteamGame } from '../steam.service.js';
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

export {
  getTopGamesByPlaytime,
  notPlayedGames,
  playtimeToHours,
  formatLibrary,
};
