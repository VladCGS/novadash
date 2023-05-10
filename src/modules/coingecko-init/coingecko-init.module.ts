import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { InitCoingeckoIdAndSymbolService } from './services/init-coingecko-id-and-symbol.service';

@Module({
  imports: [
    StateManagerModule,
    RmqTransportModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
  ],
  providers: [InitCoingeckoIdAndSymbolService],
  exports: [InitCoingeckoIdAndSymbolService],
})
export class CoingeckoInitModule {}
