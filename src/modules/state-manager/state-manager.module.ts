import { HealthCheckModule } from '@app/common/modules/healthcheck/healthcheck.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { Module } from '@nestjs/common';
import {
  StateChains,
  StateCoingeckoIdSymbol,
  StateExchangesOnOffRamp,
  StateExchangesSwap,
  StatePlatformCoins,
  StateSupportedPool,
  StateSupportedPoolCex,
  StateSupportedReserves,
  StateSupportedStablecoins,
  StateSupportedStakingTokens,
  StateToolsMeta,
} from './app-states/app-instances.state';
import { AppStatusesReaderController } from './controllers/app-statuses-reader.controller';
import { AppStatesStorageInitializerService } from './services/app-state-storage-initializer.service';
import { AppStatusesFormerService } from './services/app-statuses-former.service';
import { StateStorageInitializerService } from './services/state-storage-initializer.service';
import { StateStorageService } from './services/state-storage.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
    HealthCheckModule,
  ],
  providers: [
    StateToolsMeta,
    StateStorageService,
    StateStorageInitializerService,
    StateExchangesSwap,
    StateChains,
    StatePlatformCoins,
    StateExchangesOnOffRamp,
    AppStatesStorageInitializerService,
    StateCoingeckoIdSymbol,
    StateSupportedPool,
    StateSupportedPoolCex,
    AppStatusesFormerService,
    JwtService,
    StateSupportedReserves,
    StateSupportedStakingTokens,
    StateSupportedStablecoins
  ],
  exports: [
    StateToolsMeta,
    StateExchangesSwap,
    StateChains,
    StatePlatformCoins,
    StateExchangesOnOffRamp,
    StateCoingeckoIdSymbol,
    StateSupportedPool,
    StateSupportedPoolCex,
    StateSupportedReserves,
    StateSupportedStakingTokens,
    StateSupportedStablecoins
  ],
  controllers: [AppStatusesReaderController],
})
export class StateManagerModule {}
