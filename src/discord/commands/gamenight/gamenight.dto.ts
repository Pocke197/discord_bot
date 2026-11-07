import { StringOption } from 'necord';

export class GameNightDto {
  @StringOption({
    name: 'users',
    description:
      'Mention the users you want to invite to the game night (separated by commas)',
    required: true,
  })
  users!: string;
}
