import { AnalyticsAsset } from '@app/common/entities/balances';
import { Chain } from '@app/common/entities/transactions';
import { ChainSlugs } from '@app/common/types/chain.types';
import {
  UserAssetWalletDTO,
  UserWalletChainDTO,
} from '../dto/user-assets-responses.dto';

export interface IUserBalancesCalculatePricesOptions {
  cachedUsdTokenPrice: number;
  quantityBalance: number;
  usdBalanceBasic: number;
  usdPrice: number;
}

export interface IUserBalancesCalculatePricesReturn {
  usdTokenPrice: number;
  usdBalance: number;
  usdProfitLossChanges: number;
  usdProfitLossPercentChanges: number;
}

export interface IFormUserWalletStatistics {
  usdBalance: number;
  usdProfitLossChanges: number;
  usdProfitLossPercentChanges: number;
  quantityOfAsset: number;
  usdBalanceBasic: number;
}

export interface IFormUserWalletStatisticsOptions {
  wallet: UserAssetWalletDTO;
  chain: UserWalletChainDTO;
  statistics: IFormUserWalletStatistics;
}

export interface IUserAssetsFormWalletCalculationsOptions {
  assets: AnalyticsAsset[];
  chain: Chain;
}

export interface IUserAssetsFormWalletCalculations {
  usdBalance: number;
  usdBalanceBasic: number;
}

export interface IFormUserAssetFromDate {
  date: Date;
  chainSlug: ChainSlugs;
  tokenAddress: string;
  userId: string;
}

export enum UserAssetsOrderByEnum {
  ASSET_QUANTITY = 'assetQuantity',
  USD_TOKEN_PRICE = 'usdTokenPrice',
  USD_TOKEN_PRICE_AVG = 'usdTokenPriceAvg',
  USD_PROFIT_LOSS = 'usdProfitLoss',
}

export enum UserAssetWalletsBalancesOrderByEnum {
  ASSET_QUANTITY = 'assetQuantity',
}

export enum UserWalletsWithAssetsOrderByEnum {
  QUANTITY_OF_ASSET = 'quantityOfAsset',
  USD_BALANCE = 'usdBalance',
  USD_PROFIT_LOSS_CHANGES = 'usdProfitLossChanges',
}
