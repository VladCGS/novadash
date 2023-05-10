import { PlatformCoin } from '@app/common/entities/alphaping';
import { Injectable } from '@nestjs/common';
import { DataExchangeSwapSelectorService } from '@app/common/modules/data-exchange-swap/services/data.exchange-swap-selector.service';
import { IHotWalletTokenMeta } from '@app/common/modules/priced-wallet/types/fetch-evm-balances.types';
import { In } from 'typeorm';
import {
  IFindCEXSupportedTokenAddresses,
  IFindDEXSupportedTokenAddresses,
} from '../types/filter-supported-option.types';

@Injectable()
export class ExchProvidersBalancesService {
  constructor(
    private dataExchangeSwapSelectorService: DataExchangeSwapSelectorService,
  ) {}

  formTokensDataToMap<T extends { tokenAddress: string }>(
    balances: T[],
  ): Record<string, T> {
    const accum: Record<string, T> = {};
    for (const balance of balances) {
      accum[balance.tokenAddress] = balance;
    }

    return accum;
  }

  async findDEXUsableCoinsMetaByAddresses({
    tokenAddresses,
    wallet,
  }: IFindDEXSupportedTokenAddresses): Promise<IHotWalletTokenMeta[]> {
    const foundPlatformCoins = await PlatformCoin.createQueryBuilder(
      'platformCoin',
    )
      .where('platformCoin.tokenAddress IN (:...tokenAddresses)', {
        tokenAddresses,
      })
      .andWhere({
        chain: { id: wallet.chain.id },
      })
      .getMany();

    const platCoinIds = foundPlatformCoins.map((o) => o.id);

    const foundMeta =
      await this.dataExchangeSwapSelectorService.getPlatformCoins({
        platCoinIds,
        chainId: wallet.chain.id,
      });

    return foundMeta.map(({ chainImage, chainName, chainIdDB, ...other }) => ({
      ...other,
      chain: {
        id: chainIdDB,
        name: chainName,
        image: chainImage,
      },
    }));
  }

  async findCEXUsableCoinsMetaByAddresses({
    cex,
    tokenAddresses,
    wallet,
  }: IFindCEXSupportedTokenAddresses): Promise<IHotWalletTokenMeta[]> {
    const foundPlatformCoins = await PlatformCoin.createQueryBuilder(
      'platformCoin',
    )
      .where('platformCoin.tokenAddress IN (:...tokenAddresses)', {
        tokenAddresses,
      })
      .andWhere({
        chain: { id: wallet.chain.id },
      })
      .getMany();

    const platCoinIds = foundPlatformCoins.map((o) => o.id);

    const foundMeta =
      await this.dataExchangeSwapSelectorService.getPlatformCoins({
        platCoinIds,
        chainId: wallet.chain.id,
      });

    return foundMeta.map(({ chainImage, chainName, chainIdDB, ...other }) => ({
      ...other,
      chain: {
        id: chainIdDB,
        name: chainName,
        image: chainImage,
      },
    }));
  }

  async findAllCoinsMetaByAddresses({
    tokenAddresses,
    wallet,
  }: IFindDEXSupportedTokenAddresses): Promise<IHotWalletTokenMeta[]> {
    const foundPlatformCoins = await PlatformCoin.find({
      where: {
        tokenAddress: In(tokenAddresses),
        chain: {
          id: wallet.chain.id,
        },
      },
      relations: {
        chain: true,
        coinMetadata: true,
      },
    });

    return foundPlatformCoins.map((coin) => ({
      image: coin.coinMetadata.image,
      name: coin.coinMetadata.name,
      tokenAddress: coin.tokenAddress,
      symbol: coin.coinMetadata.symbol,
      chain: {
        id: coin.chain.id,
        name: coin.chain.name,
        image: coin.chain.image,
      },
    }));
  }

  async findOnePlatformCoinMetaByAddresses(
    tokenAddress: string,
    chainDBId: string,
  ): Promise<IHotWalletTokenMeta> {
    const foundPlatformCoin = await PlatformCoin.findOne({
      where: {
        tokenAddress: tokenAddress,
        chain: {
          id: chainDBId,
        },
      },
      relations: {
        chain: true,
        coinMetadata: true,
      },
    });

    return {
      image: foundPlatformCoin.coinMetadata.image,
      name: foundPlatformCoin.coinMetadata.name,
      tokenAddress: foundPlatformCoin.tokenAddress,
      symbol: foundPlatformCoin.coinMetadata.symbol,
      chain: {
        id: foundPlatformCoin.chain.id,
        name: foundPlatformCoin.chain.name,
        image: foundPlatformCoin.chain.image,
      },
    };
  }
}
