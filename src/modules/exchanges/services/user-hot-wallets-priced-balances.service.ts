import { Injectable } from '@nestjs/common';
import { PricedHotWalletWithBalancesDTO } from '../dto/trade-common-responses.dto';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { ExchProvidersBalancesService } from './exch-providers-balances.service';
import { FetchWalletBalancesService } from '@app/common/modules/priced-wallet/services/fetch-wallet-balances.service';
import {
  IComboWalletBalance,
  IHotWalletTokenMeta,
  IRawWalletBalance,
} from '@app/common/modules/priced-wallet/types/fetch-evm-balances.types';
import { Wallet } from '@app/common/entities/transactions';
import { In } from 'typeorm';
import { IFilterSupportedOptions } from '../types/filter-supported-option.types';
import { SupportedCEXProviders } from '@app/common/entities/pairs';

@Injectable()
export class UserHotWalletPricedBalancesService {
  constructor(
    private exchSwapSellUser: ExchProvidersBalancesService,
    private dataPlatformCoinService: DataPlatformCoinService,
    private fetchWalletBalancesService: FetchWalletBalancesService,
  ) {}

  async getAllPriced(
    userId: string,
    options?: IFilterSupportedOptions,
  ): Promise<PricedHotWalletWithBalancesDTO[] | null> {
    let onlyWithOneOfCoinsAddresses:
      | { address: string; chainId: string }[]
      | undefined;
    let addressHashMap: Record<string, string[]> | undefined;

    if (options?.onlyPlatformCoinsIds?.length) {
      onlyWithOneOfCoinsAddresses =
        await this.dataPlatformCoinService.findAddressesWithChains(
          options.onlyPlatformCoinsIds,
        );
      addressHashMap = this.formTokensDataToChainMap(
        onlyWithOneOfCoinsAddresses,
      );
    }
    const onlyChains = addressHashMap ? Object.keys(addressHashMap) : [];

    const foundWallets = await Wallet.find({
      where: {
        user: {
          id: userId,
        },
        chain: onlyChains.length
          ? {
              id: In(onlyChains),
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

    const formedWallets: PricedHotWalletWithBalancesDTO[] = [];

    for (const wallet of foundWallets) {
      const fetchedBalances =
        await this.fetchWalletBalancesService.fetchWalletBalances(wallet);

      const chainId = wallet.chain.id;
      let hasRequiredTokens = true;
      if (options?.onlyPlatformCoinsIds) {
        hasRequiredTokens = await this.checkIfBalancesHasCoins(
          fetchedBalances,
          addressHashMap[chainId],
        );
      }

      if (!hasRequiredTokens) {
        continue;
      }

      const formedWallet = await this.formOnePricedWallet(
        wallet,
        fetchedBalances,
        options,
      );

      formedWallets.push(formedWallet);
    }

    return formedWallets;
  }

  private formTokensDataToChainMap(
    coinsData: { address: string; chainId: string }[],
  ): Record<string, string[]> {
    const accum: Record<string, string[]> = {};
    for (const coinData of coinsData) {
      if (!(coinData.chainId in accum)) {
        accum[coinData.chainId] = [coinData.address];
      } else {
        accum[coinData.chainId].push(coinData.address);
      }
    }

    return accum;
  }

  private async checkIfBalancesHasCoins(
    fetchedBalances: IRawWalletBalance[],
    requiredTokenAddresses: string[],
  ): Promise<boolean> {
    const walletTokenAddresses = fetchedBalances.map(
      (balance) => balance.tokenAddress,
    );

    if (!walletTokenAddresses.length) {
      return false;
    }

    return walletTokenAddresses.some((tokenAddress) =>
      requiredTokenAddresses.includes(tokenAddress),
    );
  }

  private async formOnePricedWallet(
    wallet: Wallet,
    fetchedBalances: IRawWalletBalance[],
    options?: IFilterSupportedOptions,
  ): Promise<PricedHotWalletWithBalancesDTO> {
    const mappedFetchedBalances =
      this.exchSwapSellUser.formTokensDataToMap(fetchedBalances);
    const tokenAddressesByBalances = Object.keys(mappedFetchedBalances);

    let balancesMeta: Record<string, IHotWalletTokenMeta> | undefined;
    if (options?.onlySupportedByDEXs) {
      balancesMeta = await this.formBalancesMetaBySupportedDEXs(
        wallet,
        tokenAddressesByBalances,
      );
    } else {
      balancesMeta = await this.formBalancesMeta(
        wallet,
        tokenAddressesByBalances,
      );
    }

    const resultTokenAddress = Object.keys(balancesMeta);

    const resultBalances: IComboWalletBalance[] = resultTokenAddress.map(
      (tokenAddress) => ({
        ...balancesMeta[tokenAddress],
        ...mappedFetchedBalances[tokenAddress],
      }),
    );

    return this.fetchWalletBalancesService.priceWalletTokens(
      wallet,
      resultBalances,
    );
  }

  private async formBalancesMetaBySupportedDEXs(
    wallet: Wallet,
    tokenAddressesByBalances: string[],
  ): Promise<Record<string, IHotWalletTokenMeta>> {
    const foundSupportedPlatformCoinsMeta =
      await this.exchSwapSellUser.findDEXUsableCoinsMetaByAddresses({
        tokenAddresses: tokenAddressesByBalances,
        wallet,
      });

    return this.exchSwapSellUser.formTokensDataToMap(
      foundSupportedPlatformCoinsMeta,
    );
  }

  private async formBalancesMetaBySupportedCEX(
    cex: SupportedCEXProviders,
    wallet: Wallet,
    tokenAddressesByBalances: string[],
  ): Promise<Record<string, IHotWalletTokenMeta>> {
    const foundSupportedPlatformCoinsMeta =
      await this.exchSwapSellUser.findDEXUsableCoinsMetaByAddresses({
        tokenAddresses: tokenAddressesByBalances,
        wallet,
      });

    return this.exchSwapSellUser.formTokensDataToMap(
      foundSupportedPlatformCoinsMeta,
    );
  }

  private async formBalancesMeta(
    wallet: Wallet,
    tokenAddressesByBalances: string[],
  ): Promise<Record<string, IHotWalletTokenMeta>> {
    const foundSupportedPlatformCoinsMeta =
      await this.exchSwapSellUser.findAllCoinsMetaByAddresses({
        tokenAddresses: tokenAddressesByBalances,
        wallet,
      });

    return this.exchSwapSellUser.formTokensDataToMap(
      foundSupportedPlatformCoinsMeta,
    );
  }
}
