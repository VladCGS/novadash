import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { DataSupportedPoolsModule } from '@app/common/modules/data-supported-pools/data-supported-pools.module';
import { RedisModule } from '@app/common/modules/redis/redis.module';
import { UniswapPoolsModule } from '@app/common/modules/uniswap-pools/uniswap-pools.module';
import { UniswapV3EvmModule } from '@app/common/modules/uniswap-v3-evm/uniswap-v3-evm.module';
import { Module } from '@nestjs/common';
import { UniswapV3PoolsLiquidityIncreasingController } from './controllers/uniswap-v3-pools-liquidity-increasing.controller';
import { UniswapV3PoolsLiquidityProvidingController } from './controllers/uniswap-v3-pools-liquidity-providing.controller';
import { UniswapV3PoolsLiquidityWithdrawingController } from './controllers/uniswap-v3-pools-liquidity-withdrawing.controller';
import { SocketPoolsDynamicCalculation } from './gateway/socket-pools-dynamic-calculate.gateway';
import { UniswapV3DynamicCalculateService } from './services/uniswap-v3-dynamic-calculate.service';
import { UniswapV3FormAddLiquidityTransactionService } from './services/uniswap-v3-form-add-liquidity-transaction.service';
import { UniswapV3FormClaimFeeTransactionService } from './services/uniswap-v3-form-claim-fee-transaction.service';
import { UniswapV3FormRemoveLiquidityTransactionService } from './services/uniswap-v3-form-remove-liquidity-transaction.service';
import { UniswapLiquidityCommonService } from './services/uniswap-v3-liquidity-common.service';
import { UniswapV3LiquidityIncreasingService } from './services/uniswap-v3-liquidity-increasing.service';
import { UniswapV3LiquidityProvidingService } from './services/uniswap-v3-liquidity-providing.service';
import { UniswapV3LiquidityWithdrawingService } from './services/uniswap-v3-liquidity-withdrawing.service';
import { DataWalletModule } from '@app/common/modules/data-wallet/data.wallet.module';
import { UniswapFormPricedWalletService } from './services/uniswap-form-priced-wallet.service';
import { PricedWalletModule } from '@app/common/modules/priced-wallet/priced-wallet.module';

@Module({
  controllers: [
    UniswapV3PoolsLiquidityProvidingController,
    UniswapV3PoolsLiquidityWithdrawingController,
    UniswapV3PoolsLiquidityIncreasingController,
  ],
  imports: [
    UniswapPoolsModule,
    DataChainModule,
    DataWalletModule,
    UniswapV3EvmModule,
    DataSupportedPoolsModule,
    RedisModule,
    PricedWalletModule,
  ],
  providers: [
    SocketPoolsDynamicCalculation,
    UniswapV3LiquidityWithdrawingService,
    UniswapV3LiquidityProvidingService,
    UniswapV3FormAddLiquidityTransactionService,
    UniswapV3DynamicCalculateService,
    UniswapV3FormClaimFeeTransactionService,
    UniswapV3FormRemoveLiquidityTransactionService,
    UniswapLiquidityCommonService,
    UniswapV3LiquidityIncreasingService,
    UniswapFormPricedWalletService,
  ],
})
export class UniswapV3Module {}
