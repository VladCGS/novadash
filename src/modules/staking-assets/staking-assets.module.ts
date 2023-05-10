import { DataSupportedStakingTokensModule } from '@app/common/modules/data-supported-staking-tokens/data-supported-staking-tokens.module';
import { PricedWalletModule } from '@app/common/modules/priced-wallet/priced-wallet.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { StakingAssetsController } from './controller/staking-assets.controller';
import { InitStakingAssetsService } from './service/init-staking-assets.service';
import { StakingAssetsPageService } from './service/staking-assets-page.service';

@Module({
  imports: [
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
    StateManagerModule,
    PricedWalletModule,
    DataSupportedStakingTokensModule,
  ],
  providers: [InitStakingAssetsService, StakingAssetsPageService],
  controllers: [StakingAssetsController],
  exports: [InitStakingAssetsService],
})
export class StakingAssetsModule {}
