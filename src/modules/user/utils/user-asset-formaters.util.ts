import { AnalyticsAsset } from '@app/common/entities/balances';
import {
  Chain,
  TransactionAsset,
  Wallet,
} from '@app/common/entities/transactions';
import { calcChanges } from '@app/common/utils/calc-changes.util';
import {
  UserAssetBaseDTO,
  UserAssetMetaDTO,
  UserAssetWalletDTO,
  UserWalletChainDTO,
  UserWalletStatisticsDTO,
} from '../dto/user-assets-responses.dto';
import { IFormUserWalletStatisticsOptions } from '../types/user-assets.types';

export const formTransactionAssetToUserAssetMeta = (
  ta: TransactionAsset,
): UserAssetMetaDTO => {
  return {
    decimals: ta.platformCoin.decimals,
    image: ta.platformCoin.coinMetadata.image,
    name: ta.platformCoin.coinMetadata.name,
    symbol: ta.platformCoin.coinMetadata.symbol,
  };
};

export const formWalletStatistics = ({
  wallet,
  chain,
  statistics,
}: IFormUserWalletStatisticsOptions): UserWalletStatisticsDTO => {
  return {
    ...statistics,
    wallet: {
      ...wallet,
      chain: { ...chain },
    },
  };
};

export const formWalletToUserAssetWalletBalances = (
  wallet: Wallet,
): UserAssetWalletDTO => {
  return {
    id: wallet.id,
    provider: wallet.provider,
    name: wallet.name,
    image: null,
    address: wallet.address,
    chain: {
      id: wallet.chain.id,
      image: wallet.chain.image,
      name: wallet.chain.name,
    },
  };
};

export const formChain = (chain: Chain): UserWalletChainDTO => {
  return {
    id: chain.id,
    image: chain.image ?? null,
    name: chain.name,
    slug: chain.slug,
  };
};

export const formAnalyticsAssetToUserAsset = (
  au: AnalyticsAsset,
  usdTokenPriceCurrent: number,
): UserAssetBaseDTO => {
  const { assetAddress, quantityBalance, usdBalanceBasic, usdTokenPriceAvg } =
    au;

  const usdBalance = usdTokenPriceCurrent * quantityBalance;

  const { usdProfitLossChanges, usdProfitLossPercentChanges } = calcChanges({
    valueCurrent: usdBalance,
    valuePast: usdBalanceBasic,
    keyNameStarter: 'usdProfitLoss',
  });

  return {
    assetAddress,
    quantityBalance,
    usdBalanceBasic,
    usdBalance,
    usdProfitLossChanges,
    usdProfitLossPercentChanges,
    usdTokenPrice: usdTokenPriceCurrent,
    usdTokenPriceAvg,
  };
};
