import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'discord.js';
import { NotifierService } from './notifier.service.js';

describe('NotifierService', () => {
  let service: NotifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifierService,
        {
          provide: Client,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<NotifierService>(NotifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
