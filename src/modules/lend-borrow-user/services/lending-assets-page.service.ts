import { SupportedLendingAssetsInfo } from '@app/common/modules/data-supported-lends-borrows/type/data-supported-lends-common.type';
import { DataSupportedLendingAssetsService } from '@app/common/modules/data-supported-lends-borrows/services/data-supported-lending-assets.service';
import { LendingBorrowingPageWithMetaBaseDTO } from '@app/common/modules/lending-borrowing-assets-common/dto/lending-borrowing-assets-common-response.dto';
import { LendingBorrowingAssetsPageCommonService } from '@app/common/modules/lending-borrowing-assets-common/service/lending-borrowing-assets-common.service';
import { FetchWalletBalancesService } from '@app/common/modules/priced-wallet/services/fetch-wallet-balances.service';
import { Injectable } from '@nestjs/common';
import { LendingAssetsWithMetaAndAPYDTO } from '../dto/lending-assets-common.dto';
import { FormLendingAssetsPageWithAPYDTO } from '../dto/lending-assets-request.dto';
import { LendingAssetsWithAPYPageDTO } from '../dto/lending-assets-response.dto';
import { calculateDefaultProfits } from '@app/common/utils/calcaulate-profits.util';

@Injectable()
export class LendingAssetsPageService {
  constructor(
    private dataSupportedLendingAssetsService: DataSupportedLendingAssetsService,
    private lendingBorrowingAssetsPageCommonService: LendingBorrowingAssetsPageCommonService,
    private fetchWalletBalancesService: FetchWalletBalancesService,
  ) {}

  async getPage(
    body: FormLendingAssetsPageWithAPYDTO,
    userId: string,
  ): Promise<LendingAssetsWithAPYPageDTO> {
    const platformCoinIdsWithBalances =
      await this.fetchWalletBalancesService.getPlatformCoinIdsWithBalances(
        userId,
      );

    const lendingAssetsPageAndTotal =
      await this.dataSupportedLendingAssetsService.getLendingPageForCalculationWithTotal(
        body,
        platformCoinIdsWithBalances,
      );

    const lendingAssetsMeta =
      await this.lendingBorrowingAssetsPageCommonService.formMeta(
        lendingAssetsPageAndTotal.result,
      );

    const result = this.attachAprAndMetasToLendingAssets(
      lendingAssetsPageAndTotal.result,
      lendingAssetsMeta,
    );

    const pages = Math.ceil(lendingAssetsPageAndTotal.total / body.size);

    return {
      size: body.size,
      total: lendingAssetsPageAndTotal.total,
      pages,
      page: body.page,
      result,
    };
  }

  private attachAprAndMetasToLendingAssets(
    lendingAssetsPageAndTotal: SupportedLendingAssetsInfo[],
    lendingAssetsMeta: LendingBorrowingPageWithMetaBaseDTO[],
  ): LendingAssetsWithMetaAndAPYDTO[] {
    const lendingAssetsWithMetaAndAPY: LendingAssetsWithMetaAndAPYDTO[] = [];

    for (let i = 0; i < lendingAssetsMeta.length; i++) {
      const lendAPY = calculateDefaultProfits(
        Number(lendingAssetsPageAndTotal[i].lendAPY),
      );

      lendingAssetsWithMetaAndAPY.push({
        profits: lendAPY,
        canUserLend: lendingAssetsPageAndTotal[i].canUserLend,
        ...lendingAssetsMeta[i],
      });
    }

    return lendingAssetsWithMetaAndAPY;
  }
}
