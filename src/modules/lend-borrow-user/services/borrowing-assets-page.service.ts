import { DataLendBorrowReservesChainsService } from '@app/common/modules/data-supported-lends-borrows/services/data-chain-with-reserves.service';
import { DataSupportedBorrowingAssetsService } from '@app/common/modules/data-supported-lends-borrows/services/data-supported-borrowing-assets.service';
import { LendingBorrowingPageWithMetaBaseDTO } from '@app/common/modules/lending-borrowing-assets-common/dto/lending-borrowing-assets-common-response.dto';
import { LendingBorrowingAssetsPageCommonService } from '@app/common/modules/lending-borrowing-assets-common/service/lending-borrowing-assets-common.service';
import { Injectable } from '@nestjs/common';
import { BorrowAssetsWithMetaAndAPYDTO } from '../dto/borrowing-assets-common.dto';
import { FormBorrowingAssetsWithAPYDTO } from '../dto/borrowing-assets-request.dto';
import { BorrowAssetsWithAPYPageDTO } from '../dto/borrowing-assets-response.dto';
import { SupportedBorrowingAssetsInfoDTO } from '@app/common/modules/data-supported-lends-borrows/type/data-supported-borrows-common.type';
import { LendingBorrowingAssetsUserReservesService } from '@app/common/modules/lending-borrowing-assets-common/service/lending-borrowing-assets-user-reserves.service';

@Injectable()
export class BorrowingAssetsPageService {
  constructor(
    private dataSupportedBorrowingAssetsService: DataSupportedBorrowingAssetsService,
    private dataLendBorrowReservesChainsService: DataLendBorrowReservesChainsService,
    private lendingBorrowingAssetsPageCommonService: LendingBorrowingAssetsPageCommonService,
    private lendingBorrowingAssetsUserReservesService: LendingBorrowingAssetsUserReservesService,
  ) {}

  async getPage(
    body: FormBorrowingAssetsWithAPYDTO,
    userId: string,
  ): Promise<BorrowAssetsWithAPYPageDTO> {
    const existingSupportedLendBorrowChainSlugs =
      await this.dataLendBorrowReservesChainsService.findChainSlugs();

    const userChainSlugsAvailableToBorrow =
      await this.lendingBorrowingAssetsUserReservesService.findUserChainSlugsWithReserves(
        userId,
        existingSupportedLendBorrowChainSlugs,
      );

    const borrowAssetsPageAndTotal =
      await this.dataSupportedBorrowingAssetsService.getBorrowingPageForCalculationWithTotal(
        body,
        userChainSlugsAvailableToBorrow,
      );

    const borrowAssetsPageWithMeta =
      await this.lendingBorrowingAssetsPageCommonService.formMeta(
        borrowAssetsPageAndTotal.result,
      );

    const result = this.attachAprAndMetasToBorrowingAssets(
      borrowAssetsPageAndTotal.result,
      borrowAssetsPageWithMeta,
    );

    const pages = Math.ceil(borrowAssetsPageAndTotal.total / body.size);

    return {
      size: body.size,
      pages,
      page: body.page,
      total: borrowAssetsPageAndTotal.total,
      result,
    };
  }

  private attachAprAndMetasToBorrowingAssets(
    borrowAssetsPageAndTotal: SupportedBorrowingAssetsInfoDTO[],
    borrowAssetsMeta: LendingBorrowingPageWithMetaBaseDTO[],
  ): BorrowAssetsWithMetaAndAPYDTO[] {
    const borrowAssetsWithMetaAndAPY: BorrowAssetsWithMetaAndAPYDTO[] = [];

    for (let i = 0; i < borrowAssetsMeta.length; i++) {
      const borrowStableAPY = Number(
        borrowAssetsPageAndTotal[i].borrowStableAPY,
      );

      const borrowVariableAPY = Number(
        borrowAssetsPageAndTotal[i].borrowVariableAPY,
      );

      borrowAssetsWithMetaAndAPY.push({
        borrowStableAPY,
        borrowVariableAPY,
        canUserBorrow: borrowAssetsPageAndTotal[i].canUserBorrow,
        ...borrowAssetsMeta[i],
      });
    }

    return borrowAssetsWithMetaAndAPY;
  }
}
