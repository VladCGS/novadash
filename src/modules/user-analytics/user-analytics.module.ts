import { HealthCheckModule } from '@app/common/modules/healthcheck/healthcheck.module';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { RmqMsBalanceService } from '@app/common/modules/rmq-transport/senders/rmq-ms-balance.service';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { RmqService } from '@app/common/modules/rmq/rmq.service';
import { UserTriggerModule } from '@app/common/modules/user-trigger/user-trigger.module';
import { Module } from '@nestjs/common';
import { UserAnalyticsController } from './user-analytics.controller';
import { UserAnalyticsService } from './user-analytics.service';

@Module({
  imports: [
    UserTriggerModule,
    RmqTransportModule,
    HealthCheckModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_BALANCES,
    }),
  ],
  controllers: [UserAnalyticsController],
  providers: [UserAnalyticsService, RmqService, RmqMsBalanceService],
})
export class UserAnalyticsModule {}
