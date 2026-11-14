import { UserOption } from 'necord';
import type { User } from 'discord.js';

export class ProfileDto {
  @UserOption({
    name: 'user',
    description: 'The user you want to view the profile of',
    required: false,
  })
  user?: User;
}
