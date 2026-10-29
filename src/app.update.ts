import { Injectable, Logger } from '@nestjs/common';
import { On, Once, Context } from 'necord';
import type { ContextOf } from 'necord';

@Injectable()
export class AppUpdate {
    private readonly logger = new Logger(AppUpdate.name);

    @Once('clientReady')
    public onReady(@Context() [client]: ContextOf<'clientReady'>): void {
        this.logger.log(`Bot logged in as ${client.user.username}`);
    }

    @On('warn')
    public onWarn(@Context() [message]: ContextOf<'warn'>): void {
        this.logger.warn(message);
    }
}