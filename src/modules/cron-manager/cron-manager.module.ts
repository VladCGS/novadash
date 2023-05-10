import { CronModule } from '@app/common/modules/cron/cron.module';
import { ErrorMiddlewareModule } from '@app/common/modules/error-middleware/error-middleware.module';
import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { CronManagerController } from './controllers/cron-manager.controller';
import { CronManagerSetupService } from './services/cron-manager-setup.service';

@Module({
  imports: [
    ErrorMiddlewareModule,
    StateManagerModule,
    CronModule,
    StateManagerModule,
    AdminModule,
  ],
  providers: [CronManagerSetupService],
  controllers: [CronManagerController],
})
export class CronManagerModule {}
