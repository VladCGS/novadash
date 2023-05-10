import { Injectable } from '@nestjs/common';
import { PricedSpotWalletWithBalancesDTO } from '../../exchanges/dto/trade-common-responses.dto';
import { IKucoinKeys } from '../types/kucoin-keys.types';
import { PureKucoinService } from '@app/common/modules/pure-cex-kucoin/services/pure-kucoin.service';
import { PricedBinanceWithdrawalAssetDTO } from '../../payable-cex-binance/dto/binance.response.dto';
import { IKucoinCurrencyBalance } from '@app/common/modules/pure-cex-kucoin/types/pure-kucoin-client.responses';
import { Chain } from '@app/common/entities/transactions';
import BigNumber from 'bignumber.js';
import { SUPPORTED_EVM_SLUGS } from '@app/common/constants/supported-evm-chains.const';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { KucoinDepositService } from './kucoin-deposit.service';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { TOOLS_META_STATIC } from '@app/common/modules/common/tools-meta.const';
import { EXCHANGE_PROVIDER_TO_TOOLS_NAME } from '@app/common/constants/providers-to-meta.const';
import { SupportedCEXProviders } from '@app/common/entities/pairs';

@Injectable()
export class KucoinAssetsService {
  constructor(
    private pureKucoinService: PureKucoinService,
    private kucoinDepositService: KucoinDepositService,
    private coinPriceService: CoinPriceService,
  ) {}

  async formSellAssets(
    userId: string,
    keys: IKucoinKeys,
  ): Promise<PricedSpotWalletWithBalancesDTO | null> {
    const assets = await this.pureKucoinService.getAccounts(keys);
    if (!assets?.data?.length) {
      return null;
    }
    const withdrawablePricedAssets = await this.prepareWithdrawAssets(
      keys,
      assets.data,
    );

    const spotUsdBalance = this.calculateTotalUsdBalance(
      withdrawablePricedAssets,
    );

    return {
      balances: withdrawablePricedAssets,
      meta: {
        image:
          TOOLS_META_STATIC[
            EXCHANGE_PROVIDER_TO_TOOLS_NAME[SupportedCEXProviders.KUCOIN]
          ]?.image ?? null,
        name: 'Main',
        provider: SupportedCEXProviders.KUCOIN,
      },
      usdBalance: spotUsdBalance,
    };
  }

  private async prepareWithdrawAssets(
    keys: IKucoinKeys,
    currencies: IKucoinCurrencyBalance[],
  ): Promise<PricedBinanceWithdrawalAssetDTO[]> {
    const foundChain = await Chain.findOneBy({
      slug: SUPPORTED_EVM_SLUGS.ETH,
    });
    const pricedAssets: PricedBinanceWithdrawalAssetDTO[] = [];

    for (const asset of currencies) {
      const depositETHMethod =
        await this.kucoinDepositService.fetchOrCreateNewDepositRoute(
          keys,
          asset.currency,
          {
            ignoreError: true,
          },
        );
      if (!depositETHMethod) {
        continue;
      }
      const tokenAddress =
        depositETHMethod.contractAddress === ''
          ? NATIVE_UNI_ADDRESS
          : depositETHMethod.contractAddress.toLowerCase();

      const foundCoin = await PlatformCoin.findOne({
        where: {
          tokenAddress: tokenAddress,
          chain: {
            id: foundChain.id,
          },
        },
        relations: {
          coinMetadata: true,
        },
      });

      let pricedData = await this.coinPriceService.getUSDPriceByGraph(
        tokenAddress,
        foundChain.slug,
      );
      if (!pricedData) {
        const foundPrice = await this.coinPriceService.findEVMOrSaveAndReturn({
          tokenAddress: tokenAddress,
          chain: foundChain,
        });

        pricedData = foundPrice?.usdPrice
          ? parseFloat(foundPrice?.usdPrice)
          : 0;
      }

      if (pricedData) {
        pricedAssets.push({
          ...asset,
          name: foundCoin?.coinMetadata?.name || asset.currency,
          symbol: asset.currency,
          chains: [
            {
              name: foundChain.name,
              image: foundChain.image,
              id: foundChain.id,
            },
          ],
          image: foundCoin?.coinMetadata?.image,
          quantity: asset.available,
          usdPrice: pricedData.toString(),
          usdBalance: BigNumber(pricedData).times(asset.available).toString(),
        });
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
