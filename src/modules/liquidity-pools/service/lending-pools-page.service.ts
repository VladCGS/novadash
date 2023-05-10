import { PlatformCoin } from '@app/common/entities/alphaping';
import { SupportedPoolInfoDTO } from '@app/common/modules/data-supported-pools/dto/data-supported-pools-common.dto';
import { DataSupportedPoolsSrvice } from '@app/common/modules/data-supported-pools/services/data-supported-pools.service';
import { UniswapV3PoolsProviderService } from '@app/common/modules/uniswap-pools/service/uniswap-v3-pools-provider.service';
import { Injectable } from '@nestjs/common';
import { emptyPagedResult } from '@app/common/utils/empty-paged-result.util';
import { PoolWithMetasAndAprDTO } from '../dto/liquidity-pools-common.dto';
import { FormLendingPoolsWithAPRDTO } from '../dto/liquidity-pools-request.dto';
import { LendingPoolsWithAPRPageDTO } from '../dto/liquidity-pools.response.dto';
import { IPool } from '@app/common/types/liquidity-pools.type';
import { calculateDefaultProfits } from '@app/common/utils/calcaulate-profits.util';
import {
  ProviderMetaDTO,
  TokenMetaDTO,
} from '@app/common/dtos/default-dao-common.dto';

@Injectable()
export class LendingPoolsPageService {
  constructor(
    private dataSupportedPoolsService: DataSupportedPoolsSrvice,
    private uniswapV3PoolsProviderService: UniswapV3PoolsProviderService,
  ) {}

  async getLendingPoolsPageWithApr(
    body: FormLendingPoolsWithAPRDTO,
  ): Promise<LendingPoolsWithAPRPageDTO> {
    const poolsForCalculationWithTotal =
      await this.dataSupportedPoolsService.getPageForCalculationWithTotal(body);

    if (poolsForCalculationWithTotal.result.length === 0) {
      return emptyPagedResult({ page: body.page, size: body.size });
    }

    const poolsWithAprAndMetas = await this.attachAprAndMetasToPools(
      poolsForCalculationWithTotal.result,
    );

    const pages = Math.ceil(poolsForCalculationWithTotal.total / body.size);

    return {
      page: body.page,
      total: poolsForCalculationWithTotal.total,
      pages,
      size: body.size,
      result: poolsWithAprAndMetas,
    };
  }

  private async attachAprAndMetasToPools(
    poolsDB: SupportedPoolInfoDTO[],
  ): Promise<PoolWithMetasAndAprDTO[]> {
    return Promise.all(
      poolsDB.map(async (poolDB): Promise<PoolWithMetasAndAprDTO> => {
        const pool: IPool =
          this.uniswapV3PoolsProviderService.adoptUniswapPoolToUniPool(
            await this.uniswapV3PoolsProviderService.getUniswapPoolInfoOrFail(
              poolDB.address,
              poolDB.slug,
            ),
          );

        const profits = calculateDefaultProfits(Number(poolDB.apr));

        const tokensMeta: TokenMetaDTO[] =
          await this.formTokensMetaByPoolAddress(poolDB.address);

        const providerMeta: ProviderMetaDTO =
          await this.uniswapV3PoolsProviderService.getProviderMeta();

        return {
          poolMeta: {
            provider: poolDB.provider,
            poolAddress: poolDB.address,
            feePercentage: Number(pool.feeTier) / 10000,
            chainIdDB: poolDB.chainId,
          },
          tokensMeta:
            pool.tokens[0].symbol !== tokensMeta[0].symbol
              ? tokensMeta.reverse()
              : tokensMeta,
          profits,
          providerMeta,
        };
      }),
    );
  }

  async formTokensMetaByPoolAddress(
    poolAddress: string,
  ): Promise<TokenMetaDTO[]> {
    const platCoins = await PlatformCoin.find({
      where: { supportedPools: { address: poolAddress } },
      relations: {
        chain: true,
        coinMetadata: true,
      },
    });

    return platCoins.map((platCoin): TokenMetaDTO => {
      return {
        platformCoinId: platCoin.id,
        address: platCoin.tokenAddress,
        symbol: platCoin.coinMetadata.symbol,
        name: platCoin.coinMetadata.name,
        image: platCoin.coinMetadata.image,
        chainImage: platCoin.chain.image,
      };
    });
  }
}
