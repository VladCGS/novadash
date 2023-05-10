import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import {
  LendBorrowProviders,
  SupportedReserveLendBorrow,
} from '@app/common/entities/borrowing/reserve.entity';
import { Wallet } from '@app/common/entities/transactions';
import { PureCompoundV2Service } from '@app/common/modules/compound-v2-evm/services/pure-compound-v2.service';
import { DataSupportedLendBorrowReservesService } from '@app/common/modules/data-supported-lends-borrows/services/data-supported-reserves.service';
import { Injectable, Logger } from '@nestjs/common';

import { UserLendAssetDTO } from '../dto/user-lending-assets-response.dto';
import { UserLendingAssetsUtilsService } from './user-lending-assets-utils.service';

@Injectable()
export class UserCompoundLendingAssetsService {
  constructor(
    private pureCompoundService: PureCompoundV2Service,
    private dataSupportedReservesService: DataSupportedLendBorrowReservesService,
    private userLendingAssetsUtils: UserLendingAssetsUtilsService,
  ) {}

  private logger = new Logger(UserCompoundLendingAssetsService.name);

  async getCompoundUserLendAssets(wallet: Wallet): Promise<UserLendAssetDTO[]> {
    const result: UserLendAssetDTO[] = [];

    const compoundReserves =
      await this.dataSupportedReservesService.getReservesByProvider(
        LendBorrowProviders.COMPOUND,
      );

    if (!compoundReserves.length) {
      this.logger.debug(`Compound reserves for ${wallet.address} not found!`);
      return [];
    }

    for (const reserve of compoundReserves) {
      const asset = await this.formCompoundUserLendAsset(reserve, wallet);

      if (asset) {
        this.logger.debug(
          `Compound reserve ${reserve.corePlatformCoin.coinMetadata.symbol} formed for wallet ${wallet.address}`,
        );

        result.push(asset);
      }
    }

    return result;
  }

  private async formCompoundUserLendAsset(
    reserve: SupportedReserveLendBorrow,
    wallet: Wallet,
  ): Promise<UserLendAssetDTO | undefined> {
    const cTokenAddress = reserve.lendPlatformCoin.tokenAddress;

    const cTokenQuantityBalance = await this.pureCompoundService.cTokenBalance(
      cTokenAddress,
      wallet.address,
    );

    this.logger.debug(
      `Compount quantity balance for reserve ${
        reserve.corePlatformCoin.coinMetadata.symbol
      } and wallet ${wallet.address} is ${cTokenQuantityBalance.toString()}`,
    );

    if (cTokenQuantityBalance.comparedTo(0) < 1) {
      return;
    }

    const underlyingBalance = await this.pureCompoundService.underlyingBalance(
      cTokenAddress,
      wallet.address,
      reserve.corePlatformCoin.tokenAddress === NATIVE_UNI_ADDRESS,
    );

    const supplyAPY = await this.pureCompoundService.getSupplyAPY(
      cTokenAddress,
    );

    const asset: UserLendAssetDTO = {
      coreTokenMeta: {
        image: reserve.corePlatformCoin.coinMetadata.image,
        name: reserve.corePlatformCoin.coinMetadata.name,
        platformCoinId: reserve.corePlatformCoin.id,
        symbol: reserve.corePlatformCoin.coinMetadata.symbol,
        tokenAddress: reserve.corePlatformCoin.tokenAddress,
      },
      lendingAssetInfo: {
        usdBalance: underlyingBalance.toString(),
        lendingPercent: {
          year1: supplyAPY.toString(),
        },
        quantityBalance: cTokenQuantityBalance.toString(),
        usdTokenPrice: '0',
      },
      providerMeta: this.userLendingAssetsUtils.formatProviderMeta(
        reserve.providerMeta,
      ),
      walletMeta: this.userLendingAssetsUtils.formatWalletMeta(wallet),
      reserveMeta: this.userLendingAssetsUtils.formatReserveMeta(reserve),
    };

    return asset;
  }
}
