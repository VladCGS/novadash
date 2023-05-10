import { Injectable } from '@nestjs/common';
import {
  IDeBridgeMultiChainPaymentData,
  IDeBridgeSingleChainPaymentData,
} from '../types/exch-debridge.types';
import { PureDeBridgeService } from '@app/common/modules/debridge/services/pure-debridge.service';
import { SupportedEvmSlugsNames } from '@app/common/constants/supported-evm-chains.const';
import { feeCollectorSetup } from '../../common/constants/fee-collecot-setup.const';

@Injectable()
export class DebridgePaymentDataService {
  constructor(private pureDeBridgeService: PureDeBridgeService) {}

  async getSingleChainPaymentData({
    sell,
    buy,
  }: IDeBridgeSingleChainPaymentData) {
    return this.pureDeBridgeService.getSingleChainTransaction({
      chainId: Number(sell.blockchainId),
      tokenIn: sell.tokenAddress,
      tokenInAmount: sell.amountWei,
      tokenOut: buy.tokenAddress,
      tokenOutRecipient: buy.receiverAddress,
    });
  }

  async getMultiChainPaymentData(
    { sell, buy }: IDeBridgeMultiChainPaymentData,
    buyChainSlug: SupportedEvmSlugsNames,
  ) {
    return this.pureDeBridgeService.getMultiChainTransaction({
      srcChainId: Number(sell.blockchainId),
      srcChainTokenIn: sell.tokenAddress,
      srcChainTokenInAmount: sell.amountWei,
      dstChainId: Number(buy.blockchainId),
      dstChainTokenOut: buy.tokenAddress,
      slippage: 1,
      dstChainTokenOutRecipient: buy.receiverAddress,
      senderAddress: buy.receiverAddress,
      affiliateFeePercent: feeCollectorSetup[buyChainSlug].percent,
      affiliateFeeRecipient: feeCollectorSetup[buyChainSlug].walletAddress,
    });
  }
}
