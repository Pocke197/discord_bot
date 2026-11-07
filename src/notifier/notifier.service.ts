import { Injectable } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
export class NotifierService {
  constructor(private discordClient: Client) {}

  async notifyUser(userId: string, message: string): Promise<boolean> {
    try {
      const user = await this.discordClient.users.fetch(userId);
      await user.send(message);

      return true;
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      console.error(`Failed to notify user with ID ${userId}:`, errorName);
    }
    return false;
  }
}
