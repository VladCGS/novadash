import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RmqService } from '@app/common/modules/rmq/rmq.service';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class HealthIndicatorController {
  private readonly logger = new Logger(HealthIndicatorController.name);

  constructor(private readonly rmqService: RmqService) {}

  @EventPattern(RMQ_EVENTS.alphaping.HEALTH_CHECK)
  check(@Payload() payload: string, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    this.logger.log(`Health check passed with payload: ${payload}`);
  }
}
