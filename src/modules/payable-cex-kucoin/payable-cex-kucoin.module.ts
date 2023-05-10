import { Module } from '@nestjs/common';
import { KucoinDepositService } from './services/kucoin-deposit.service';
import { KucoinWithdrawController } from './controllers/kucoin-withdraw.controller';
import { KucoinDepositController } from './controllers/kucoin-deposit.controller';
import { PureCexKucoinModule } from '@app/common/modules/pure-cex-kucoin/pure-cex-kucoin.module';
import { KucoinKeysExtractorService } from './services/kucoin-keys-extractor.service';
import { KucoinWithdrawService } from './services/kucoin-withdraw.service';
import { KucoinWithdrawQuoteService } from './services/kucoin-withdraw-quote.service';
import { KucoinAssetsService } from './services/kucoin-assets.service';
import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { CexValidateBinanceController } from './controllers/cex-validate-kucoin.controller';

@Module({
  imports: [
    PureCexKucoinModule,
    DataChainModule,
    CoinPriceModule,
    DataPlatformCoinModule,
  ],
  providers: [
    KucoinAssetsService,
    KucoinDepositService,
    KucoinWithdrawService,
    KucoinKeysExtractorService,
    KucoinWithdrawQuoteService,
  ],
  controllers: [
    KucoinWithdrawController,
    KucoinDepositController,
    CexValidateBinanceController,
  ],
  exports: [
    KucoinDepositService,
    KucoinKeysExtractorService,
    KucoinAssetsService,
  ],
})
export class PayableCexKucoinModule {}
