import { AaveV3EvmModule } from '@app/common/modules/aave-v3-evm/aave-v3-evm.module';
import { DataSupportedLendsBorrowsModule } from '@app/common/modules/data-supported-lends-borrows/data-supported-lends-borrows.module';
import { DataWalletModule } from '@app/common/modules/data-wallet/data.wallet.module';
import { LendingAssetsPageCommonModule } from '@app/common/modules/lending-borrowing-assets-common/lending-borrowing-assets-common.module';
import { PricedWalletModule } from '@app/common/modules/priced-wallet/priced-wallet.module';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { Module } from '@nestjs/common';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { BorrowingAssetsController } from './controller/borrowing-assets.controller';
import { LendingAssetsController } from './controller/lending-assets.controller';
import { BorrowingAssetsPageService } from './services/borrowing-assets-page.service';
import { InitLendingAssetsService } from './services/init-lending-assets.service';
import { LendingAssetsPageService } from './services/lending-assets-page.service';
import { UserAaveLendingAssetsService } from './services/user-aave-lending-assets.service';
import { UserCompoundLendingAssetsService } from './services/user-compound-lending-assets.service';
import { UserLendingAssetsUtilsService } from './services/user-lending-assets-utils.service';
import { UserLendingAssetsService } from './services/user-lending-assets.service';
import { Web3InfuraEvmModule } from '@app/common/modules/web3-infura-provider-evm/web3-infura-provider-evm.module';
import { CompoundV2EvmModule } from '@app/common/modules/compound-v2-evm/compound-v2-evm.module';
import { Web3DirectDataModule } from '@app/common/modules/web3-direct-data/web3-direct-data.module';

@Module({
  controllers: [LendingAssetsController, BorrowingAssetsController],
  imports: [
    Web3DirectDataModule,
    Web3InfuraEvmModule,
    StateManagerModule,
    RmqTransportModule,
    PricedWalletModule,
    LendingAssetsPageCommonModule,
    DataWalletModule,
    AaveV3EvmModule,
    DataSupportedLendsBorrowsModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
    CompoundV2EvmModule,
  ],
  providers: [
    InitLendingAssetsService,
    LendingAssetsPageService,
    BorrowingAssetsPageService,
    UserLendingAssetsService,
    UserLendingAssetsUtilsService,
    UserAaveLendingAssetsService,
    UserCompoundLendingAssetsService,
  ],
  exports: [InitLendingAssetsService],
})
export class LendingAssetsModule {}
