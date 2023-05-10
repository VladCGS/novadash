import { AaveV3EvmModule } from '@app/common/modules/aave-v3-evm/aave-v3-evm.module';
import { CoinGeckoModule } from '@app/common/modules/coingecko/coingecko.module';
import { DelegatorModule } from '@app/common/modules/delegator/delegator.module';
import { HealthCheckModule } from '@app/common/modules/healthcheck/healthcheck.module';
import { UniswapPoolsModule } from '@app/common/modules/uniswap-pools/uniswap-pools.module';
import { UserTriggerModule } from '@app/common/modules/user-trigger/user-trigger.module';
import { Module } from '@nestjs/common';
import { TransactionService } from '../transaction/services/transaction.service';
import { TransactionModule } from '../transaction/transaction.module';
import { WalletService } from '../wallet/services/wallet.service';
import { WalletModule } from '../wallet/wallet.module';
import { PlaygroundController } from './playground.controller';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { Web3InfuraEvmModule } from '@app/common/modules/web3-infura-provider-evm/web3-infura-provider-evm.module';
import { PayableCexBinanceModule } from '../payable-cex-binance/payable-cex-binance.module';
import { LidoEvmModule } from '@app/common/modules/lido-evm/lido-evm.module';
import { DataStablecoinModule } from '@app/common/modules/data-stablecoin/data.stablecoin.module';
import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { Web3DirectDataModule } from '@app/common/modules/web3-direct-data/web3-direct-data.module';
import { PlaygroundKrakenController } from './playground-kraken.controller';
import { PlaygroundKucoinController } from './playground-kucoin.controller';
import { PureCexKucoinModule } from '@app/common/modules/pure-cex-kucoin/pure-cex-kucoin.module';

@Module({
  imports: [
    RmqModule,
    RmqTransportModule,
    UserTriggerModule,
    HealthCheckModule,
    WalletModule,
    TransactionModule,
    DelegatorModule,
    CoinGeckoModule,
    UniswapPoolsModule,
    AaveV3EvmModule,
    Web3InfuraEvmModule,
    PayableCexBinanceModule,
    LidoEvmModule,
    DataStablecoinModule,
    CoinPriceModule,
    Web3DirectDataModule,
    PureCexKucoinModule,
  ],
  controllers: [
    PlaygroundController,
    PlaygroundKrakenController,
    PlaygroundKucoinController,
  ],
  providers: [TransactionService, WalletService],
})
export class PlaygroundModule {}
