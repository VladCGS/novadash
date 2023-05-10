import { PureTransakModule } from '@app/common/modules/transak/pure-transak.module';
import { Module } from '@nestjs/common';
import { ExchTransakOffRampController } from './controllers/exch-transak-off-ramp.controller';
import { ExchTransakOnRampController } from './controllers/exch-transak-on-ramp.controller';
import { TransakQuoteService } from './services/transak-quote.service';
import { TransakWidgetLinkService } from './services/transak-widget-link.service';
import { TransakNetworkService } from './services/transak-network.service';
import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';

@Module({
  imports: [PureTransakModule, DataChainModule],
  controllers: [ExchTransakOnRampController, ExchTransakOffRampController],
  providers: [
    TransakQuoteService,
    TransakWidgetLinkService,
    TransakNetworkService,
  ],
})
export class PayableExchangeTransakModule {}
