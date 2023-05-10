import { TrimMiddleware } from '@app/common/middlewares/trim.middleware';
import { AdvancedLoggerModule } from '@app/common/modules/advanced-logger/advanced-logger.module';
import { CronModule } from '@app/common/modules/cron/cron.module';
import { DatabaseModule } from '@app/common/modules/database/database.module';
import { HealthCheckModule } from '@app/common/modules/healthcheck/healthcheck.module';
import { WebsocketModule } from '@app/common/modules/websocket/websocket.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { checkEnvSchemaAlphaping } from '../check-env-schema';
import { AdminModule } from './modules/admin/admin.module';
import { ChainModule } from './modules/chain/chain.module';
import { ChartModule } from './modules/charts/charts.module';
import { CoingeckoInitModule } from './modules/coingecko-init/coingecko-init.module';
import { CommonModule } from './modules/common/common.module';
import { CronManagerModule } from './modules/cron-manager/cron-manager.module';
import { PayableExchange0xModule } from './modules/payable-dex-0x/payable-exchange-0x.module';
import { PayableCexBinanceModule } from './modules/payable-cex-binance/payable-cex-binance.module';
import { PayableExchangeDebridgeModule } from './modules/payable-dex-debridge/payable-exchange-debridge.module';
import { PayableExchangeRangoModule } from './modules/payable-dex-rango/payable-exchange-rango.module';
import { PayableExchangeTransakModule } from './modules/payable-ramp-transak/payable-exchange-transak.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { FiatModule } from './modules/fiat/fiat.module';
import { HealthModule } from './modules/health/health.module';
import { LiquidityPoolsModule } from './modules/liquidity-pools/liquidity-pools.module';
import { MailModule } from './modules/mail/mail.module';
import { PlatformCoinsModule } from './modules/platform-coins/platform-coins.module';
import { PlaygroundModule } from './modules/playground/playground.module';
import { StateManagerModule } from './modules/state-manager/state-manager.module';
import { ToolMetaModule } from '../../ms-pairs/src/modules/tool-meta/tool-meta.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UniswapV3Module } from './modules/uniswap-v3-pools/uniswap-v3-pools.module';
import { UserAnalyticsModule } from './modules/user-analytics/user-analytics.module';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { UserLogSocketSubscriber } from '@app/common/subscribers/user-log-socket.subscriber';
import { LendingAssetsModule } from './modules/lend-borrow-user/lending-assets.module';
import { AaveV3ReservesModule } from './modules/lend-borrow-aave-v3-reserves/aave-v3-reserves.module';
import { CompoundV2ReservesModule } from './modules/lend-borrow-compound-v2-reserves/compound-v2-reserves.module';
import { StakingAssetsModule } from './modules/staking-assets/staking-assets.module';
import { LidoStakingModule } from './modules/lido-staking/lido-staking.module';
import { PayableCexKucoinModule } from './modules/payable-cex-kucoin/payable-cex-kucoin.module';

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [
        './apps/alphaping/.env',
        './.env',
        './.env.global',
        './.env.prod',
      ],
      validationSchema: checkEnvSchemaAlphaping,
    }),
    AdvancedLoggerModule,
    DatabaseModule,
    CommonModule,
    CoingeckoInitModule,
    MailModule,
    UserModule,
    TransactionModule,
    UserAnalyticsModule,
    WalletModule,
    FiatModule,
    ChainModule,
    ChartModule,
    UniswapV3Module,
    LiquidityPoolsModule,
    LendingAssetsModule,
    StakingAssetsModule,
    AaveV3ReservesModule,
    CompoundV2ReservesModule,
    LidoStakingModule,
    ExchangesModule,
    PayableExchange0xModule,
    PayableExchangeTransakModule,
    PayableExchangeRangoModule,
    PayableExchangeDebridgeModule,
    PayableCexBinanceModule,
    PayableCexKucoinModule,
    AdminModule,
    CronManagerModule,
    PlatformCoinsModule,
    ToolMetaModule,
    WebsocketModule,
    CronModule,
    StateManagerModule,
    HealthModule,
    HealthCheckModule,
    PlaygroundModule,
  ],
  providers: [UserLogSocketSubscriber],
})
export class AlphapingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(...[TrimMiddleware]).forRoutes('/');
  }
}
