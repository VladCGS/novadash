import { Injectable } from '@nestjs/common';
import { EvmTransaction } from 'rango-sdk-basic/lib/types/api/txs';
import {
  CEXSwapTrackerSetupRangoDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { SwapCurrencyWithAmountAndWeiDTO } from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class RangoPaymentFormerService {
  checkOrAttachApproval(
    swapPaymentDataResult: SwapPaymentDataDTO<CEXSwapTrackerSetupRangoDTO>,
    rangoSwap: EvmTransaction,
    sellSetup: SwapCurrencyWithAmountAndWeiDTO,
    sellChainNetworkId: string,
  ) {
    if (rangoSwap.approveTo && rangoSwap.approveData) {
      swapPaymentDataResult.approveTokenInfo = {
        approveTokenMeta: {
          tokenAddress: sellSetup.tokenAddress,
          amountWei: sellSetup.amountWei,
          chainId: sellSetup.chainId,
        },
        bodyApprove: {
          from: sellSetup.walletAddress,
          to: rangoSwap.approveTo,
          data: rangoSwap.approveData,
          chainId: Number(sellChainNetworkId),
        },
      };
    }
  }
}
