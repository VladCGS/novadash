import { ErrorMiddlewareModule } from '@app/common/modules/error-middleware/error-middleware.module';
import { HealthCheckModule } from '@app/common/modules/healthcheck/healthcheck.module';
import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { CoingeckoInitModule } from '../coingecko-init/coingecko-init.module';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { LendingAssetsModule } from '../lend-borrow-user/lending-assets.module';
import { LiquidityPoolsModule } from '../liquidity-pools/liquidity-pools.module';
import { PlatformCoinsModule } from '../platform-coins/platform-coins.module';
import { ToolMetaModule } from '../../../../ms-pairs/src/modules/tool-meta/tool-meta.module';
import { AdminController } from './controllers/admin-auth.controller';
import { AdminInitFeaturesController } from './controllers/admin-init-features.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { AppInitFeaturesService } from './services/app-init-features.service';
import { StakingAssetsModule } from '../staking-assets/staking-assets.module';

@Module({
  imports: [
    ErrorMiddlewareModule,
    ExchangesModule,
    PlatformCoinsModule,
    CoingeckoInitModule,
    LiquidityPoolsModule,
    LendingAssetsModule,
    HealthCheckModule,
    ChainModule,
    ToolMetaModule,
    StakingAssetsModule,
  ],
  controllers: [AdminController, AdminInitFeaturesController],
  exports: [AppInitFeaturesService],
  providers: [AdminAuthService, AppInitFeaturesService],
})
export class AdminModule {}
