import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IKucoinKeys } from '../types/kucoin-keys.types';
import { PureKucoinService } from '@app/common/modules/pure-cex-kucoin/services/pure-kucoin.service';
import { KucoinDepositStatuses } from '@app/common/modules/pure-cex-kucoin/types/pure-kucoin-client.responses';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import {
  CEXFetchWithdrawStatusDTO,
  CEXWithdrawGetQuoteDTO,
} from '../../common/dto/payable/payable-cex-withdrawal.requests.dto';
import { CEXWithdrawResultDataDTO } from '../../common/dto/payable/payable-cex-withdrawal.responses.dto';

@Injectable()
export class KucoinWithdrawService {
  constructor(private readonly pureKucoinService: PureKucoinService) {}

  async callWithdraw(
    credentials: IKucoinKeys,
    withdrawalRequest: CEXWithdrawGetQuoteDTO,
  ): Promise<CEXWithdrawResultDataDTO> {
    const withdrawResult = await this.pureKucoinService.callWithdraw(
      credentials,
      {
        currency: withdrawalRequest.symbol,
        amount: parseFloat(withdrawalRequest.amount),
        address: withdrawalRequest.walletAddress,
        feeDeductType: 'INTERNAL',
      },
    );
    const foundRecords = await this.pureKucoinService.getWithdrawalsList(
      credentials,
      {
        currency: withdrawalRequest.symbol,
      },
    );
    const foundWithId = foundRecords.data.items.find(
      (depositRecord) => depositRecord.id === withdrawResult.data.withdrawalId,
    );

    return {
      withdrawOrderId: withdrawResult.data.withdrawalId,
      symbol: withdrawalRequest?.symbol,
      transactionHash: foundWithId?.walletTxId,
    };
  }

  async getWithdrawalStatus(
    credentials: IKucoinKeys,
    withdrawalRequest: CEXFetchWithdrawStatusDTO,
  ): Promise<FinalStatusDTO> {
    if (!withdrawalRequest.symbol) {
      throw new HttpException(
        '"symbol" is required for Kucoin Withdraw status',
        HttpStatus.NOT_FOUND,
      );
    }
    const foundRecords = await this.pureKucoinService.getWithdrawalsList(
      credentials,
      {
        currency: withdrawalRequest.symbol,
      },
    );
    if (!foundRecords?.data?.items?.length) {
      throw new HttpException(
        'Not Found Withdrawal records with requested symbol',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundWithId = foundRecords.data.items.find(
      (depositRecord) => depositRecord.id === withdrawalRequest.withdrawId,
    );

    if (!foundWithId) {
      throw new HttpException(
        'Not Found Withdraw records with requested "id" and "symbol"',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      error:
        foundWithId.status === KucoinDepositStatuses.FAILURE
          ? 'Something went wrong during Kucoin Deposit'
          : undefined,
      executed: foundWithId.status === KucoinDepositStatuses.SUCCESS,
      info: foundWithId,
    };
  }
}
