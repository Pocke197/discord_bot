import { Module } from '@nestjs/common';
import { NotifierService } from './notifier.service.js';

@Module({
  providers: [NotifierService],
  exports: [NotifierService],
})
export class NotifierModule {}
