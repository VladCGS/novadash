import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { DataAnalyticsAssetModule } from '@app/common/modules/data-analytics-asset/data.analytics-asset.module';
import { DataAnalyticsUserModule } from '@app/common/modules/data-analytics-user/data.analytics-user.module';
import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { DataExchangeSwapSelectorService } from '@app/common/modules/data-exchange-swap/services/data.exchange-swap-selector.service';
import { DataTransactionModule } from '@app/common/modules/data-transaction/data.transaction.module';
import { DataWalletModule } from '@app/common/modules/data-wallet/data.wallet.module';
import { DelegatorModule } from '@app/common/modules/delegator/delegator.module';
import { Module } from '@nestjs/common';
import { AnalyticsUserService } from 'apps/ms-balances/src/modules/balance/services/analytics-user.service';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { MailService } from '../mail/services/mail.service';
import { WalletModule } from '../wallet/wallet.module';
import { UserAssetsController } from './controllers/user-assets.controller';
import { UserAuthController } from './controllers/user-auth.controller';
import { UserController } from './controllers/user.controller';
import { UserAssetsTokenAnalyticsService } from './services/user-assets-token-analytics.service';
import { UserAssetsService } from './services/user-assets.service';
import { UserAuthService } from './services/user-auth.service';
import { UserService } from './services/user.service';
import { PricedWalletModule } from '@app/common/modules/priced-wallet/priced-wallet.module';

@Module({
  imports: [
    WalletModule,
    CoinPriceModule,
    ExchangesModule,
    DelegatorModule,
    DataAnalyticsAssetModule,
    DataAnalyticsUserModule,
    DataTransactionModule,
    DataChainModule,
    DataWalletModule,
    PricedWalletModule,
  ],
  controllers: [UserController, UserAuthController, UserAssetsController],
  providers: [
    UserService,
    UserAuthService,
    UserAssetsService,
    AnalyticsUserService,
    MailService,
    CoinPriceService,
    UserAssetsTokenAnalyticsService,
    DataExchangeSwapSelectorService,
  ],
  exports: [UserService],
})
export class UserModule {}
