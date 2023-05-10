import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { UniswapV3PoolsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-pools-provider.service';
import { UniswapV3PositionsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-positions-provider.service';
import { UniswapV3EvmDelegator } from '@app/common/modules/uniswap-v3-evm/services/uniswap-v3.delegator';
import { IUniswapV3PositionBase } from '@app/common/modules/uniswap-v3-evm/types/pure-uniswap-v3-response.types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UniswapV3IncreaseLiquidityModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-increasing-response.dto';
import { FormUniswapV3IncreasingModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-increasing-request.dto';
import { UniswapV3AddLiquidityModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-providing-response.dto';
import { UniswapLiquidityCommonService } from './uniswap-v3-liquidity-common.service';
import { Position } from '@uniswap/v3-sdk';
import { UniswapV3FormAddLiquidityTransactionService } from './uniswap-v3-form-add-liquidity-transaction.service';
import { UniswapFormPricedWalletService } from './uniswap-form-priced-wallet.service';
import { Wallet } from '@app/common/entities/transactions';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';

@Injectable()
export class UniswapV3LiquidityIncreasingService {
  constructor(
    private uniswapV3PoolsProviderService: UniswapV3PoolsProviderService,
    private uniswapLiquidityCommonService: UniswapLiquidityCommonService,
    private dataChainService: DataChainService,
    private uniswapV3EvmDelegator: UniswapV3EvmDelegator,
    private uniswapV3PositionsProviderService: UniswapV3PositionsProviderService,
    private uniswapV3FormAddLiquidityTransactionService: UniswapV3FormAddLiquidityTransactionService,
    private uniswapFormPricedWalletService: UniswapFormPricedWalletService,
  ) {}

  async getIncreaseLiquidityModalInitializationData(
    body: FormUniswapV3IncreasingModalInitializationDataDTO,
    userId: string,
  ): Promise<UniswapV3IncreaseLiquidityModalInitializationDataDTO> {
    const chain = await this.dataChainService.findOneByIdOrFail(body.chainIdDB);
    const positionInfo = await this.uniswapV3EvmDelegator
      .setChain(chain.slug)
      .getPositionModalDataById(body.positionId);

    if (!positionInfo) {
      throw new HttpException(
        `Position with id ${positionInfo.id} was not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const poolUniswapInfo =
      this.uniswapV3PoolsProviderService.adoptUniswapPoolToUniPool(
        positionInfo.pool,
      );

    const tickLower = Number(positionInfo.tickLower.tickIdx);
    const tickUpper = Number(positionInfo.tickUpper.tickIdx);

    const { poolInfo: totalPoolInfo, rangeReverse } =
      await this.uniswapLiquidityCommonService.formAndSaveIncreaseModalInitializationData(
        {
          poolUniswapInfo,
          userId,
          poolChainSlugAndId: {
            chainId: chain.chainId,
            chainSlug: chain.slug,
            id: chain.id,
          },
          tickLower,
          tickUpper,
        },
      );

    let { quoteTokenDisabled, baseTokenDisabled } =
      this.uniswapV3FormAddLiquidityTransactionService.checkQuoteAndBaseTokenDisabled(
        tickLower,
        tickUpper,
        Number(poolUniswapInfo.tick),
      );

    if (rangeReverse) {
      const bufferDisabled = quoteTokenDisabled;
      quoteTokenDisabled = baseTokenDisabled;
      baseTokenDisabled = bufferDisabled;
    }

    const { quoteTokenLiquidity, baseTokenLiquidity } =
      this.formPositionLiquidity(positionInfo, chain.chainId, totalPoolInfo);

    const foundWallet = await Wallet.findOne({
      where: {
        address: positionInfo.owner.toLowerCase(),
        chain: {
          id: chain.id,
        },
        user: {
          id: userId,
        },
      },
      relations: {
        chain: true,
      },
    });

    if (!foundWallet) {
      throw new HttpException(
        `Wallet for ${positionInfo.id} was not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const walletPriced =
      await this.uniswapFormPricedWalletService.formPricedHotWallet(
        foundWallet,
        {
          baseTokenAddress: totalPoolInfo.baseToken.address,
          quoteTokenAddress: totalPoolInfo.quoteToken.address,
        },
      );

    return {
      ...totalPoolInfo,
      quoteToken: {
        ...totalPoolInfo.quoteToken,
        liquidityQuantity: quoteTokenLiquidity,
        disabledDeposit: quoteTokenDisabled,
      },
      baseToken: {
        ...totalPoolInfo.baseToken,
        liquidityQuantity: baseTokenLiquidity,
        disabledDeposit: baseTokenDisabled,
      },
      walletPriced,
    };
  }

  private formPositionLiquidity(
    positionInfo: IUniswapV3PositionBase,
    chainId: string,
    totalPoolInfo: UniswapV3AddLiquidityModalInitializationDataDTO,
  ): { quoteTokenLiquidity: string; baseTokenLiquidity: string } {
    const { position } =
      this.uniswapV3PositionsProviderService.formPositionAndPoolByPositionInfo(
        positionInfo,
        chainId,
      );

    let baseTokenNumber: 0 | 1;
    let quoteTokenNumber: 0 | 1;

    if (
      totalPoolInfo.baseToken.symbol === positionInfo.pool.token0.symbol ||
      `W${totalPoolInfo.baseToken.symbol}` === positionInfo.pool.token0.symbol
    ) {
      baseTokenNumber = 0;
      quoteTokenNumber = 1;
    } else {
      baseTokenNumber = 1;
      quoteTokenNumber = 0;
    }

    const baseTokenLiquidity = this.getCurrentTokenAmount(
      baseTokenNumber,
      position,
      positionInfo.pool?.[`token${baseTokenNumber}`].decimals,
    );

    const quoteTokenLiquidity = this.getCurrentTokenAmount(
      quoteTokenNumber,
      position,
      positionInfo.pool?.[`token${quoteTokenNumber}`].decimals,
    );

    return { quoteTokenLiquidity, baseTokenLiquidity };
  }

  private getCurrentTokenAmount(
    tokenNumber: number,
    position: Position,
    decimals: string,
  ): string {
    const tokenDecimals = Number(decimals);

    return humanizeTokenQuantity(
      position.mintAmounts?.[`amount${tokenNumber}`],
      tokenDecimals,
    ).toString();
  }
}
