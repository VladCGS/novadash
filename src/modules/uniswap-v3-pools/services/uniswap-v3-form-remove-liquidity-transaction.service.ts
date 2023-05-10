import {
  DEFAULT_SLIPPAGE,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from '@app/common/constants/uniswap-v3-liquidity-providing.const';
import { UniswapV3PositionsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-positions-provider.service';
import { UniswapV3EvmDelegator } from '@app/common/modules/uniswap-v3-evm/services/uniswap-v3.delegator';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Percent } from '@uniswap/sdk-core';
import {
  NonfungiblePositionManager,
  RemoveLiquidityOptions,
} from '@uniswap/v3-sdk';
import { FormUniswapV3RemoveLiquidityTransactionDTO } from '../dtos/uniswap-v3-pools-liquidity-withdrawing-request.dto';
import { UniswapV3WithdrawTransactionDTO } from '../dtos/uniswap-v3-pools-liquidity-withdrawing-response.dto';
import { UniswapV3FormClaimFeeTransactionService } from './uniswap-v3-form-claim-fee-transaction.service';
import { DataWalletService } from '@app/common/modules/data-wallet/services/data.wallet.service';

@Injectable()
export class UniswapV3FormRemoveLiquidityTransactionService {
  constructor(
    private dataWalletService: DataWalletService,
    private uniswapV3EvmDelegator: UniswapV3EvmDelegator,
    private uniswapV3PositionsProviderService: UniswapV3PositionsProviderService,
    private uniswapV3FormClaimFeeTransactionService: UniswapV3FormClaimFeeTransactionService,
  ) {}

  async formRemoveLiquidityTransaction(
    body: FormUniswapV3RemoveLiquidityTransactionDTO,
  ): Promise<UniswapV3WithdrawTransactionDTO> {
    const foundWallet = await this.dataWalletService.findOneByIdOrFail(
      body.ownerAddress,
      body.chainIdDB,
    );

    const positionInfo = await this.uniswapV3EvmDelegator
      .setChain(foundWallet.chain.slug)
      .getPositionModalDataById(body.positionId);

    if (!positionInfo) {
      throw new HttpException(
        `Position with id ${positionInfo.id} was not founded`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { pool, position } =
      this.uniswapV3PositionsProviderService.formPositionAndPoolByPositionInfo(
        positionInfo,
        foundWallet.chain.chainId,
      );

    const collectFeeOptions =
      await this.uniswapV3FormClaimFeeTransactionService.formCollectFeeOptions({
        pool,
        position,
        positionInfo,
        ownerAddress: body.ownerAddress,
        depositWrapped: !!body?.useWrappedNativeToken,
        includeUncollectedFees:
          body.removePercentage >= 100 ? true : body.includeUncollectedFees,
      });

    const removeLiquidityOptions: RemoveLiquidityOptions = {
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      tokenId: positionInfo.id,
      slippageTolerance: DEFAULT_SLIPPAGE,
      liquidityPercentage: new Percent(Math.round(body.removePercentage), 100),
      collectOptions: collectFeeOptions,
    };

    const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
      position,
      removeLiquidityOptions,
    );

    return {
      senderMeta: {
        address: body.ownerAddress,
        chainId: body.chainIdDB,
        providerName: foundWallet.provider,
      },
      bodyTransaction: {
        data: calldata,
        value,
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
        from: body.ownerAddress,
      },
    };
  }
}
