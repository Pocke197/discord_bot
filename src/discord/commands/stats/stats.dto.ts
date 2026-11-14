import { StringOption, IntegerOption } from 'necord';

export class StatsDto {
  @StringOption({
    name: 'stat',
    description: 'The stat you want to assign points to',
    required: true,
    choices: [
      { name: 'Endurance', value: 'endurance' },
      { name: 'Skill', value: 'skill' },
      { name: 'Luck', value: 'luck' },
      { name: 'Charisma', value: 'charisma' },
    ],
  })
  stat!: 'endurance' | 'skill' | 'luck' | 'charisma';

  @IntegerOption({
    name: 'amount',
    description: 'The amount of points to assign',
    required: true,
    min_value: 1,
  })
  amount!: number;
}
