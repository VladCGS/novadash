import { BinanceModule } from '@app/common/modules/pure-cex-binance/pure-cex-binance.module';
import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { DataChainModule } from '@app/common/modules/data-chain/data.chain.module';
import { DataExchangeSwapModule } from '@app/common/modules/data-exchange-swap/data.exchange-swap.module';
import { DataExchangeSwapSelectorService } from '@app/common/modules/data-exchange-swap/services/data.exchange-swap-selector.service';
import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { DelegatorModule } from '@app/common/modules/delegator/delegator.module';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { forwardRef, Module } from '@nestjs/common';
import { PayableCexBinanceModule } from '../payable-cex-binance/payable-cex-binance.module';
import { StateManagerModule } from '../state-manager/state-manager.module';
import { WalletPayableService } from '../wallet/services/wallet-payable.service';
import { DestinationWalletsController } from './controllers/destination-wallets.controller';
import { OnRampSelectorController } from './controllers/on-ramp-selector.controller';
import { SwapSelectorController } from './controllers/swap-selector.controller';
import { ExchOnRampUserService } from './services/exch-on-ramp-user.service';
import { ExchangeSwapService } from './services/exchange-swap.service';
import { InitExchangesSwapService } from './services/init-exchange-swap-coins.service';
import { InitExchangesOnOffRampService } from './services/init-on-off-ramps.service';
import { PairsForTokenService } from './services/pairs-for-token.service';
import { SpotDestinationBinanceService } from './services/spot-destination-binance.service';
import { SpotDestinationsService } from './services/spot-destinations.service';
import { UserSpotWalletsService } from './services/user-spot-wallets.service';
import { PricedWalletsSelectorController } from './controllers/priced-wallets-selector.controller';
import { PricedWalletModule } from '@app/common/modules/priced-wallet/priced-wallet.module';
import { ExchProvidersBalancesService } from './services/exch-providers-balances.service';
import { DataStablecoinModule } from '@app/common/modules/data-stablecoin/data.stablecoin.module';
import { UserHotWalletPricedNativeBalanceService } from './services/user-hot-wallets-priced-native-balance.service';
import { SwapPairsForCexTokenService } from './services/swap-pairs-for-cex-token.service';
import { Stablecoin0xSwapService } from './services/stablecoin-0x-swap.service';
import { InitStablecoinsService } from './services/init-stablecoins.service';
import { SpotDestinationKucoinService } from './services/spot-destination-kucoin.service';
import { UserHotWalletPricedBalancesService } from './services/user-hot-wallets-priced-balances.service';
import { PayableCexKucoinModule } from '../payable-cex-kucoin/payable-cex-kucoin.module';
import { InitExchangesBinanceService } from './services/init-exchange-binance-coins.service';

@Module({
  imports: [
    RmqTransportModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_PAIRS,
    }),
    forwardRef(() => StateManagerModule),
    DataChainModule,
    DataPlatformCoinModule,
    DelegatorModule,
    CoinPriceModule,
    PayableCexBinanceModule,
    PayableCexKucoinModule,
    BinanceModule,
    DataExchangeSwapModule,
    PricedWalletModule,
    DataStablecoinModule,
    StateManagerModule,
  ],
  providers: [
    SwapPairsForCexTokenService,
    ExchangeSwapService,
    UserHotWalletPricedBalancesService,
    UserHotWalletPricedNativeBalanceService,
    UserSpotWalletsService,
    InitExchangesSwapService,
    InitExchangesBinanceService,
    PairsForTokenService,
    InitExchangesOnOffRampService,
    ExchOnRampUserService,
    SpotDestinationBinanceService,
    SpotDestinationKucoinService,
    WalletPayableService,
    DataExchangeSwapSelectorService,
    SpotDestinationsService,
    ExchProvidersBalancesService,
    Stablecoin0xSwapService,
    InitStablecoinsService,
  ],
  controllers: [
    OnRampSelectorController,
    DestinationWalletsController,
    SwapSelectorController,
    PricedWalletsSelectorController,
  ],
  exports: [
    InitExchangesSwapService,
    InitExchangesBinanceService,
    InitExchangesOnOffRampService,
    ExchProvidersBalancesService,
    InitStablecoinsService,
  ],
})
export class ExchangesModule {}
