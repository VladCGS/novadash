import { NULLABLE_ADDRESS } from '@app/common/constants/transactions.const';
import { Web3TransactionBodyDTO } from '@app/common/dtos/web3.dto';
import { Injectable } from '@nestjs/common';
import { SwapPaymentDataDTO } from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { I0xQuote } from '../types/pure-0x.types';
import { SwapCurrencyWithAmountAndWeiDTO } from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class Zero0xPaymentService {
  formTransactionBody(
    paymentQuote0x: I0xQuote,
    sellWalletAddress,
  ): Web3TransactionBodyDTO {
    return {
      from: sellWalletAddress,
      to: paymentQuote0x.to,
      data: paymentQuote0x.data,
      value: paymentQuote0x.value,
    };
  }

  checkAllowanceTargetOrAttachApprove(
    paymentResult: SwapPaymentDataDTO,
    allowanceTarget: string,
    sellSetup: SwapCurrencyWithAmountAndWeiDTO,
  ) {
    // Native token in 0x is 0x000...000
    if (allowanceTarget !== NULLABLE_ADDRESS) {
      paymentResult.approveTokenInfo = {
        approveTokenMeta: {
          tokenAddress: sellSetup.tokenAddress,
          amountWei: sellSetup.amountWei,
          chainId: sellSetup.chainId,
        },
        bodyApprove: {
          to: allowanceTarget,
        },
      };
    }
  }
}
