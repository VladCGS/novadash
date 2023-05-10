import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { Web3TransactionBodyDTO } from '@app/common/dtos/web3.dto';
import { Chain } from '@app/common/entities/transactions';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { Injectable } from '@nestjs/common';
import { QuoteResponse } from 'rango-sdk-basic/lib/types';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';
import { SwapAssetWithAmountDTO } from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class ExchRangoService {
  checkIfNativeCoinAndApplyAddress(tokenAddress: string) {
    return tokenAddress === NATIVE_UNI_ADDRESS ? null : tokenAddress;
  }

  formFeesFromQuote(quote: QuoteResponse): SwapAssetWithAmountDTO[] {
    const fees: SwapAssetWithAmountDTO[] = [];
    for (const feeBody of quote.route.fee) {
      fees.push({
        symbol: feeBody.token.symbol,
        amount: humanizeTokenQuantity(
          feeBody.amount,
          feeBody.token.decimals,
        ).toString(),
      });
    }

    return fees;
  }

  async addMissingFieldsToTransaction(
    body: DEXSwapSellGetQuoteDTO,
    tx: Web3TransactionBodyDTO,
  ) {
    const foundChain = await Chain.findOneBy({
      id: body.sell.chainId,
    });

    if (foundChain.group === ChainGroupEnum.EVM) {
      tx.chainId = Number(foundChain.chainId);
    }
  }
}
