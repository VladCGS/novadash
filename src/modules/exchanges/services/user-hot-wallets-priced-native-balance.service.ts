import { Injectable } from '@nestjs/common';
import {
  HotWalletSellAssetDTO,
  PricedHotWalletNativeBalanceDTO,
} from '../dto/trade-common-responses.dto';
import { ExchProvidersBalancesService } from './exch-providers-balances.service';
import { FetchWalletBalancesService } from '@app/common/modules/priced-wallet/services/fetch-wallet-balances.service';
import { IRawWalletBalance } from '@app/common/modules/priced-wallet/types/fetch-evm-balances.types';
import { Wallet } from '@app/common/entities/transactions';
import { In } from 'typeorm';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { TOOLS_META_STATIC } from '@app/common/modules/common/tools-meta.const';
import { WALLET_PROVIDERS_TO_TOOLS_NAME } from '@app/common/constants/providers-to-meta.const';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { OrderNativePricedHotWallets } from '../types/orders.enum';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import BigNumber from 'bignumber.js';

@Injectable()
export class UserHotWalletPricedNativeBalanceService {
  constructor(
    private exchSwapSellUser: ExchProvidersBalancesService,
    private coinPriceService: CoinPriceService,
    private fetchWalletBalancesService: FetchWalletBalancesService,
  ) {}

  async getAllPriced(
    userId: string,
    options?: {
      onlyChainIds?: string[];
    },
  ): Promise<PricedHotWalletNativeBalanceDTO[]> {
    const foundWallets = await Wallet.find({
      where: {
        user: {
          id: userId,
        },
        chain: options?.onlyChainIds.length
          ? {
              id: In(options?.onlyChainIds),
            }
          : undefined,
      },
      relations: {
        user: true,
        chain: {
          nativeCurrency: true,
        },
      },
    });

    const formedWallets: PricedHotWalletNativeBalanceDTO[] = [];

    for (const wallet of foundWallets) {
      const fetchedNativeBalances =
        await this.fetchWalletBalancesService.fetchAndFormNativeBalance(wallet);

      const formedWallet = await this.formOnePricedWalletWithNative(
        wallet,
        fetchedNativeBalances,
      );

      formedWallets.push(formedWallet);
    }

    return formedWallets;
  }

  private async formOnePricedWalletWithNative(
    wallet: Wallet,
    fetchedNativeBalance: IRawWalletBalance,
  ): Promise<PricedHotWalletNativeBalanceDTO> {
    const tokenData =
      await this.exchSwapSellUser.findOnePlatformCoinMetaByAddresses(
        NATIVE_UNI_ADDRESS,
        wallet.chain.id,
      );
    const resultAsset: HotWalletSellAssetDTO = {
      ...fetchedNativeBalance,
      ...tokenData,
      usdBalance: '0',
      usdPrice: '0',
    };

    const foundCoinPrice = await this.coinPriceService.getUSDPriceByGraph(
      NATIVE_UNI_ADDRESS,
      wallet.chain.slug,
    );

    if (foundCoinPrice) {
      resultAsset.usdBalance = BigNumber(foundCoinPrice)
        .times(BigNumber(fetchedNativeBalance.quantity))
        .toString();
      resultAsset.usdPrice = String(foundCoinPrice);
    }

    return {
      meta: {
        id: wallet.id,
        provider: wallet.provider,
        address: wallet.address,
        name: wallet.name,
        image:
          TOOLS_META_STATIC[WALLET_PROVIDERS_TO_TOOLS_NAME[wallet.provider]]
            ?.image ?? null,
        chain: {
          id: wallet.chain.id,
          image: wallet.chain.image,
        },
      },
      nativeBalance: resultAsset,
    };
  }

  sortByCriteria(
    walletsWithNatives: PricedHotWalletNativeBalanceDTO[],
    orderBy: OrderNativePricedHotWallets,
    orderType: OrderKeywordsEnum,
  ): PricedHotWalletNativeBalanceDTO[] {
    return walletsWithNatives.sort((a, b) => {
      const aValue = a.nativeBalance[orderBy];
      const bValue = b.nativeBalance[orderBy];

      switch (orderType) {
        case OrderKeywordsEnum.DESC:
          if (typeof aValue === 'string') {
            return BigNumber(aValue).isGreaterThan(bValue) ? 1 : -1;
          }
          return 1;
        case OrderKeywordsEnum.ASC:
          if (typeof aValue === 'string') {
            return BigNumber(bValue).isGreaterThan(aValue) ? -1 : 1;
          }
          return 1;
      }
    });
  }
}
