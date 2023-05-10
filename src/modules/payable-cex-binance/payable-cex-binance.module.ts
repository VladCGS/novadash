import { BinanceModule } from '@app/common/modules/pure-cex-binance/pure-cex-binance.module';
import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { Module } from '@nestjs/common';
import { BinanceWithdrawController } from './controllers/binance-withdraw.controller';
import { CexValidateBinanceController } from './controllers/cex-validate-binance.controller';
import { BinanceAssetsService } from './services/binance-assets.service';
import { BinanceWithdrawalService } from './services/binance-withdtawal.service';
import { BinanceAssetController } from './controllers/binance-asset.controller';
import { BinanceTokensMetaService } from './services/binance-tokens-meta.service';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { BinanceBSwapService } from './services/binance-bswap.service';
import { BinanceDepositAssetsService } from './services/binance-deposit-address.service';
import { BinanceSwapController } from './controllers/binance-swap.controller';
import { BinanceDepositController } from './controllers/binance-deposit.controller';

@Module({
  imports: [
    BinanceModule,
    DataChainModule,
    CoinPriceModule,
    DataPlatformCoinModule,
  ],
  providers: [
    BinanceDepositAssetsService,
    BinanceWithdrawalService,
    BinanceAssetsService,
    BinanceTokensMetaService,
    BinanceBSwapService,
  ],
  exports: [BinanceWithdrawalService, BinanceAssetsService],
  controllers: [
    BinanceWithdrawController,
    BinanceSwapController,
    BinanceDepositController,
    CexValidateBinanceController,
    BinanceAssetController,
  ],
})
export class PayableCexBinanceModule {}
