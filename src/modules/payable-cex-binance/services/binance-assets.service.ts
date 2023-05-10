import { BINANCE_TO_DB_SLUGS } from '@app/common/constants/chains-binance.const';
import {
  PlatformCoin,
  PlatformCoinMetadata,
} from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { DataChainExchService } from '@app/common/modules/data-chain/services/data.chain-exch.service';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { Injectable } from '@nestjs/common';
import { AllCoinsInformationResponse, CoinNetwork } from 'binance';
import {
  BinanceWithdrawalAssetDTO,
  PricedBinanceWithdrawalAssetDTO,
} from '../dto/binance.response.dto';
import { IBinanceCoinMetadata } from '../types/exch-binance.types';
import BigNumber from 'bignumber.js';
import { PricedSpotWalletWithBalancesDTO } from '../../exchanges/dto/trade-common-responses.dto';
import { TOOLS_META_STATIC } from '@app/common/modules/common/tools-meta.const';
import { EXCHANGE_PROVIDER_TO_TOOLS_NAME } from '@app/common/constants/providers-to-meta.const';
import { SupportedCEXProviders } from '@app/common/entities/pairs';
import { IBinanceKeys } from '@app/common/modules/pure-cex-binance/types/pure-binance.types';

@Injectable()
export class BinanceAssetsService {
  constructor(
    private dataChainService: DataChainService,
    private dataChainExchService: DataChainExchService,
    private pureBinanceService: PureBinanceService,
    private coinPriceService: CoinPriceService,
  ) {}

  async formSellAssets(
    userId: string,
    binanceCreds: IBinanceKeys,
  ): Promise<PricedSpotWalletWithBalancesDTO | undefined> {
    const binanceAssets = await this.getWithdrawalList(userId, binanceCreds);
    if (!binanceAssets?.length) {
      return;
    }
    const pricedBinanceAssets = await this.attachPricesToBinanceAssets(
      binanceAssets,
    );
    const spotUsdBalance = this.calculateTotalUsdBalance(pricedBinanceAssets);

    return {
      balances: pricedBinanceAssets,
      meta: {
        image:
          TOOLS_META_STATIC[
            EXCHANGE_PROVIDER_TO_TOOLS_NAME[SupportedCEXProviders.BINANCE]
          ]?.image ?? null,
        name: 'Main',
        provider: SupportedCEXProviders.BINANCE,
      },
      usdBalance: spotUsdBalance,
    };
  }

  async getWithdrawalList(
    userId: string,
    binanceCreds: IBinanceKeys,
  ): Promise<BinanceWithdrawalAssetDTO[] | undefined> {
    const userChains = await this.dataChainService.findManyByUserIdOrFail(
      userId,
    );

    const slugs: string[] = userChains.map((c: Chain) => c.slug);

    const foundBalances = await this.pureBinanceService.getWithdrawableBalances(
      binanceCreds,
    );

    const availableBalances = this.filterAvailableBalancesBySlugs(
      foundBalances,
      slugs,
    );

    return this.formWithdrawalAssetsByBinanceBalances(
      availableBalances,
      userChains,
    );
  }

  private filterAvailableBalancesBySlugs(
    balances: AllCoinsInformationResponse[],
    slugs: string[],
  ): AllCoinsInformationResponse[] {
    return balances
      .map((balance: AllCoinsInformationResponse) => ({
        ...balance,
        networkList: balance.networkList.filter((network: CoinNetwork) =>
          slugs.includes(BINANCE_TO_DB_SLUGS[network.network]),
        ),
      }))
      .filter(
        (balance: AllCoinsInformationResponse) =>
          balance.networkList.length > 0,
      );
  }

  private async formWithdrawalAssetsByBinanceBalances(
    balances: AllCoinsInformationResponse[],
    chains: Chain[],
  ): Promise<IBinanceCoinMetadata[]> {
    const result: IBinanceCoinMetadata[] = [];

    for (const balance of balances) {
      const resultChains: { name: string; image: string | null; id: string }[] =
        [];
      for (const network of balance.networkList) {
        const foundChain = chains.find(
          (c: Chain) => c.slug === BINANCE_TO_DB_SLUGS[network.network],
        );

        if (foundChain) {
          resultChains.push({
            id: foundChain.id,
            name: foundChain.name,
            image: foundChain.image,
          });
        }
      }

      if (chains.length <= 0) continue;

      // Can be undefined
      const nativeTokenAddress =
        await this.dataChainExchService.checkIfNativeTokenAddress({
          symbol: balance.coin,
          chainId: resultChains[0].id,
          tokenAddress: null,
        });

      const metadata = await PlatformCoinMetadata.findOne({
        where: {
          symbol: balance.coin,
          platformCoin: {
            chain: { id: resultChains[0].id },
            // try to find native meta if e.g. MATIC
            tokenAddress: nativeTokenAddress,
          },
        },
        relations: { platformCoin: true },
      });

      result.push({
        name: metadata.name,
        symbol: metadata.symbol,
        image: metadata.image,
        quantity: balance.free.toString(),
        chains: resultChains,
      });
    }

    return result;
  }

  async attachPricesToBinanceAssets(
    assets: BinanceWithdrawalAssetDTO[],
  ): Promise<PricedBinanceWithdrawalAssetDTO[]> {
    const pricedAssets: PricedBinanceWithdrawalAssetDTO[] = [];

    for (const asset of assets) {
      for (let i = 0, len = asset.chains.length; i < len; i++) {
        const chain = asset.chains[i];

        let tokenAddress: string | undefined;
        const foundChain = await Chain.findOne({ where: { id: chain.id } });

        const nativeTokenAddress =
          await this.dataChainExchService.checkIfNativeTokenAddress({
            symbol: asset.symbol,
            chainId: chain.id,
            tokenAddress: null,
          });

        if (!nativeTokenAddress) {
          const foundPlatCoin = await PlatformCoin.findOne({
            where: {
              chain: { id: foundChain.id },
              coinMetadata: { symbol: asset.symbol },
            },
          });

          if (foundPlatCoin) {
            tokenAddress = foundPlatCoin.tokenAddress;
          }
        }

        let pricedData = await this.coinPriceService.getUSDPriceByGraph(
          nativeTokenAddress ? nativeTokenAddress : tokenAddress,
          foundChain.slug,
        );
        if (!pricedData) {
          const foundPrice = await this.coinPriceService.findEVMOrSaveAndReturn(
            {
              tokenAddress: nativeTokenAddress
                ? nativeTokenAddress
                : tokenAddress,
              chain: foundChain,
            },
          );

          pricedData = foundPrice?.usdPrice
            ? parseFloat(foundPrice?.usdPrice)
            : 0;
        }

        if (pricedData) {
          pricedAssets.push({
            ...asset,
            usdPrice: pricedData.toString(),
            usdBalance: BigNumber(pricedData).times(asset.quantity).toString(),
          });
          break;
        }

        if (i === len - 1 && !pricedData) {
          pricedAssets.push({
            ...asset,
            usdPrice: '0',
            usdBalance: '0',
          });
          break;
        }
      }
    }

    return pricedAssets;
  }

  calculateTotalUsdBalance(assets: PricedBinanceWithdrawalAssetDTO[]): string {
    let balanceAccum = BigNumber(0);

    for (const asset of assets) {
      balanceAccum = balanceAccum.plus(BigNumber(asset.usdBalance));
    }

    return String(balanceAccum);
  }
}
