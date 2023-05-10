import { FormCollectFeeOptions } from '../types/uniswap-v3-liquidity-common-service.type';
import { UniswapV3PositionsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-positions-provider.service';
import { UniswapV3EvmDelegator } from '@app/common/modules/uniswap-v3-evm/services/uniswap-v3.delegator';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Currency,
  CurrencyAmount,
  NativeCurrency,
  Token,
} from '@uniswap/sdk-core';
import { CollectOptions, NonfungiblePositionManager } from '@uniswap/v3-sdk';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '@app/common/constants/uniswap-v3-liquidity-providing.const';
import { UniswapV3FormAddLiquidityTransactionService } from './uniswap-v3-form-add-liquidity-transaction.service';
import { FormUniswapV3ClaimFeeTransactionDTO } from '../dtos/uniswap-v3-pools-liquidity-withdrawing-request.dto';
import { UniswapV3WithdrawTransactionDTO } from '../dtos/uniswap-v3-pools-liquidity-withdrawing-response.dto';
import { DataWalletService } from '@app/common/modules/data-wallet/services/data.wallet.service';

const JSBI = require('jsbi');

@Injectable()
export class UniswapV3FormClaimFeeTransactionService {
  constructor(
    private dataWalletService: DataWalletService,
    private uniswapV3EvmDelegator: UniswapV3EvmDelegator,
    private uniswapV3PositionsProviderService: UniswapV3PositionsProviderService,
    private uniswapV3FormAddLiquidityTransactionService: UniswapV3FormAddLiquidityTransactionService,
  ) {}

  async getClaimFeeTransactionData(
    body: FormUniswapV3ClaimFeeTransactionDTO,
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

    const collectFeeOptions = await this.formCollectFeeOptions({
      position,
      positionInfo,
      pool,
      depositWrapped: !!body?.useWrappedNativeToken,
      ownerAddress: body.ownerAddress,
    });

    const { calldata, value } =
      NonfungiblePositionManager.collectCallParameters(collectFeeOptions);

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

  async formCollectFeeOptions({
    position,
    positionInfo,
    depositWrapped,
    pool,
    ownerAddress,
    includeUncollectedFees = false,
  }: FormCollectFeeOptions): Promise<CollectOptions> {
    const uniswapContract =
      this.uniswapV3PositionsProviderService.getUniswapContract(pool.chainId);
    const { uncollectedTokenFee: uncolletedToken0Fee } =
      await this.uniswapV3PositionsProviderService.formPositionAnalyticsByIndex(
        {
          tokenNumber: 0,
          position,
          positionInfo,
          contract: uniswapContract,
        },
      );

    const { uncollectedTokenFee: uncolletedToken1Fee } =
      await this.uniswapV3PositionsProviderService.formPositionAnalyticsByIndex(
        {
          tokenNumber: 1,
          position,
          positionInfo,
          contract: uniswapContract,
        },
      );

    const poolNativeCurrency = !depositWrapped
      ? await this.uniswapV3FormAddLiquidityTransactionService.foundNativeCoin(
          pool,
        )
      : undefined;

    return {
      tokenId: positionInfo.id,
      expectedCurrencyOwed0: this.getExpectedCurrencyOwed(
        pool.token0,
        includeUncollectedFees,
        uncolletedToken0Fee,
        poolNativeCurrency,
      ),
      expectedCurrencyOwed1: this.getExpectedCurrencyOwed(
        pool.token1,
        includeUncollectedFees,
        uncolletedToken1Fee,
        poolNativeCurrency,
      ),
      recipient: ownerAddress,
    };
  }

  private getExpectedCurrencyOwed(
    token: Token,
    isCollectFee: boolean,
    uncollectedTokenFee: number,
    poolNativeCurrency?: NativeCurrency,
  ): CurrencyAmount<Currency> {
    return CurrencyAmount.fromRawAmount(
      poolNativeCurrency?.wrapped.address === token.address
        ? poolNativeCurrency
        : token,
      this.fromReadableAmount(
        !isCollectFee || uncollectedTokenFee < 0 ? 0 : uncollectedTokenFee,
        token.decimals,
      ),
    );
  }

  private fromReadableAmount(amount: number, decimals: number): typeof JSBI {
    const extraDigits = Math.pow(10, this.countDecimals(amount));
    const adjustedAmount = Math.floor(amount * extraDigits);

    return JSBI.divide(
      JSBI.multiply(
        JSBI.BigInt(adjustedAmount),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)),
      ),
      JSBI.BigInt(extraDigits),
    );
  }

  private countDecimals(x: number) {
    if (Math.floor(x) === x) {
      return 0;
    }
    return x.toString().split('.')[1].length || 0;
  }
}
