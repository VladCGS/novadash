import { ProviderMetaDTO } from '@app/common/dtos/default-dao-common.dto';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import { Chain, ToolMeta, Wallet } from '@app/common/entities/transactions';
import { Injectable, Logger } from '@nestjs/common';
import {
  ChainMetaDTO,
  CorePlatformCoinMetaDTO,
  ReserveTokenMetaDTO,
  WalletMetaDTO,
} from '../dto/user-lending-assets-response.dto';

@Injectable()
export class UserLendingAssetsUtilsService {
  private logger = new Logger(UserLendingAssetsUtilsService.name);

  formatChainMeta(chain: Chain): ChainMetaDTO {
    return {
      name: chain.name,
      image: chain.image,
      id: chain.id,
    };
  }

  formatWalletMeta(wallet: Wallet): WalletMetaDTO {
    const chainMeta = this.formatChainMeta(wallet.chain);

    return {
      name: wallet.name,
      address: wallet.address,
      provider: wallet.provider,
      image: wallet.meta.image,
      chain: chainMeta,
    };
  }

  formatTokenMeta(
    dbReserve: SupportedReserveLendBorrow,
  ): CorePlatformCoinMetaDTO {
    const coinMeta = dbReserve.corePlatformCoin.coinMetadata;

    return {
      tokenAddress: dbReserve.corePlatformCoin.tokenAddress,
      name: coinMeta.name,
      symbol: coinMeta.symbol,
      image: coinMeta.image,
      platformCoinId: dbReserve.corePlatformCoin.id,
    };
  }

  formatReserveMeta(
    dbReserve: SupportedReserveLendBorrow,
  ): ReserveTokenMetaDTO {
    const coinMeta = dbReserve.lendPlatformCoin.coinMetadata;

    return {
      id: dbReserve.id,
      reserveAddress: dbReserve.reserveAddress,
      name: coinMeta.name,
      image: coinMeta.image,
      symbol: coinMeta.symbol,
      provider: dbReserve.providerMeta.name,
    };
  }

  formatProviderMeta(toolMeta: ToolMeta): ProviderMetaDTO {
    return {
      name: toolMeta.name,
      image: toolMeta.image,
      type: 'Exchange',
    };
  }
}
