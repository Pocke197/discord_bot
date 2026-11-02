import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL ?? 'YOUR_BOT_TOKEN',
    });
    super({ adapter });
  }
}
