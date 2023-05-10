import {
  PlatformCoin,
  PlatformCoinMetadata,
} from '@app/common/entities/alphaping';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { calcChanges } from '@app/common/utils/calc-changes.util';
import { Injectable } from '@nestjs/common';
import {
  IUserAssetsFormWalletCalculations,
  IUserAssetsFormWalletCalculationsOptions,
  IUserBalancesCalculatePricesOptions,
  IUserBalancesCalculatePricesReturn,
} from '../types/user-assets.types';

@Injectable()
export class UserAssetsService {
  constructor(private coinPriceService: CoinPriceService) {}

  async getUserAssetMetadata({
    assetAddress,
    chainId,
  }): Promise<PlatformCoinMetadata> {
    const foundPlatCoin = await PlatformCoin.findOne({
      where: {
        tokenAddress: assetAddress,
        chain: {
          id: chainId,
        },
      },
      relations: {
        coinMetadata: true,
      },
    });

    return foundPlatCoin.coinMetadata;
  }

  calculateBalanceNumbers(
    options: IUserBalancesCalculatePricesOptions,
  ): IUserBalancesCalculatePricesReturn {
    const { cachedUsdTokenPrice, quantityBalance, usdBalanceBasic, usdPrice } =
      options;

    const usdTokenPrice = usdPrice || cachedUsdTokenPrice;
    const usdBalance = usdTokenPrice * quantityBalance;

    const { usdProfitLossChanges, usdProfitLossPercentChanges } = calcChanges({
      valueCurrent: usdBalance,
      valuePast: usdBalanceBasic,
      keyNameStarter: 'usdProfitLoss',
    });

    return {
      usdTokenPrice,
      usdBalance,
      usdProfitLossChanges,
      usdProfitLossPercentChanges,
    };
  }

  async calcThroughAnalyticsAssets(
    options: IUserAssetsFormWalletCalculationsOptions,
  ): Promise<IUserAssetsFormWalletCalculations> {
    const { assets, chain } = options;

    let accumUsdBalance = 0;
    let accumUsdBalanceBasic = 0;

    for (const asset of assets) {
      const assetPrice = await this.coinPriceService.findEVMOrSaveAndReturn({
        tokenAddress: asset.assetAddress,
        chain,
      });

      const usdTokenPrice = assetPrice?.usdPrice || asset.usdTokenPrice;
      const usdBalance = Number(usdTokenPrice) * asset.quantityBalance;

      accumUsdBalance += usdBalance;
      accumUsdBalanceBasic += asset.usdBalanceBasic;
    }

    return {
      usdBalance: accumUsdBalance,
      usdBalanceBasic: accumUsdBalanceBasic,
    };
  }
}
