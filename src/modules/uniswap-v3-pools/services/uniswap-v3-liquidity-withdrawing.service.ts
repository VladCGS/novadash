import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { UniswapV3PositionsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-positions-provider.service';
import { UniswapV3EvmDelegator } from '@app/common/modules/uniswap-v3-evm/services/uniswap-v3.delegator';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WithdrawModalTokenAnalyticsDTO } from '../dtos/uniswap-v3-pools-liquidity-withdrawing-common.dto';
import { FormUniswapV3WithdrawingModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-withdrawing-request.dto';
import {
  UniswapV3WithdrawingModalInitializationDataDTO,
  UniswapV3WithdrawInitialModalWalletDTO,
} from '../dtos/uniswap-v3-pools-liquidity-withdrawing-response.dto';
import { FormWithdrawModalTokenAnalytics } from '../types/uniswap-v3-liquidity-common-service.type';
import { UniswapLiquidityCommonService } from './uniswap-v3-liquidity-common.service';
import { Wallet } from '@app/common/entities/transactions';

@Injectable()
export class UniswapV3LiquidityWithdrawingService {
  constructor(
    private dataChainService: DataChainService,
    private uniswapV3EvmDelegator: UniswapV3EvmDelegator,
    private uniswapV3PositionsProviderService: UniswapV3PositionsProviderService,
    private uniswapLiquidityCommonService: UniswapLiquidityCommonService,
  ) {}

  async getModalPaymentData(
    body: FormUniswapV3WithdrawingModalInitializationDataDTO,
    userId: string,
  ): Promise<UniswapV3WithdrawingModalInitializationDataDTO> {
    const chain = await this.dataChainService.findOneByIdOrFail(body.chainIdDB);
    const positionInfo = await this.uniswapV3EvmDelegator
      .setChain(chain.slug)
      .getPositionModalDataById(body.positionId);

    if (!positionInfo) {
      throw new HttpException(
        `Position with id ${positionInfo.id} was not founded`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { position } =
      this.uniswapV3PositionsProviderService.formPositionAndPoolByPositionInfo(
        positionInfo,
        chain.chainId,
      );

    const poolNativeWrappedToken =
      await this.uniswapLiquidityCommonService.checkIsPoolHasNativeToken(
        [positionInfo.pool.token0.id, positionInfo.pool.token1.id],
        chain.slug,
      );

    const uniswapContract =
      this.uniswapV3PositionsProviderService.getUniswapContract(
        Number(chain.chainId),
      );

    const token0Analytics = await this.formWithdrawModalTokenAnalytics({
      tokenNumber: 0,
      position,
      positionInfo,
      chain,
      poolNativeWrappedToken,
      contract: uniswapContract,
    });

    const token1Analytics = await this.formWithdrawModalTokenAnalytics({
      tokenNumber: 1,
      position,
      positionInfo,
      chain,
      poolNativeWrappedToken,
      contract: uniswapContract,
    });

    const formedOwnerMeta = await this.formWalletMeta(
      positionInfo.owner.toLowerCase(),
      userId,
      body.chainIdDB,
    );

    return {
      tokensAnalytics: [token0Analytics, token1Analytics],
      wrappedPositionSwitcherMeta:
        poolNativeWrappedToken?.wrappedPositionSwitcherMeta || null,
      ownerMeta: formedOwnerMeta,
    };
  }

  private async formWithdrawModalTokenAnalytics({
    tokenNumber,
    position,
    positionInfo,
    chain,
    poolNativeWrappedToken,
    contract,
  }: FormWithdrawModalTokenAnalytics): Promise<WithdrawModalTokenAnalyticsDTO> {
    const tokenAddress = positionInfo.pool?.[`token${tokenNumber}`].id;

    const tokenCurrentPrice =
      await this.uniswapV3PositionsProviderService.getTokenPriceByDate(
        tokenAddress,
        chain.id,
        chain.slug,
        new Date(),
      );

    const tokenAnalytics =
      await this.uniswapV3PositionsProviderService.formPositionAnalyticsByIndex(
        {
          tokenNumber,
          position,
          positionInfo,
          contract,
        },
      );

    return {
      tokenAddress,
      symbol: this.uniswapLiquidityCommonService.formTokenSymbol(
        positionInfo.pool?.[`token${tokenNumber}`].symbol,
        poolNativeWrappedToken?.wrappedPositionSwitcherMeta,
      ),
      usdPrice: Number(tokenCurrentPrice),
      ...tokenAnalytics,
    };
  }

  private async formWalletMeta(
    walletAddress: string,
    userId: string,
    chainId: string,
  ): Promise<UniswapV3WithdrawInitialModalWalletDTO> {
    const foundWallet = await Wallet.findOne({
      where: {
        address: walletAddress,
        chain: {
          id: chainId,
        },
        user: {
          id: userId,
        },
      },
      relations: {
        chain: true,
        meta: true,
      },
    });

    if (!foundWallet) {
      throw new HttpException(`Wallet was not found`, HttpStatus.BAD_REQUEST);
    }

    return {
      ...foundWallet,
      chain: foundWallet.chain,
      image: foundWallet.meta.image,
    };
  }
}
