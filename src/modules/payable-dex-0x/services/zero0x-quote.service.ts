import { Injectable } from '@nestjs/common';
import { CEXSwapQuoteWithWeiDTO } from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { I0xPrice, I0xQuote } from '../types/pure-0x.types';
import { Zero0xFeesService } from './zero0x-fees.service';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';

@Injectable()
export class Zero0xQuoteService {
  constructor(private zero0xFeesService: Zero0xFeesService) {}
  async formQuoteBy0x(
    quote: I0xQuote | I0xPrice,
    body,
    sellChainSlug,
    buyTokenDecimals,
  ): Promise<CEXSwapQuoteWithWeiDTO> {
    const feesThroughTx = await this.zero0xFeesService.formFeesThroughTx(
      sellChainSlug,
      quote,
    );

    const normalizedGetAmount = humanizeTokenQuantity(
      quote.buyAmount,
      buyTokenDecimals,
    ).toString();

    return {
      sell: {
        ...body.sell,
        amountWei: quote.sellAmount,
      },
      buy: {
        ...body.buy,
        amount: normalizedGetAmount,
        amountWei: quote.buyAmount,
      },
      feesIncluded: feesThroughTx,
      feesToPay: [],
    };
  }
}
