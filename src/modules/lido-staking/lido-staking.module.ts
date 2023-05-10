import { LidoEvmModule } from '@app/common/modules/lido-evm/lido-evm.module';
import { Module } from '@nestjs/common';
import { LidoStakingTransactionController } from './controller/lido-staking-transaction.controller';
import { LidoStakingTransactionService } from './service/lido-staking-transaction.service';
import { LidoUserController } from './controller/lido-user.controller';
import { LidoUserService } from './service/lido-user.service';
import { DataWalletModule } from '@app/common/modules/data-wallet/data.wallet.module';
import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { LidoWithdrawTransactionController } from './controller/lido-withdraw-transaction.controller';
import { LidoWithdrawTransactionService } from './service/lido-withdraw-transaction.service';
import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';

@Module({
  imports: [
    LidoEvmModule,
    DataWalletModule,
    DataChainModule,
    DataPlatformCoinModule,
    CoinPriceModule,
  ],
  controllers: [
    LidoStakingTransactionController,
    LidoUserController,
    LidoWithdrawTransactionController,
  ],
  providers: [
    LidoStakingTransactionService,
    LidoUserService,
    LidoWithdrawTransactionService,
  ],
})
export class LidoStakingModule {}
