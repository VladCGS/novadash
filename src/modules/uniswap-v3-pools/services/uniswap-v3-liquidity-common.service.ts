import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { RedisService } from '@app/common/modules/redis/services/redis.service';
import { IPoolInfoForReddis } from '@app/common/modules/redis/types/pool.type';
import {
  adaptPoolForRedisStorage,
  adaptPoolTokenForRedisStorage,
  formPool,
  formPoolToken,
  formRedisKey,
} from '@app/common/modules/uniswap-pools/helpers/uniswap-v3.helpers';
import { UniswapV3PoolsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-pools-provider.service';
import { calculateEstimatedFee } from '@app/common/modules/uniswap-pools/utils/calculate-estimated-fee.util';
import { ChainSlugs } from '@app/common/types/chain.types';
import { HttpException, Injectable } from '@nestjs/common';
import { Token } from '@uniswap/sdk-core';
import { nearestUsableTick, tickToPrice } from '@uniswap/v3-sdk';
import { HttpStatusCode } from '../../common/types/http-base.types';
import {
  IFormAndSaveIncreaseModalInitializationData,
  IIncreaseModalInitializationData,
  IPoolNativeWrappedToken,
} from '../types/uniswap-v3-liquidity-common-service.type';
import { UniswapWrappedPositionSwitcherMetaDTO } from '../dtos/uniswap-v3-pools-liquidity-providing-common.dto';

@Injectable()
export class UniswapLiquidityCommonService {
  constructor(
    private uniswapV3PoolsProviderService: UniswapV3PoolsProviderService,
    private redisService: RedisService,
  ) {}

  async formAndSaveIncreaseModalInitializationData({
    poolUniswapInfo,
    poolChainSlugAndId,
    userId,
    tickLower,
    tickUpper,
  }: IFormAndSaveIncreaseModalInitializationData): Promise<IIncreaseModalInitializationData> {
    let isPosition = true;
    const token0 = formPoolToken(
      adaptPoolTokenForRedisStorage(
        poolUniswapInfo.tokens[0],
        poolChainSlugAndId.chainId,
      ),
    );
    const token1 = formPoolToken(
      adaptPoolTokenForRedisStorage(
        poolUniswapInfo.tokens[1],
        poolChainSlugAndId.chainId,
      ),
    );
    const pool = formPool(
      token0,
      token1,
      adaptPoolForRedisStorage(poolUniswapInfo),
    );

    const [quoteToken, baseToken] = this.getQuoteAndBaseToken(token0, token1);

    const rangeReverse = baseToken.sortsBefore(quoteToken);

    if (!tickLower && !tickUpper) {
      [tickLower, tickUpper] = this.calculateDefaultPoolTicks(
        pool.tickCurrent,
        pool.tickSpacing,
      );

      isPosition = false;
    }

    let upperRange = this.getPriceFromTick(quoteToken, baseToken, tickUpper);
    let lowerRange = this.getPriceFromTick(quoteToken, baseToken, tickLower);
    const currentPrice = this.getPriceFromTick(
      quoteToken,
      baseToken,
      pool.tickCurrent,
    );

    if (rangeReverse) {
      const bufferRange = upperRange;
      upperRange = lowerRange;
      lowerRange = bufferRange;
    }

    // the same range as on uniswap
    const maxRange = (currentPrice / 100) * 270; // 270%
    const minRange = currentPrice / 1000; // 0.1%

    const [poolTicks, tokensCurrentPrices, avgTradingVolume] =
      await Promise.all([
        this.uniswapV3PoolsProviderService.getPoolTicks(
          poolUniswapInfo.id,
          poolChainSlugAndId.chainSlug,
        ),
        this.uniswapV3PoolsProviderService.findMinAndMaxWithTokensPrices(
          baseToken.address,
          quoteToken.address,
          Number(poolUniswapInfo.tokens[0].currentPriceUsd),
          poolChainSlugAndId.chainSlug,
        ),
        this.uniswapV3PoolsProviderService.getAvgTradingVolumeOrFail(
          poolUniswapInfo.id,
          poolChainSlugAndId.chainSlug,
        ),
      ]);

    if (!poolTicks || !tokensCurrentPrices || !avgTradingVolume) {
      throw new HttpException(
        'Uniswap services is not acceptable. Please try again later',
        HttpStatusCode.NOT_ACCEPTABLE,
      );
    }

    const {
      token0CurrentPrice: baseTokenCurrentPrice,
      token1CurrentPrice: quoteTokenCurrentPrice,
    } = tokensCurrentPrices;

    const defaultDepositAmount = 1000;

    const estimatedFee = calculateEstimatedFee({
      token0: {
        currentPriceUSD: baseTokenCurrentPrice,
        decimals: baseToken.decimals,
      },
      token1: {
        currentPriceUSD: quoteTokenCurrentPrice,
        decimals: quoteToken.decimals,
      },
      priceAssumptionValue: currentPrice,
      lowerRange,
      upperRange,
      depositAmountUSD: defaultDepositAmount,
      poolTicks,
      avgTradingVolume,
      poolFeeTier: poolUniswapInfo.feeTier,
      isPairToggled: !rangeReverse,
    });

    const apr = (100 * estimatedFee * 365) / defaultDepositAmount;

    await this.redisService.set<IPoolInfoForReddis>(
      formRedisKey(userId, poolUniswapInfo.id, poolChainSlugAndId.id),
      {
        poolTicks,
        avgTradingVolume,
        chainSlug: poolChainSlugAndId.chainSlug,
        token0CurrentPrice: baseTokenCurrentPrice,
        token1CurrentPrice: quoteTokenCurrentPrice,
        rangeReverse,
        poolInfo: adaptPoolForRedisStorage(poolUniswapInfo),
        tickLower,
        tickUpper,
        tokens: [
          {
            ...baseToken,
            symbol: baseToken.symbol,
            name: baseToken.name,
          },
          {
            ...quoteToken,
            symbol: quoteToken.symbol,
            name: quoteToken.name,
          },
        ],
        isPosition,
      },
    );

    const poolNativeWrappedToken = await this.checkIsPoolHasNativeToken(
      [pool.token0.address, pool.token1.address],
      poolChainSlugAndId.chainSlug,
    );

    return {
      rangeReverse,
      poolInfo: {
        minRange,
        maxRange,
        apr,
        priceAssumptionValue: currentPrice,
        lowerRange,
        upperRange,
        quoteToken: {
          address: quoteToken.address,
          usdPrice: String(quoteTokenCurrentPrice),
          symbol: this.formTokenSymbol(
            quoteToken.symbol,
            poolNativeWrappedToken?.wrappedPositionSwitcherMeta,
          ),
        },
        baseToken: {
          address: baseToken.address,
          usdPrice: String(baseTokenCurrentPrice),
          symbol: this.formTokenSymbol(
            baseToken.symbol,
            poolNativeWrappedToken?.wrappedPositionSwitcherMeta,
          ),
        },
        poolAddress: poolUniswapInfo.id,
        chainIdDB: poolChainSlugAndId.id,
        wrappedPositionSwitcherMeta:
          poolNativeWrappedToken?.wrappedPositionSwitcherMeta,
      },
    };
  }

  getPriceFromTick(quoteToken: Token, baseToken: Token, tick: number): number {
    return parseFloat(
      tickToPrice(quoteToken, baseToken, tick).toSignificant(16),
    );
  }

  formTokenSymbol(
    poolTokenSymbol: string,
    wrappedPositionSwitcherMeta?: UniswapWrappedPositionSwitcherMetaDTO,
  ): string {
    const nativeSymbol = wrappedPositionSwitcherMeta?.native.symbol;
    if (nativeSymbol && poolTokenSymbol === nativeSymbol) {
      return nativeSymbol;
    }

    return poolTokenSymbol;
  }

  async checkIsPoolHasNativeToken(
    poolTokensAddresses: string[],
    chainSlug: string,
  ): Promise<IPoolNativeWrappedToken | undefined> {
    const chainNativeToken = await PlatformCoin.findOne({
      where: {
        tokenAddress: NATIVE_UNI_ADDRESS,
        chain: { slug: chainSlug as ChainSlugs },
      },
      relations: { coinMetadata: true },
      select: { id: true, coinMetadata: { symbol: true } },
    });

    if (!chainNativeToken) {
      return;
    }

    for (const poolTokenAddress of poolTokensAddresses) {
      const platformCoin = await PlatformCoin.findOne({
        where: {
          tokenAddress: poolTokenAddress.toLowerCase(),
          chain: { slug: chainSlug as ChainSlugs },
        },
        relations: { coinMetadata: true, chain: true },
        select: {
          id: true,
          coinMetadata: { image: true, symbol: true, name: true },
          chain: { id: true, image: true },
        },
      });

      if (!platformCoin) {
        continue;
      }

      if (
        platformCoin.coinMetadata.symbol !==
        `W${chainNativeToken.coinMetadata.symbol}`
      ) {
        return;
      }
      return {
        wrappedPositionSwitcherMeta: {
          native: {
            platformCoinId: chainNativeToken.id,
            address: NATIVE_UNI_ADDRESS,
            image: chainNativeToken.coinMetadata.image,
            symbol: chainNativeToken.coinMetadata.symbol,
            name: chainNativeToken.coinMetadata.name,
            chainImage: platformCoin.chain.image,
          },
          wrapped: {
            platformCoinId: platformCoin.id,
            address: platformCoin.tokenAddress,
            image: platformCoin.coinMetadata.image,
            symbol: platformCoin.coinMetadata.symbol,
            name: platformCoin.coinMetadata.name,
            chainImage: platformCoin.chain.image,
          },
        },
      };
    }
  }

  private getQuoteAndBaseToken(token0: Token, token1: Token): Token[] {
    let quote = token0;
    let base = token1;

    if (!token0 || !token1) {
      return [quote, base];
    }

    const baseCurrencies = [
      'USDC',
      'USDT',
      'DAI',
      'FEI',
      'PAX',
      'WETH',
      'WMATIC',
      'WBTC',
      'CRV',
    ];

    for (const currency of baseCurrencies) {
      if (token0.symbol === currency) {
        base = token0;
        quote = token1;

        break;
      } else if (token1.symbol === currency) {
        base = token1;
        quote = token0;

        break;
      }
    }
    return [quote, base];
  }

  private calculateDefaultPoolTicks(tickCurrent: number, tickSpacing: number) {
    let tickLower: number;
    let tickUpper: number;

    tickLower = Math.round(tickCurrent - 30 * tickSpacing);
    tickUpper = Math.round(tickCurrent + 30 * tickSpacing);

    tickLower = nearestUsableTick(tickLower, tickSpacing);
    tickUpper = nearestUsableTick(tickUpper, tickSpacing);

    return [tickLower, tickUpper];
  }
}
