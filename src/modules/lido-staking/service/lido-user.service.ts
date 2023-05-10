import { DataWalletService } from '@app/common/modules/data-wallet/services/data.wallet.service';
import { PureLidoService } from '@app/common/modules/lido-evm/service/pure-lido.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  ChainMetaDTO,
  CoinMetaDTO,
  StakedNativeBalanceDTO,
  UserStakedNativeBalancesPagedDTO,
  WalletMetaDTO,
} from '../dto/lido-user-responce.dto';
import { Chain, ToolMeta, Wallet } from '@app/common/entities/transactions';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { LidoBalancesRequestDTO } from '../dto/lido-user-request.dto';
import { emptyPagedResult } from '@app/common/utils/empty-paged-result.util';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { ProviderMetaDTO } from '@app/common/dtos/default-dao-common.dto';
import {
  TOOLS_META_STATIC,
  ToolsNames,
} from '@app/common/modules/common/tools-meta.const';
import { utils } from 'ethers';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { NativeCoinsSymbols } from '@app/common/constants/native-coins.const';

@Injectable()
export class LidoUserService {
  private logger = new Logger(LidoUserService.name);

  constructor(
    private pureLidoService: PureLidoService,
    private dataWalletService: DataWalletService,
    private coinPriceService: CoinPriceService,
    private dataPlatformCoinService: DataPlatformCoinService,
  ) {}

  async getAllStakedBalances(
    userId: string,
    body: LidoBalancesRequestDTO,
  ): Promise<UserStakedNativeBalancesPagedDTO> {
    const { page, size } = body;

    const walletsEth =
      await this.dataWalletService.findManyByUserIdAndChainSlugs(userId, [
        'eth',
      ]);

    const walletsMatic =
      await this.dataWalletService.findManyByUserIdAndChainSlugs(userId, [
        'matic',
      ]);

    if (!walletsEth.length && !walletsMatic.length) {
      return emptyPagedResult({ page, size });
    }

    const stEthBalance = await this.getEthStakedBalances(walletsEth);

    const stMaticBalance = await this.getMaticStakedBalances(walletsMatic);

    if (!stEthBalance.length && !stMaticBalance.length) {
      return emptyPagedResult({ page, size });
    }

    return this.paginateStakedBalances(
      [...stEthBalance, ...stMaticBalance],
      body,
    );
  }

  private paginateStakedBalances(
    balances: StakedNativeBalanceDTO[],
    { page, size }: LidoBalancesRequestDTO,
  ): UserStakedNativeBalancesPagedDTO {
    const total = balances.length;

    const startIndex = page * size - size;
    const endIndex = startIndex + size;

    const pages = total ? Math.ceil(total / size) : 1;

    return {
      result: balances.slice(startIndex, endIndex),
      page,
      size,
      pages,
      total,
    };
  }

  private async getEthStakedBalances(
    wallets: Wallet[],
  ): Promise<StakedNativeBalanceDTO[]> {
    const result: StakedNativeBalanceDTO[] = [];

    if (!wallets.length) {
      this.logger.debug(`[getEthStakedBalance] walets length === 0!`);
      return result;
    }

    const foundPlatformCoin =
      await this.dataPlatformCoinService.findOneByAddressAndChaiSlugOrFail(
        NATIVE_UNI_ADDRESS,
        'eth',
      );

    const apr = await this.pureLidoService.getEthApr();

    for (const wallet of wallets) {
      const balanceWei = await this.pureLidoService.getStETHBalanceOf(
        wallet.address,
      );

      const balance = parseFloat(utils.formatEther(balanceWei));

      if (balance <= 0) {
        continue;
      }

      const usdPriceDb = await this.coinPriceService.findEVMOrSaveAndReturn({
        tokenAddress: NATIVE_UNI_ADDRESS,
        chain: wallet.chain,
      });

      const providerMeta = await this.formatProviderMeta();

      result.push({
        quantity: balance.toString(),
        walletMeta: this.formatWalletMeta(wallet),
        usdPrice: usdPriceDb.usdPrice,
        usdBalance: (balance * parseFloat(usdPriceDb.usdPrice)).toString(),
        apr: apr.toFixed(2),
        providerMeta,
        coinMeta: this.formatCoinMeta(foundPlatformCoin),
      });
    }

    return result;
  }

  private async getMaticStakedBalances(
    wallets: Wallet[],
  ): Promise<StakedNativeBalanceDTO[]> {
    const result: StakedNativeBalanceDTO[] = [];

    if (!wallets.length) {
      this.logger.debug(`[getMaticStakedBalances] walets length === 0!`);
      return result;
    }

    const foundPlatformCoin =
      await this.dataPlatformCoinService.findOneByAddressAndChaiSlugOrFail(
        NATIVE_UNI_ADDRESS,
        'matic',
      );

    const apr = await this.pureLidoService.getPolygonApr();

    for (const wallet of wallets) {
      const balanceWei = await this.pureLidoService.getStMaticBalanceOf(
        wallet.address,
      );

      const balance = parseFloat(utils.formatEther(balanceWei));

      if (balance <= 0) {
        continue;
      }

      const usdPriceDb = await this.coinPriceService.findEVMOrSaveAndReturn({
        tokenAddress: NATIVE_UNI_ADDRESS,
        chain: wallet.chain,
      });

      const providerMeta = await this.formatProviderMeta();

      result.push({
        quantity: balance.toString(),
        walletMeta: this.formatWalletMeta(wallet),
        usdPrice: usdPriceDb.usdPrice,
        usdBalance: (balance * parseFloat(usdPriceDb.usdPrice)).toString(),
        apr: apr.toFixed(2),
        providerMeta,
        coinMeta: this.formatCoinMeta(foundPlatformCoin)
      });
    }

    return result;
  }

  private formatWalletMeta(wallet: Wallet): WalletMetaDTO {
    const chainMeta = this.formatChainMeta(wallet.chain);

    return {
      name: wallet.name,
      address: wallet.address,
      provider: wallet.provider,
      image: wallet.meta.image,
      chain: chainMeta,
    };
  }

  private formatChainMeta(chain: Chain): ChainMetaDTO {
    return {
      name: chain.name,
      image: chain.image,
      id: chain.id,
    };
  }

  private formatCoinMeta(coin: PlatformCoin): CoinMetaDTO {
    let symbol = NativeCoinsSymbols.ETH;

    if (coin.chain.slug === 'matic') {
      symbol = NativeCoinsSymbols.MATIC;
    }

    return {
      name: coin.coinMetadata.name,
      image: coin.coinMetadata.image,
      symbol,
    };
  }

  private async formatProviderMeta(): Promise<ProviderMetaDTO> {
    const providerMeta = await ToolMeta.findOne({
      where: { name: TOOLS_META_STATIC[ToolsNames.LIDO].name },
    });

    return {
      name: providerMeta.name,
      image: providerMeta.image,
      type: 'Staking',
    };
  }
}
