import { Injectable } from '@nestjs/common';
import { CEXSwapQuoteWithWeiDTO } from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { IFormReservationBodyOptions } from '../types/exch-debridge.types';
import { SingleChainEstimation } from '../types/pure-debridge-responses.types';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';

@Injectable()
export class DebridgeQuoteFormer {
  async formQuoteWithWeiBody(
    options: IFormReservationBodyOptions,
  ): Promise<CEXSwapQuoteWithWeiDTO> {
    const { sell, buy, estimation } = options;

    const reservationBody: CEXSwapQuoteWithWeiDTO = {
      sell: {
        ...sell,
        amount: '0',
        amountWei: '0',
      },
      buy: {
        ...buy,
        amount: '0',
        amountWei: '0',
      },
      feesIncluded: [],
      feesToPay: [],
    };

    if ('tokenIn' in estimation || 'tokenIn' in estimation.estimation) {
      let outCome;
      if ('tokenIn' in estimation) {
        outCome = estimation;
      } else {
        outCome = estimation.estimation;
      }
      const { tokenIn, tokenOut } = outCome as SingleChainEstimation;
      reservationBody.buy.amountWei = tokenOut.amount;
      reservationBody.buy.amount = humanizeTokenQuantity(
        tokenOut.amount,
        tokenOut.decimals,
      ).toString();
      reservationBody.sell.amountWei = tokenIn.amount;
      reservationBody.sell.amount = humanizeTokenQuantity(
        tokenIn.amount,
        tokenIn.decimals,
      ).toString();
    } else {
      const { dstChainTokenOut, srcChainTokenIn, executionFee } =
        estimation.estimation;

      reservationBody.buy.amountWei = dstChainTokenOut.amount;
      reservationBody.buy.amount = humanizeTokenQuantity(
        dstChainTokenOut.amount,
        dstChainTokenOut.decimals,
      ).toString();
      reservationBody.sell.amountWei = srcChainTokenIn.amount;
      reservationBody.sell.amount = humanizeTokenQuantity(
        srcChainTokenIn.amount,
        srcChainTokenIn.decimals,
      ).toString();

      const actualDeUSdcFee = humanizeTokenQuantity(
        executionFee.recommendedAmount,
        executionFee.token.decimals,
      ).toString();

      reservationBody.feesIncluded.push({
        amount: actualDeUSdcFee,
        symbol: executionFee.token.symbol,
      });
    }

    return reservationBody;
  }
}
