import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import {
  BaseCurrency,
  DEFAULT_SLIPPAGE,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  ZERO_PERCENT,
} from '@app/common/constants/uniswap-v3-liquidity-providing.const';
import {
  ApproveTokenInfoDTO,
  Web3TransactionBodyDTO,
} from '@app/common/dtos/web3.dto';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { RedisService } from '@app/common/modules/redis/services/redis.service';
import { IPoolInfoForReddis } from '@app/common/modules/redis/types/pool.type';
import {
  formPool,
  formPoolToken,
  formRedisKey,
} from '@app/common/modules/uniswap-pools/helpers/uniswap-v3.helpers';
import { UniswapV3EvmDelegator } from '@app/common/modules/uniswap-v3-evm/services/uniswap-v3.delegator';
import { Injectable } from '@nestjs/common';
import { NativeCurrency, Token } from '@uniswap/sdk-core';
import {
  AddLiquidityOptions,
  MintOptions,
  NonfungiblePositionManager,
  Pool,
} from '@uniswap/v3-sdk';
import { FormUniswapV3AddLiquidityTransactionDTO } from 'apps/alphaping/src/modules/uniswap-v3-pools/dtos/uniswap-v3-pools-liquidity-providing-request.dto';
import { UniswapV3DynamicCalculateService } from './uniswap-v3-dynamic-calculate.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class UniswapV3FormAddLiquidityTransactionService {
  constructor(
    private redisService: RedisService,
    private uniswapV3EvmDelegator: UniswapV3EvmDelegator,
    private uniswapV3DynamicCalculateService: UniswapV3DynamicCalculateService,
  ) {}

  async formTransactionBody(
    body: FormUniswapV3AddLiquidityTransactionDTO,
    userId: string,
  ): Promise<Web3TransactionBodyDTO | undefined> {
    const cachedPoolData = await this.redisService.get<IPoolInfoForReddis>(
      formRedisKey(userId, body.poolAddress, body.chainIdDB),
    );

    const baseToken = formPoolToken(cachedPoolData.tokens[0]);
    const quoteToken = formPoolToken(cachedPoolData.tokens[1]);

    const pool = formPool(baseToken, quoteToken, cachedPoolData.poolInfo);

    const matchingPositionId = await this.uniswapV3EvmDelegator
      .setChain(cachedPoolData.chainSlug)
      .getUserMatchingPositionId({
        ownerAddress: body.walletAddress,
        poolAddress: body.poolAddress,
        tickLower: cachedPoolData.tickLower,
        tickUpper: cachedPoolData.tickUpper,
      });

    const newPosition =
      this.uniswapV3DynamicCalculateService.positionFromAmounts(
        pool,
        cachedPoolData.tickLower,
        cachedPoolData.tickUpper,
        body.tokenAmountQuote,
        body.tokenAmountBase,
        cachedPoolData.rangeReverse,
      );

    const deadline = +new Date() + 10 * 60 * 1000;
    const { quoteTokenDisabled, baseTokenDisabled } =
      this.checkQuoteAndBaseTokenDisabled(
        cachedPoolData.tickLower,
        cachedPoolData.tickUpper,
        pool.tickCurrent,
      );

    if (quoteTokenDisabled && baseTokenDisabled) {
      return;
    }

    const slippageTolerance =
      quoteTokenDisabled || baseTokenDisabled ? ZERO_PERCENT : DEFAULT_SLIPPAGE;

    const nativeToken = !body.useWrappedNativeToken
      ? await this.foundNativeCoin(pool)
      : undefined;

    const defaultAddCallParametersOptions = {
      deadline,
      slippageTolerance,
      useNative: nativeToken,
    };

    let addCallParametersOption: AddLiquidityOptions | MintOptions;

    if (matchingPositionId) {
      addCallParametersOption = {
        ...defaultAddCallParametersOptions,
        tokenId: matchingPositionId,
      };
    } else {
      addCallParametersOption = {
        ...defaultAddCallParametersOptions,
        recipient: body.walletAddress,
      };
    }

    const { calldata, value } = NonfungiblePositionManager.addCallParameters(
      newPosition,
      addCallParametersOption,
    );

    return {
      to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
      from: body.walletAddress,
      data: calldata,
      value,
    };
  }

  async formApproveTokensInfo(
    body: FormUniswapV3AddLiquidityTransactionDTO,
    userId: string,
  ): Promise<ApproveTokenInfoDTO[]> {
    const cachedPoolData = await this.redisService.get<IPoolInfoForReddis>(
      formRedisKey(userId, body.poolAddress, body.chainIdDB),
    );

    const approves: ApproveTokenInfoDTO[] = [];

    const baseToken = formPoolToken(cachedPoolData.tokens[0]);
    const quoteToken = formPoolToken(cachedPoolData.tokens[1]);
    const nativeCurrencyInDB = await this.getChainNativeCurrencyInDB(
      String(baseToken.chainId),
    );

    const baseTokenApproveInfo = await this.formTokenApproveInfoForPool(
      baseToken,
      body.tokenAmountBase,
      body.useWrappedNativeToken,
      nativeCurrencyInDB,
    );
    if (baseTokenApproveInfo) {
      approves.push(baseTokenApproveInfo);
    }

    const quoteTokenApproveInfo = await this.formTokenApproveInfoForPool(
      quoteToken,
      body.tokenAmountQuote,
      body.useWrappedNativeToken,
      nativeCurrencyInDB,
    );
    if (quoteTokenApproveInfo) {
      approves.push(quoteTokenApproveInfo);
    }

    return approves;
  }

  checkQuoteAndBaseTokenDisabled(
    tickLower: number,
    tickUpper: number,
    tickCurrent: number,
  ) {
    let baseTokenDisabled = false;
    let quoteTokenDisabled = false;

    if (tickLower >= tickUpper) {
      quoteTokenDisabled = true;
      baseTokenDisabled = true;
    } else if (tickUpper < tickCurrent) {
      quoteTokenDisabled = true;
    } else if (tickLower > tickCurrent) {
      baseTokenDisabled = true;
    }

    return { quoteTokenDisabled, baseTokenDisabled };
  }

  async foundNativeCoin(pool: Pool): Promise<NativeCurrency | undefined> {
    const nativeCurrencyInDB = await this.getChainNativeCurrencyInDB(
      String(pool.chainId),
    );

    if (!nativeCurrencyInDB) {
      return;
    }

    const poolTokens = [pool.token0, pool.token1];

    for (const token of poolTokens) {
      if (await this.checkIsNativeCurrency(token, nativeCurrencyInDB)) {
        return this.formNativeCurrencyFromToken(token);
      }
    }

    return;
  }

  private async formTokenApproveInfoForPool(
    token: Token,
    depositAmount: string,
    depositWrapped = false,
    nativeCurrencyInDB: PlatformCoin,
  ): Promise<ApproveTokenInfoDTO> {
    if (
      !depositWrapped &&
      (await this.checkIsNativeCurrency(token, nativeCurrencyInDB))
    ) {
      return;
    }

    return {
      bodyApprove: { to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES },
      approveTokenMeta: {
        tokenAddress: token.address,
        chainId: String(token.chainId),
        amountWei: BigNumber(depositAmount)
          .times(10 ** token.decimals)
          .toString(),
      },
    };
  }

  private formNativeCurrencyFromToken(token: Token): NativeCurrency {
    return new BaseCurrency(
      token.chainId,
      token.decimals,
      token.address,
      token.symbol,
      token.name,
    );
  }

  private async checkIsNativeCurrency(
    token: Token,
    nativeCoinInDB: PlatformCoin,
  ): Promise<boolean> {
    if (token.isNative) {
      return true;
    }

    const isNativeWrappedCoin = await PlatformCoin.findOne({
      where: {
        coinMetadata: { symbol: `W${nativeCoinInDB.coinMetadata.symbol}` },
        chain: { chainId: String(token.chainId) },
        tokenAddress: token.address.toLowerCase(),
      },
      select: { id: true },
    });

    return !!isNativeWrappedCoin;
  }

  private async getChainNativeCurrencyInDB(
    chainId: string,
  ): Promise<PlatformCoin | undefined> {
    const nativePlatformCoin = await PlatformCoin.findOne({
      where: { chain: { chainId }, tokenAddress: NATIVE_UNI_ADDRESS },
      relations: { coinMetadata: true },
      select: { id: true, coinMetadata: { symbol: true } },
    });

    if (!nativePlatformCoin) {
      return;
    }

    return nativePlatformCoin;
  }
}
