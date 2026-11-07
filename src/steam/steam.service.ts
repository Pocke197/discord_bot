import { Injectable } from '@nestjs/common';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
}

interface OwnedGamesResponse {
  response: {
    game_count?: number;
    games: SteamGame[];
  };
}

@Injectable()
export class SteamService {
  async getOwnedGames(steamId: string): Promise<SteamGame[]> {
    if (!process.env.STEAM_API_KEY) {
      throw new Error('Steam API key is not set in environment variables');
    }

    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&format=json&include_played_free_games=true`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch owned games: ${response.statusText}`);
    }

    const data = (await response.json()) as OwnedGamesResponse;

    return data.response.games || [];
  }
}
