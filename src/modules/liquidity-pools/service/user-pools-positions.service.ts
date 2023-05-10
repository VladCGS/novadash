import { DataWalletPoolService } from '@app/common/modules/data-wallet/services/data.wallet-pool.service';
import { UniswapUserActivePositionsService } from '@app/common/modules/uniswap-pools/service/uniswap-user-active-positions.service';
import { UniswapUserInactivePositionsService } from '@app/common/modules/uniswap-pools/service/uniswap-user-inactive-positions.service';
import { Injectable } from '@nestjs/common';
import { PageQueryDTO } from '../../transaction/dto/transaction-requests.dto';
import {
  PoolActivePositionInfoWithMetaDTO,
  PoolInactivePositionInfoWithMetaDTO,
} from '../dto/liquidity-pools-user-positions-common.dto';
import {
  PoolsActivePositionsPageDTO,
  PoolsInactivePositionsPageDTO,
} from '../dto/liquidity-pools-user-positions-response.dto';

@Injectable()
export class UserPoolsPositionsService {
  constructor(
    private uniswapUserActivePositionsService: UniswapUserActivePositionsService,
    private uniswapUserInactivePositionsService: UniswapUserInactivePositionsService,
    private dataWalletPoolService: DataWalletPoolService,
  ) {}

  async getActivePositions(
    body: PageQueryDTO,
    userId: string,
  ): Promise<PoolsActivePositionsPageDTO> {
    const userWallets =
      await this.dataWalletPoolService.findAddressesAndChainByUserOrFail(
        userId,
      );

    let positionsWithMetas: PoolActivePositionInfoWithMetaDTO[] = [];

    for (const userWallet of userWallets) {
      positionsWithMetas.push(
        ...(await this.uniswapUserActivePositionsService.formActivePositionsInfo(
          userWallet,
        )),
      );
    }

    const paginationInfo = this.formPaginationInfo(
      positionsWithMetas.length,
      body.size,
    );
    positionsWithMetas = this.sortPositionsByReward(positionsWithMetas);
    const sliceIndexes = this.formSliceIndexes(body.size, body.page);
    positionsWithMetas = this.slicePositions(
      positionsWithMetas,
      sliceIndexes.sliceIndexFrom,
      sliceIndexes.sliceIndexTo,
    );

    return {
      page: body.page,
      size: body.size,
      total: paginationInfo.total,
      pages: paginationInfo.pages,
      result: positionsWithMetas,
    };
  }

  async getInactivePositions(
    body: PageQueryDTO,
    userId: string,
  ): Promise<PoolsInactivePositionsPageDTO> {
    const userWallets =
      await this.dataWalletPoolService.findAddressesAndChainByUserOrFail(
        userId,
      );

    let positionsWithMetas: PoolInactivePositionInfoWithMetaDTO[] = [];

    for (const userWallet of userWallets) {
      positionsWithMetas.push(
        ...(await this.uniswapUserInactivePositionsService.formInactivePositionsInfo(
          userWallet,
        )),
      );
    }

    const paginationInfo = this.formPaginationInfo(
      positionsWithMetas.length,
      body.size,
    );
    const sliceIndexes = this.formSliceIndexes(body.size, body.page);
    positionsWithMetas = this.slicePositions(
      positionsWithMetas,
      sliceIndexes.sliceIndexFrom,
      sliceIndexes.sliceIndexTo,
    );

    return {
      page: body.page,
      size: body.size,
      total: paginationInfo.total,
      pages: paginationInfo.pages,
      result: positionsWithMetas,
    };
  }

  private formPaginationInfo(
    listLength: number,
    pageSize: number,
  ): { total: number; pages: number } {
    const pages = Math.ceil(listLength / pageSize);

    return { total: listLength, pages };
  }

  private sortPositionsByReward(
    positionsWithMetas: PoolActivePositionInfoWithMetaDTO[],
  ): PoolActivePositionInfoWithMetaDTO[] {
    return positionsWithMetas.sort(
      (position0, position1) =>
        position1.positionInfo.usdProfitLoss -
        position0.positionInfo.usdProfitLoss,
    );
  }

  private formSliceIndexes(
    pageSize: number,
    pageNumber: number,
  ): { sliceIndexFrom: number; sliceIndexTo: number } {
    const sliceIndexFrom = (pageNumber - 1) * pageSize;
    const sliceIndexTo = sliceIndexFrom + pageSize;

    return { sliceIndexFrom, sliceIndexTo };
  }

  private slicePositions<T>(
    positionsWithMetas: T[],
    sliceIndexFrom: number,
    sliceIndexTo: number,
  ): T[] {
    return positionsWithMetas.slice(sliceIndexFrom, sliceIndexTo);
  }
}
