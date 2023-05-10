import { DataSupportedPoolsModule } from '@app/common/modules/data-supported-pools/data-supported-pools.module';
import { DataWalletModule } from '@app/common/modules/data-wallet/data.wallet.module';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { UniswapPoolsModule } from '@app/common/modules/uniswap-pools/uniswap-pools.module';
import { forwardRef, Module } from '@nestjs/common';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { LiquidityPoolsUserPositionsController } from './controller/liquidity-pools-user-positions.controller';
import { LiquidityPoolsController } from './controller/liquidity-pools.controller';
import { InitSupportedPoolService } from './service/init-supported-pool.service';
import { LendingPoolsPageService } from './service/lending-pools-page.service';
import { UserPoolsPositionsService } from './service/user-pools-positions.service';
import { JwtService } from '@nestjs/jwt';
import { InitSupportedPoolCexService } from './service/init-supported-pool-cex.service';

@Module({
  imports: [
    forwardRef(() => UniswapPoolsModule),
    StateManagerModule,
    RmqTransportModule,
    DataWalletModule,
    DataSupportedPoolsModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
  ],
  controllers: [
    LiquidityPoolsController,
    LiquidityPoolsUserPositionsController,
  ],
  providers: [
    InitSupportedPoolService,
    InitSupportedPoolCexService,
    LendingPoolsPageService,
    UserPoolsPositionsService,
    JwtService,
  ],
  exports: [
    InitSupportedPoolService,
    InitSupportedPoolCexService,
    LendingPoolsPageService,
  ],
})
export class LiquidityPoolsModule {}
