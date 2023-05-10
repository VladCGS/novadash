import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { DataTransactionService } from '@app/common/modules/data-transaction/services/data.transaction.service';
import { ITransactionAssetsDetails } from '@app/common/modules/data-transaction/types/data.transaction.types';
import { AssetOperationEnum } from '@app/common/modules/transactions/types/transaction.enum';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GetTransactionPageQueryDTO } from '../dto/transaction-requests.dto';
import { TransactionAssetsSetPageDTO } from '../dto/transaction-responses.dto';

@Injectable()
export class TransactionAssetSetService {
  constructor(
    private dataTransactionService: DataTransactionService,
    private dataPlatformCoinService: DataPlatformCoinService,
  ) {}
  async findPageAssetsByOperationAndWallets(
    walletsIds: string[],
    operation: AssetOperationEnum,
    options: GetTransactionPageQueryDTO,
  ): Promise<TransactionAssetsSetPageDTO> {
    const foundAssetsAddressesAndChains =
      await this.dataTransactionService.findAssetsAddressAndChain(
        walletsIds,
        operation,
      );
    if (!foundAssetsAddressesAndChains.length) {
      throw new HttpException(
        'Transaction Assets were not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const sortedByChain = this.formMapWithChainKeys(
      foundAssetsAddressesAndChains,
    );

    return this.dataPlatformCoinService.findPageByAddressesAndChains(
      sortedByChain,
      options,
    );
  }

  private formMapWithChainKeys(
    assetsAddressesAndChains: ITransactionAssetsDetails[],
  ): Record<string, string[]> {
    const sortedByChain: Record<string, string[]> = {};
    for (const record of assetsAddressesAndChains) {
      if (!(record.chainId in sortedByChain)) {
        sortedByChain[record.chainId] = [];
      }
      sortedByChain[record.chainId].push(record.tokenAddress);
    }

    return sortedByChain;
  }
}
