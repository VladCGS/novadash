import { ComputedUserReserve } from '@aave/math-utils';
import {
  LendBorrowProviders,
  SupportedReserveLendBorrow,
} from '@app/common/entities/borrowing/reserve.entity';
import { Wallet } from '@app/common/entities/transactions';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';
import { AaveV3EvmDelegator } from '@app/common/modules/aave-v3-evm/services/aave-v3.delegator';
import { DataSupportedLendBorrowReservesService } from '@app/common/modules/data-supported-lends-borrows/services/data-supported-reserves.service';
import { Injectable, Logger } from '@nestjs/common';
import { UserLendAssetDTO } from '../dto/user-lending-assets-response.dto';
import { UserLendingAssetsUtilsService } from './user-lending-assets-utils.service';
import BigNumber from 'bignumber.js';
import { Web3DirectDataDelegator } from '@app/common/modules/web3-direct-data/services/web3-direct-data.delegator';

@Injectable()
export class UserAaveLendingAssetsService {
  private logger = new Logger(UserAaveLendingAssetsService.name);

  constructor(
    private aaveDelegator: AaveV3EvmDelegator,
    private dataSupportedReserves: DataSupportedLendBorrowReservesService,
    private userLendingAssetsUtils: UserLendingAssetsUtilsService,
    private web3DirectDataDelegator: Web3DirectDataDelegator,
  ) {}

  async getQuantity(
    dbReserve: SupportedReserveLendBorrow,
    wallet: Wallet,
  ): Promise<string | undefined> {
    if (dbReserve.provider === LendBorrowProviders.AAVE) {
      const web3DataProvider = this.web3DirectDataDelegator.getDataProvider(
        wallet.chain.slug,
      );

      const rawQuantity = await web3DataProvider.getERC20BalanceWEI(
        dbReserve.lendPlatformCoin.tokenAddress,
        wallet.address,
      );
      const quantityBn = humanizeTokenQuantity(
        rawQuantity.toString(),
        dbReserve.lendPlatformCoin.decimals,
      );

      return quantityBn.toString();
    }
  }

  async getAaveUserLendAssets(wallet: Wallet): Promise<UserLendAssetDTO[]> {
    const aavePureService = this.aaveDelegator.setChain(wallet.chain.slug);

    const userSummary = await aavePureService.getUserSummary(wallet.address);

    const userReservesData = userSummary.userReservesData;

    const userReserves = userReservesData.filter(
      (r) => Number(r.underlyingBalance) > 0,
    );

    this.logger.debug(
      `Wallet [${wallet.address}] on chain [${
        wallet.chain.slug
      }] have AAVE-V3 reserves: '${userReserves
        .map((o) => o.reserve.symbol)
        .join(', ')}'`,
    );

    const assets: UserLendAssetDTO[] = [];
    for (const reserve of userReserves) {
      const formedUserLendAsset = await this.formUserLendAsset(reserve, wallet);

      this.logger.debug(
        `AAVE-V3 Reserve '${reserve.reserve.symbol}' for wallet ${wallet.address} formed!`,
      );

      if (formedUserLendAsset) {
        assets.push(formedUserLendAsset);
      }
    }

    return assets;
  }

  private async formUserLendAsset(
    reserve: ComputedUserReserve,
    wallet: Wallet,
  ): Promise<UserLendAssetDTO | undefined> {
    const dbReserve =
      await this.dataSupportedReserves.getReserveByUnderlyingAddressAndChainId(
        reserve.underlyingAsset,
        wallet.chain.id,
      );

    if (!dbReserve) {
      this.logger.debug(
        `Reserve '${reserve.reserve.symbol}' not inited in database!`,
      );
      return;
    }

    if (dbReserve.provider !== LendBorrowProviders.AAVE) {
      this.logger.debug(
        `Reserve ${reserve.reserve.symbol} for wallet ${wallet.address} not provided by AAVE-V3!`,
      );
      return;
    }

    const usdPrice = reserve.reserve.priceInUSD;

    const quantity = await this.getQuantity(dbReserve, wallet);

    return {
      walletMeta: this.userLendingAssetsUtils.formatWalletMeta(wallet),
      coreTokenMeta: this.userLendingAssetsUtils.formatTokenMeta(dbReserve),
      reserveMeta: this.userLendingAssetsUtils.formatReserveMeta(dbReserve),
      providerMeta: this.userLendingAssetsUtils.formatProviderMeta(
        dbReserve.providerMeta,
      ),
      lendingAssetInfo: {
        usdBalance: quantity
          ? BigNumber(quantity).times(usdPrice.toString()).toString()
          : '0',
        lendingPercent: { year1: dbReserve.lendAPY.toString() },
        quantityBalance: quantity ? quantity.toString() : '0',
        usdTokenPrice: usdPrice.toString(),
      },
    };
  }
}
