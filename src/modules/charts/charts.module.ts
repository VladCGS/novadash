import { Module } from '@nestjs/common';
import { ChartUserController } from './controllers/chart-user.controller';
import { ChartTokenService } from './services/chart-token.service';
import { CoinPriceModule } from '@app/common/modules/coin-price/coin-price.module';
import { DelegatorModule } from '@app/common/modules/delegator/delegator.module';
import { ChartUserService } from './services/chart-user.service';
import { DataAnalyticsUserModule } from '@app/common/modules/data-analytics-user/data.analytics-user.module';
import { CoinGeckoModule } from '@app/common/modules/coingecko/coingecko.module';

@Module({
  imports: [
    CoinPriceModule,
    DelegatorModule,
    DataAnalyticsUserModule,
    CoinGeckoModule,
  ],
  controllers: [ChartUserController],
  providers: [ChartTokenService, ChartUserService],
})
export class ChartModule {}
