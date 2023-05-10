import { DataWalletService } from '@app/common/modules/data-wallet/services/data.wallet.service';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { emptyPagedResult } from '@app/common/utils/empty-paged-result.util';
import { Injectable, Logger } from '@nestjs/common';
import {
  OrderLendingAssetsByEnum,
  UserLendingAssetsPagedRequestDTO,
} from '../dto/user-lending-assets-request.dto';
import {
  UserLendAssetDTO,
  UserLendingAssetsPagedDTO,
} from '../dto/user-lending-assets-response.dto';
import { UserAaveLendingAssetsService } from './user-aave-lending-assets.service';
import { UserCompoundLendingAssetsService } from './user-compound-lending-assets.service';
import { SUPPORTED_EVM_SLUGS } from '@app/common/constants/supported-evm-chains.const';
import { DB_SLUG_TO_AAVE_ADDRESSES } from '@app/common/constants/chains-aave-v3.const';

@Injectable()
export class UserLendingAssetsService {
  private logger = new Logger(UserLendingAssetsService.name);

  constructor(
    private dataWalletService: DataWalletService,
    private userAaveLendingAssetsService: UserAaveLendingAssetsService,
    private userCompoundLendingAssetsService: UserCompoundLendingAssetsService,
  ) {}

  async getAllByUserPaged(
    userId: string,
    pagedRequest: UserLendingAssetsPagedRequestDTO,
  ): Promise<UserLendingAssetsPagedDTO> {
    const { page, size, orderBy, orderType, search } = pagedRequest;

    let lendingUserAssets: UserLendAssetDTO[] = await this.getAllByUser(userId);

    if (!lendingUserAssets.length) {
      return emptyPagedResult({ page, size });
    }

    if (search) {
      lendingUserAssets = this.searchAssets(lendingUserAssets, search);
    }

    if (orderBy && orderType) {
      lendingUserAssets = this.sortAssets(
        lendingUserAssets,
        orderBy,
        orderType,
      );
    }

    return this.paginateAssets(lendingUserAssets, size, page);
  }

  async getAllByUser(userId: string): Promise<UserLendAssetDTO[]> {
    const aaveAssets = await this.getAaveLendAssets(userId);
    const compoundAssets = await this.getCompoundLendAssets(userId);

    return [...aaveAssets, ...compoundAssets];
  }

  private async getAaveLendAssets(userId: string): Promise<UserLendAssetDTO[]> {
    const assets: UserLendAssetDTO[] = [];

    const supportedChainSLugs = Object.values(SUPPORTED_EVM_SLUGS);

    const aaveChainSlugs = Object.keys(DB_SLUG_TO_AAVE_ADDRESSES);
    const supportedAavePlatformSlugs = supportedChainSLugs.filter((slug) =>
      aaveChainSlugs.includes(slug),
    );

    const foundWalletsForAave =
      await this.dataWalletService.findManyByUserIdAndChainSlugs(
        userId,
        supportedAavePlatformSlugs,
      );

    for (const userWalletAave of foundWalletsForAave) {
      const aaveUserReserves =
        await this.userAaveLendingAssetsService.getAaveUserLendAssets(
          userWalletAave,
        );

      if (aaveUserReserves.length) {
        assets.push(...aaveUserReserves);
      }
    }

    return assets;
  }

  private async getCompoundLendAssets(
    userId: string,
  ): Promise<UserLendAssetDTO[]> {
    const assets: UserLendAssetDTO[] = [];

    const foundWalletsForCompound =
      await this.dataWalletService.findManyByUserIdAndChainSlugs(userId, [
        'eth',
      ]);

    for (const userWalletCompound of foundWalletsForCompound) {
      const compoundUserReserves =
        await this.userCompoundLendingAssetsService.getCompoundUserLendAssets(
          userWalletCompound,
        );

      if (compoundUserReserves.length) {
        assets.push(...compoundUserReserves);
      }
    }

    return assets;
  }

  private paginateAssets(
    assets: UserLendAssetDTO[],
    size: number,
    page: number,
  ): UserLendingAssetsPagedDTO {
    const total = assets.length;

    const pages = total ? Math.ceil(total / size) : 1;

    const startIndex = page * size - size;
    const endIndex = startIndex + size;

    return {
      page,
      size,
      pages,
      result: assets.slice(startIndex, endIndex),
      total,
    };
  }

  private sortAssets(
    assets: UserLendAssetDTO[],
    orderBy: OrderLendingAssetsByEnum,
    orderType: OrderKeywordsEnum,
  ): UserLendAssetDTO[] {
    return assets.sort((a: UserLendAssetDTO, b: UserLendAssetDTO) => {
      let result = 0;
      switch (orderBy) {
        case OrderLendingAssetsByEnum.PROVIDER: {
          result = a.providerMeta.name.localeCompare(b.providerMeta.name);
          break;
        }
        case OrderLendingAssetsByEnum.USD_BALANCE: {
          result =
            Number(a.lendingAssetInfo.usdBalance) -
            Number(b.lendingAssetInfo.usdBalance);
          break;
        }
      }

      if (orderType === OrderKeywordsEnum.DESC) {
        result = -result;
      }

      return result;
    });
  }

  private searchAssets(assets: UserLendAssetDTO[], search: string): UserLendAssetDTO[] {
    return assets.filter((asset: UserLendAssetDTO) =>
      this.isStartsWith(
        [
          asset.coreTokenMeta.name,
          asset.coreTokenMeta.symbol,
          asset.reserveMeta.name,
          asset.reserveMeta.symbol,
          asset.reserveMeta.reserveAddress,
          asset.providerMeta.name,
          asset.lendingAssetInfo.usdBalance.toString(),
          asset.lendingAssetInfo.lendingPercent.year1.toString(),
        ],
        search,
      ),
    );
  }

  private isStartsWith(source: string[], search: string): boolean {
    for (const str of source) {
      const result = str.toLowerCase().startsWith(search.toLocaleLowerCase());
      if (result) return result;
    }
    return false;
  }
}
