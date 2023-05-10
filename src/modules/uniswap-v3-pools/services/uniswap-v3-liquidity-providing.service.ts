import { DataSupportedPoolsSrvice } from '@app/common/modules/data-supported-pools/services/data-supported-pools.service';
import { UniswapV3PoolsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-pools-provider.service';
import { Injectable } from '@nestjs/common';
import { IPool } from '@app/common/types/liquidity-pools.type';
import { FormUniswapV3AddLiquidityModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-providing-request.dto';
import { UniswapV3AddLiquidityModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-providing-response.dto';
import { UniswapLiquidityCommonService } from './uniswap-v3-liquidity-common.service';

@Injectable()
export class UniswapV3LiquidityProvidingService {
  constructor(
    private dataSupportedPoolsService: DataSupportedPoolsSrvice,
    private uniswapV3PoolsProviderService: UniswapV3PoolsProviderService,
    private uniswapLiquidityCommonService: UniswapLiquidityCommonService,
  ) {}

  async getAddLiquidityModalInitializationData(
    {
      poolAddress,
      chainIdDB,
    }: FormUniswapV3AddLiquidityModalInitializationDataDTO,
    userId: string,
  ): Promise<UniswapV3AddLiquidityModalInitializationDataDTO> {
    const poolChainSlugAndId =
      await this.dataSupportedPoolsService.getPoolChainSlugAndId(
        poolAddress,
        chainIdDB,
      );

    const poolUniswapInfo: IPool =
      this.uniswapV3PoolsProviderService.adoptUniswapPoolToUniPool(
        await this.uniswapV3PoolsProviderService.getUniswapPoolInfoOrFail(
          poolAddress,
          poolChainSlugAndId.chainSlug,
        ),
      );

    return (
      await this.uniswapLiquidityCommonService.formAndSaveIncreaseModalInitializationData(
        { poolUniswapInfo, userId, poolChainSlugAndId },
      )
    ).poolInfo;
  }
}
