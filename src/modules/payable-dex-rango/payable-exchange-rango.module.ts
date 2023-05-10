import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { DataExchModule } from '@app/common/modules/data-exch/data.exch.module';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { Module } from '@nestjs/common';
import { ExchRangoController } from './controllers/exch-rango.controller';
import { ExchRangoService } from './services/exch-rango.service';
import { RangoPaymentFormerService } from './services/rango-payment-former.service';
import { RangoSwapSellService } from './services/rango-swap-sell.service';
import { RangoTransactionFormerService } from './services/rango-transaction-former.service';
import { RangoModule } from '@app/common/modules/rango/rango.module';

@Module({
  imports: [
    DataExchModule,
    DataPlatformCoinModule,
    DataChainModule,
    RangoModule,
  ],
  controllers: [ExchRangoController],
  providers: [
    ExchRangoService,
    RangoSwapSellService,
    RangoTransactionFormerService,
    RangoPaymentFormerService,
  ],
})
export class PayableExchangeRangoModule {}
