import { Injectable } from '@nestjs/common';
import {
  IDeBridgeMultiChainEstimate,
  IDeBridgeSingleChainEstimate,
} from '../types/exch-debridge.types';
import { PureDeBridgeService } from '@app/common/modules/debridge/services/pure-debridge.service';
import { SupportedEvmSlugsNames } from '@app/common/constants/supported-evm-chains.const';
import { feeCollectorSetup } from '../../common/constants/fee-collecot-setup.const';

@Injectable()
export class DeBridgeEstimationService {
  constructor(private pureDeBridgeService: PureDeBridgeService) {}

  async getSingleChainEstimation({ sell, buy }: IDeBridgeSingleChainEstimate) {
    return this.pureDeBridgeService.getSingleChainEstimation({
      chainId: Number(sell.blockchainId),
      tokenIn: sell.tokenAddress,
      tokenInAmount: sell.amountWei,
      tokenOut: buy.tokenAddress,
    });
  }

  async getMultiChainEstimation(
    { sell, buy }: IDeBridgeMultiChainEstimate,
    buyChainSlug: SupportedEvmSlugsNames,
  ) {
    return this.pureDeBridgeService.getMultiChainEstimation({
      srcChainId: Number(sell.blockchainId),
      srcChainTokenIn: sell.tokenAddress,
      srcChainTokenInAmount: sell.amountWei,
      dstChainId: Number(buy.blockchainId),
      dstChainTokenOut: buy.tokenAddress,
      affiliateFeePercent: feeCollectorSetup[buyChainSlug].percent,
      affiliateFeeRecipient: feeCollectorSetup[buyChainSlug].walletAddress,
    });
  }
}
