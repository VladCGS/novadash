import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CurrencyAmount, MaxUint256, Price, Token } from '@uniswap/sdk-core';
import {
  nearestUsableTick,
  Pool,
  Position,
  priceToClosestTick,
} from '@uniswap/v3-sdk';
import {
  CalculateUniswapV3DepositDTO,
  CalculateUniswapV3PoolAprDTO,
  CalculateUniswapV3TicksDTO,
} from 'apps/alphaping/src/modules/uniswap-v3-pools/dtos/socket-pools-dynamic-calculation-request.dto';
import {
  NewUniswapV3PoolAprDTO,
  NewUniswapV3PoolDepositAmountDTO,
  UniswapV3PoolCorrectRangesDTO,
} from 'apps/alphaping/src/modules/uniswap-v3-pools/dtos/socket-pools-dynamic-calculation-response.dto';
import { RedisService } from '@app/common/modules/redis/services/redis.service';
import { IPoolInfoForReddis } from '@app/common/modules/redis/types/pool.type';
import {
  formPool,
  formPoolToken,
  formRedisKey,
} from '@app/common/modules/uniswap-pools/helpers/uniswap-v3.helpers';
import { calculateEstimatedFee } from '@app/common/modules/uniswap-pools/utils/calculate-estimated-fee.util';
import { UniswapV3FormAddLiquidityTransactionService } from './uniswap-v3-form-add-liquidity-transaction.service';
import { UniswapLiquidityCommonService } from './uniswap-v3-liquidity-common.service';
import BigNumber from 'bignumber.js';

const JSBI = require('jsbi');

@Injectable()
export class UniswapV3DynamicCalculateService {
  constructor(
    private redisService: RedisService,
    private uniswapLiquidityCommonService: UniswapLiquidityCommonService,
    @Inject(forwardRef(() => UniswapV3FormAddLiquidityTransactionService))
    private uniswapV3FormAddLiquidityTransactionService: UniswapV3FormAddLiquidityTransactionService,
  ) {}

  async calculateApr(
    body: CalculateUniswapV3PoolAprDTO,
  ): Promise<NewUniswapV3PoolAprDTO> {
    const cachedPoolData = await this.redisService.get<IPoolInfoForReddis>(
      formRedisKey(body.userId, body.address, body.chainIdDB),
    );

    const defaultDepositAmount = 1000;
    const estimatedFee = calculateEstimatedFee({
      token0: {
        currentPriceUSD: cachedPoolData.token0CurrentPrice,
        decimals: cachedPoolData.tokens[0].decimals,
      },
      token1: {
        currentPriceUSD: cachedPoolData.token1CurrentPrice,
        decimals: cachedPoolData.tokens[1].decimals,
      },
      priceAssumptionValue: body.priceAssumptionValue,
      lowerRange: body.lowerRange,
      upperRange: body.upperRange,
      depositAmountUSD: defaultDepositAmount,
      poolTicks: cachedPoolData.poolTicks,
      avgTradingVolume: cachedPoolData.avgTradingVolume,
      poolFeeTier: cachedPoolData.poolInfo.feeTier,
      isPairToggled: !cachedPoolData.rangeReverse,
    });

    const apr = (100 * estimatedFee * 365) / defaultDepositAmount;

    return { apr, priceAssumptionValue: body.priceAssumptionValue };
  }

  async calculateTicks(
    body: CalculateUniswapV3TicksDTO,
  ): Promise<UniswapV3PoolCorrectRangesDTO> {
    const cachedPoolData = await this.redisService.get<IPoolInfoForReddis>(
      formRedisKey(body.userId, body.address, body.chainIdDB),
    );

    const baseToken = formPoolToken(cachedPoolData.tokens[0]);
    const quoteToken = formPoolToken(cachedPoolData.tokens[1]);

    const pool = formPool(baseToken, quoteToken, cachedPoolData.poolInfo);

    if (cachedPoolData.rangeReverse) {
      const bufferRange = body.upperRange;
      body.upperRange = body.lowerRange;
      body.lowerRange = bufferRange;
    }

    let tickLower = this.getTickFromRange(
      baseToken,
      quoteToken,
      pool,
      body.lowerRange,
    );

    let tickUpper = this.getTickFromRange(
      baseToken,
      quoteToken,
      pool,
      body.upperRange,
    );

    if (tickLower > tickUpper) {
      if (cachedPoolData.rangeReverse) {
        tickUpper = tickLower + pool.tickSpacing;
      } else {
        tickLower = tickUpper - pool.tickSpacing;
      }
    }

    await this.redisService.set<IPoolInfoForReddis>(
      formRedisKey(body.userId, body.address, body.chainIdDB),
      { ...cachedPoolData, tickLower, tickUpper },
    );

    let correctLowerRange = this.uniswapLiquidityCommonService.getPriceFromTick(
      quoteToken,
      baseToken,
      tickLower,
    );

    let correctUpperRange = this.uniswapLiquidityCommonService.getPriceFromTick(
      quoteToken,
      baseToken,
      tickUpper,
    );

    if (cachedPoolData.rangeReverse) {
      const bufferRange = correctUpperRange;
      correctUpperRange = correctLowerRange;
      correctLowerRange = bufferRange;
    }

    return { lowerRange: correctLowerRange, upperRange: correctUpperRange };
  }

