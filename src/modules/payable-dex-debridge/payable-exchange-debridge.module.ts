import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { DataExchModule } from '@app/common/modules/data-exch/data.exch.module';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { DataWalletModule } from '@app/common/modules/data-wallet/data.wallet.module';
import { DelegatorModule } from '@app/common/modules/delegator/delegator.module';
import { Module } from '@nestjs/common';
import { ExchDeBridgeController } from './controllers/exch-debridge.controller';
import { DeBridgeEstimationService } from './services/debridge-estimation.service';
import { DebridgeFeeCheckService } from './services/debridge-fee-check.service';
import { DebridgePaymentDataService } from './services/debridge-payment-data.service';
import { DebridgeQuoteFormer } from './services/debridge-quote.former';
import { DebridgeSwapFeeService } from './services/debridge-swap-fee.service';
import { DebridgeSwapSellService } from './services/debridge-swap-sell.service';
import { DebridgeTokenAddressTranslator } from './services/debridge-token-address.translator';
import { ExchDeBridgeService } from './services/exch-debridge.service';
import { DebridgeModule } from '@app/common/modules/debridge/debridge.module';

@Module({
  imports: [
    DataChainModule,
    DelegatorModule,
    DataWalletModule,
    DataExchModule,
    DataPlatformCoinModule,
    DebridgeModule,
  ],
  controllers: [ExchDeBridgeController],
  providers: [
    ExchDeBridgeService,
    DeBridgeEstimationService,
    DebridgeSwapFeeService,
    DebridgeFeeCheckService,
    DebridgePaymentDataService,
    DebridgeQuoteFormer,
    DebridgeTokenAddressTranslator,
    DebridgeSwapSellService,
  ],
})
export class PayableExchangeDebridgeModule {}
