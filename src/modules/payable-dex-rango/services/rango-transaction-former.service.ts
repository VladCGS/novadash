import { Web3TransactionBodyDTO } from '@app/common/dtos/web3.dto';
import { Injectable } from '@nestjs/common';
import { EvmTransaction } from 'rango-sdk-basic/lib/types/api/txs';

@Injectable()
export class RangoTransactionFormerService {
  formTxBody(rangoSwapBody: EvmTransaction): Web3TransactionBodyDTO {
    return {
      from: rangoSwapBody.from,
      to: rangoSwapBody.txTo,
      data: rangoSwapBody.txData,
      gasPrice: rangoSwapBody.gasPrice,
      value: rangoSwapBody.value ?? undefined,
      gas: rangoSwapBody.gasLimit ?? undefined,
    };
  }
}
