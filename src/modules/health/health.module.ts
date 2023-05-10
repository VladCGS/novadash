import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { HealthIndicatorController } from './controllers/health-indicator.controller';

@Module({
  imports: [RmqModule],
  controllers: [HealthIndicatorController],
})
export class HealthModule {}