  async calculateDepositAmount({
    userId,
    address,
    chainIdDB,
    baseTokenAmount = '0',
    quoteTokenAmount = '0',
  }: CalculateUniswapV3DepositDTO): Promise<NewUniswapV3PoolDepositAmountDTO> {
    const initialResult = {
      quoteTokenAmount: '0',
      baseTokenAmount: '0',
      quoteTokenDisabled: false,
      baseTokenDisabled: false,
    };

    const cachedPoolData = await this.redisService.get<IPoolInfoForReddis>(
      formRedisKey(userId, address, chainIdDB),
    );

    const baseToken = formPoolToken(cachedPoolData.tokens[0]);
    const quoteToken = formPoolToken(cachedPoolData.tokens[1]);

    const pool = formPool(baseToken, quoteToken, cachedPoolData.poolInfo);

    let { quoteTokenDisabled, baseTokenDisabled } =
      this.uniswapV3FormAddLiquidityTransactionService.checkQuoteAndBaseTokenDisabled(
        cachedPoolData.tickLower,
        cachedPoolData.tickUpper,
        pool.tickCurrent,
      );

    if (cachedPoolData.rangeReverse) {
      const bufferDisabled = quoteTokenDisabled;
      quoteTokenDisabled = baseTokenDisabled;
      baseTokenDisabled = bufferDisabled;
    }

    initialResult.quoteTokenDisabled = quoteTokenDisabled;
    initialResult.baseTokenDisabled = baseTokenDisabled;

    if (
      (quoteTokenDisabled && baseTokenDisabled) ||
      (!baseTokenAmount && !quoteTokenAmount)
    ) {
      return initialResult;
    }

    const position = this.positionFromAmounts(
      pool,
      cachedPoolData.tickLower,
      cachedPoolData.tickUpper,
      quoteTokenAmount,
      baseTokenAmount,
      cachedPoolData.rangeReverse,
    );

    let newQuoteAmount = position.amount0.toSignificant(16);
    let newBaseAmount = position.amount1.toSignificant(16);

    if (cachedPoolData.rangeReverse) {
      [newQuoteAmount, newBaseAmount] = [newBaseAmount, newQuoteAmount];
    }

    initialResult.baseTokenAmount = newBaseAmount;
    initialResult.quoteTokenAmount = newQuoteAmount;

    return initialResult;
  }

  positionFromAmounts(
    pool: Pool,
    tickLower: number,
    tickUpper: number,
    quoteAmount: string,
    baseAmount: string,
    reverse: boolean,
  ): Position {
    if (reverse) {
      [quoteAmount, baseAmount] = [baseAmount, quoteAmount];
    }

    const amount0 =
      quoteAmount === '0'
        ? MaxUint256
        : JSBI.BigInt(
            BigNumber(quoteAmount)
              .times(10 ** pool.token0.decimals)
              .toFixed(),
          );

    const amount1 =
      baseAmount === '0'
        ? MaxUint256
        : JSBI.BigInt(
            BigNumber(baseAmount)
              .times(10 ** pool.token1.decimals)
              .toFixed(),
          );

    return Position.fromAmounts({
      pool,
      tickLower,
      tickUpper,
      amount0,
      amount1,
      useFullPrecision: false,
    });
  }

  private getTickFromRange(
    baseToken: Token,
    quoteToken: Token,
    pool: Pool,
    newRange: number,
  ) {
    const price = new Price({
      quoteAmount: CurrencyAmount.fromRawAmount(
        baseToken,
        Math.ceil(newRange * Math.pow(10, baseToken.decimals)),
      ),
      baseAmount: CurrencyAmount.fromRawAmount(
        quoteToken,
        Math.ceil(Math.pow(10, quoteToken.decimals)),
      ),
    });

    const tickFromPrice = priceToClosestTick(price);
    return nearestUsableTick(tickFromPrice, pool.tickSpacing);
  }
}
