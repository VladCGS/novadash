import { AnalyticsAsset } from '@app/common/entities/balances';
import { Chain } from '@app/common/entities/transactions';
import { DataAnalyticsUserAssetsService } from '@app/common/modules/data-analytics-user/services/data.analytics-user-assets.service';
import { calcChanges } from '@app/common/utils/calc-changes.util';
import { Injectable } from '@nestjs/common';
import { UserTokenAnalyticRequestDTO } from '../dto/user-assets-requests.dto';
import { UserTokenAnalyticResponseDTO } from '../dto/user-assets-responses.dto';

@Injectable()
export class UserAssetsTokenAnalyticsService {
  constructor(
    private dataAnalyticsUserAssetService: DataAnalyticsUserAssetsService,
  ) {}

  private getAssetBalances(asset: AnalyticsAsset | undefined) {
    return {
      usdBalance: asset?.usdBalance || 0,
      quantityBalance: asset?.quantityBalance || 0,
      usdTokenPriceAvg: asset?.usdTokenPriceAvg || 0,
      usdProfitLoss: asset?.usdProfitLoss || 0,
    };
  }

  private formAnalyticsFromAssets(
    currentAsset: AnalyticsAsset | undefined,
    pastAsset: AnalyticsAsset | undefined,
  ): UserTokenAnalyticResponseDTO {
    const currentAssetBalances = this.getAssetBalances(currentAsset);
    const pastAssetBalances = this.getAssetBalances(pastAsset);

    const { usdBalanceChanges, usdBalancePercentChanges } = calcChanges({
      valueCurrent: currentAssetBalances.usdBalance,
      valuePast: pastAssetBalances.usdBalance,
      keyNameStarter: 'usdBalance',
    });

    const { quantityBalanceChanges, quantityBalancePercentChanges } =
      calcChanges({
        valueCurrent: currentAssetBalances.quantityBalance,
        valuePast: pastAssetBalances.quantityBalance,
        keyNameStarter: 'quantityBalance',
      });

    const { usdTokenPriceAvgChanges, usdTokenPriceAvgPercentChanges } =
      calcChanges({
        valueCurrent: currentAssetBalances.usdTokenPriceAvg,
        valuePast: pastAssetBalances.usdTokenPriceAvg,
        keyNameStarter: 'usdTokenPriceAvg',
      });

    const { usdProfitLossChanges, usdProfitLossPercentChanges } = calcChanges({
      valueCurrent: currentAssetBalances.usdProfitLoss,
      valuePast: pastAssetBalances.usdProfitLoss,
      keyNameStarter: 'usdProfitLoss',
    });

    return {
      current: currentAssetBalances,
      past: pastAssetBalances,
      changes: {
        usdBalanceChanges,
        usdBalancePercentChanges,
        quantityBalanceChanges,
        quantityBalancePercentChanges,
        usdTokenPriceAvgChanges,
        usdTokenPriceAvgPercentChanges,
        usdProfitLossChanges,
        usdProfitLossPercentChanges,
      },
    };
  }

  private decreaseDateByDays(date: Date, days: number): Date {
    const decreasedDate = new Date(
      new Date(date).setDate(date.getDate() - days),
    );

    return decreasedDate;
  }

  async getTokenAnalyticsThroughDays(
    queryConfig: UserTokenAnalyticRequestDTO,
    userId: string,
  ): Promise<UserTokenAnalyticResponseDTO> {
    const currentDate = new Date();
    const pastDate = this.decreaseDateByDays(
      currentDate,
      queryConfig.throughDays,
    );

    const foundChain = await Chain.findOne({
      where: { id: queryConfig.chainId },
    });

    const assetConfig = {
      userId,
      tokenAddress: queryConfig.tokenAddress,
      chainSlug: foundChain.slug,
    };

    const currentAsset =
      await this.dataAnalyticsUserAssetService.findOnePrevAsset({
        ...assetConfig,
        date: currentDate,
      });
    const pastAsset = await this.dataAnalyticsUserAssetService.findOnePrevAsset(
      {
        ...assetConfig,
        date: pastDate,
      },
    );

    return this.formAnalyticsFromAssets(currentAsset, pastAsset);
  }
}
