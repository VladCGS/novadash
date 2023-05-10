import { NATIVE_DB_ADDRESS_TO_DEBRIDGE } from '@app/common/constants/debridge.const';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { Injectable } from '@nestjs/common';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';
import {
  SwapCurrencyDTO,
  SwapCurrencyWithAmountDTO,
} from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class DebridgeTokenAddressTranslator {
  constructor(private dataChainService: DataChainService) {}

  async checkIfNativeCoinAndApplyDebridgeAddress(
    params: DEXSwapSellGetQuoteDTO,
  ) {
    await this.checkSwapIfNativeCoinAndApplyDebridgeAddress(params.sell);
    await this.checkSwapIfNativeCoinAndApplyDebridgeAddress(params.buy);
  }

  checkNativeDeBridgeAndApplyNativeDBAddress(
    params: DEXSwapSellGetQuoteDTO,
  ): void {
    const nativeAddresses = Object.values(NATIVE_DB_ADDRESS_TO_DEBRIDGE);
    if (nativeAddresses.includes(params.buy.tokenAddress)) {
      params.buy.tokenAddress = NATIVE_UNI_ADDRESS;
    }

    if (nativeAddresses.includes(params.sell.tokenAddress)) {
      params.sell.tokenAddress = NATIVE_UNI_ADDRESS;
    }
  }

  private async checkSwapIfNativeCoinAndApplyDebridgeAddress(
    params: SwapCurrencyWithAmountDTO | SwapCurrencyDTO,
  ) {
    if (params.tokenAddress === NATIVE_UNI_ADDRESS) {
      const foundChain = await this.dataChainService.findOneByIdOrFail(
        params.chainId,
      );
      params.tokenAddress = NATIVE_DB_ADDRESS_TO_DEBRIDGE[foundChain.slug];
    }
  }
}
