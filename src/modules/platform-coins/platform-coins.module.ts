import { CoinGeckoModule } from '@app/common/modules/coingecko/coingecko.module';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { InitPlatformCoinsService } from './services/init-platform-coins.service';

@Module({
  imports: [
    RmqTransportModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
    CoinGeckoModule,
    StateManagerModule,
    CoinGeckoModule,
  ],
  providers: [InitPlatformCoinsService],
  exports: [InitPlatformCoinsService],
})
export class PlatformCoinsModule {}
