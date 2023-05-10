import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IKucoinKeys } from '../types/kucoin-keys.types';
import { PureKucoinService } from '@app/common/modules/pure-cex-kucoin/services/pure-kucoin.service';
import { CEXDepositAddressDTO } from '../../common/dto/payable/payable-cex-deposit.responses.dto';
import {
  IKucoinDepositAddressResult,
  KucoinDepositStatuses,
} from '@app/common/modules/pure-cex-kucoin/types/pure-kucoin-client.responses';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import { CEXFetchDepositStatusDTO } from '../../common/dto/payable/payable-cex-deposit.requests.dto';

@Injectable()
export class KucoinDepositService {
  constructor(private readonly pureKucoinService: PureKucoinService) {}

  async getDepositSetup(
    credentials: IKucoinKeys,
    symbol: string,
    chainIdDB: string,
  ): Promise<CEXDepositAddressDTO> {
    try {
      const foundDepositDestination = await this.fetchOrCreateNewDepositRoute(
        credentials,
        symbol,
      );

      return {
        symbol,
        chainIdDB,
        depositAddress: foundDepositDestination.address,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException('ghjgjhhj', HttpStatus.BAD_REQUEST);
    }
  }

  async fetchOrCreateNewDepositRoute(
    credentials: IKucoinKeys,
    symbol: string,
    options?: {
      ignoreError?: boolean;
    },
  ): Promise<IKucoinDepositAddressResult | null> {
    let foundDepositDestination: IKucoinDepositAddressResult;
    const foundExistingDepositDestination =
      await this.pureKucoinService.getDepositOptionsForForCurrency(
        credentials,
        {
          currency: symbol,
        },
      );
    if (foundExistingDepositDestination?.data?.length) {
      foundDepositDestination = foundExistingDepositDestination?.data?.[0];
    } else {
      const cratedNewDepositDestination =
        await this.pureKucoinService.createDepositAddressForCurrency(
          credentials,
          {
            currency: symbol,
          },
        );
      if (cratedNewDepositDestination) {
        foundDepositDestination = cratedNewDepositDestination?.data;
      }
    }
    if (!foundDepositDestination) {
      if (!options?.ignoreError) {
        throw new HttpException(
          'Coudn`t found deposit method for ',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        return null;
      }
    }

    return foundDepositDestination;
  }

  async getDepositStatus(
    credentials: IKucoinKeys,
    depositRequest: CEXFetchDepositStatusDTO,
  ): Promise<FinalStatusDTO> {
    const foundRecordsForDeposit = await this.pureKucoinService.getDepositList(
      credentials,
      {
        currency: depositRequest.depositId,
      },
    );
    if (!foundRecordsForDeposit?.data?.items?.length) {
      throw new HttpException(
        'Not Found Deposit records with requested symbol',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundDepoitWithTransactionHash =
      foundRecordsForDeposit.data.items.find(
        (depositRecord) =>
          depositRecord.walletTxId === depositRequest.transactionHash,
      );

    if (!foundDepoitWithTransactionHash) {
      throw new HttpException(
        'Not Found Deposit records with requested transactionHash',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      error:
        foundDepoitWithTransactionHash.status === KucoinDepositStatuses.FAILURE
          ? 'Something went wrong during Kucoin Deposit'
          : undefined,
      executed:
        foundDepoitWithTransactionHash.status === KucoinDepositStatuses.SUCCESS,
      info: foundDepoitWithTransactionHash,
    };
  }
}
