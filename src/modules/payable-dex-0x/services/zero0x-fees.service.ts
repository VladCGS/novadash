import { Chain } from '@app/common/entities/transactions';
import { ChainSlugs } from '@app/common/types/chain.types';
import { Injectable } from '@nestjs/common';
import { I0xPrice, I0xQuote } from '../types/pure-0x.types';
import BigNumber from 'bignumber.js';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';
import { SwapAssetWithAmountDTO } from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class Zero0xFeesService {
  async formFeesThroughTx(
    chainSlug: ChainSlugs,
    quote: I0xQuote | I0xPrice,
  ): Promise<SwapAssetWithAmountDTO[]> {
    const foundChain = await Chain.findOne({
      where: { slug: chainSlug },
      relations: {
        nativeCurrency: true,
      },
    });
    const feeQuantityRaw = BigNumber(quote.estimatedGas).times(quote.gasPrice);
    const feeQuantity = humanizeTokenQuantity(
      feeQuantityRaw,
      foundChain.nativeCurrency.decimals,
    ).toString();

    const symbolNative = foundChain.nativeCurrency.symbol;
    return [
      {
        symbol: symbolNative,
        amount: feeQuantity,
      },
    ];
  }
}
