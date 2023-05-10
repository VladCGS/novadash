import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { DataExchModule } from '@app/common/modules/data-exch/data.exch.module';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { Module } from '@nestjs/common';
import { Exch0xController } from './controllers/exch-0x.controller';
import { Exch0xService } from './services/exch-0x.service';
import { Pure0xService } from './services/pure-0x.service';
import { Zero0xFeesService } from './services/zero0x-fees.service';
import { Zero0xPaymentService } from './services/zero0x-payment.service';
import { Zero0xQuoteService } from './services/zero0x-quote.service';
import { Zero0xSwapSellService } from './services/zero0x-swap-sell.service';

@Module({
  imports: [DataExchModule, DataChainModule, DataPlatformCoinModule],
  controllers: [Exch0xController],
  providers: [
    Exch0xService,
    Pure0xService,
    Zero0xSwapSellService,
    Zero0xPaymentService,
    Zero0xFeesService,
    Zero0xQuoteService,
  ],
})
export class PayableExchange0xModule {}
