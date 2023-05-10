import { DataWalletBalanceService } from '@app/common/modules/data-wallet/services/data.wallet-balance.service';
import { ChainSlugs } from '@app/common/types/chain.types';
import { Injectable } from '@nestjs/common';
import { DebridgeSwapFeeService } from './debridge-swap-fee.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class DebridgeFeeCheckService {
  constructor(
    private exchDebridgeFeeService: DebridgeSwapFeeService,
    private dataWalletBalanceService: DataWalletBalanceService,
  ) {}

  async checkIfEnoughNativeBalanceForFee(
    chainSlug: ChainSlugs,
    walletAddress: string,
  ): Promise<{ enough: boolean; required: string }> {
    const nativeNormalFee = await this.exchDebridgeFeeService.getNativeFixedFee(
      chainSlug,
    );

    const nativeNormalBalance =
      await this.dataWalletBalanceService.getNativeNormalBalance({
        chainSlug,
        walletAddress,
      });

    return {
      enough:
        BigNumber(nativeNormalBalance).isGreaterThanOrEqualTo(nativeNormalFee),
      required: nativeNormalFee,
    };
  }

  async checkEnoughNativeValueByDebridgeFee(
    nativeNormalAmount: string,
    chainSlug: ChainSlugs,
  ): Promise<{ enough: boolean; required: string }> {
    const nativeNormalFee = await this.exchDebridgeFeeService.getNativeFixedFee(
      chainSlug,
    );

    return {
      enough: BigNumber(nativeNormalAmount).isGreaterThan(nativeNormalFee),
      required: nativeNormalFee,
    };
  }
}
