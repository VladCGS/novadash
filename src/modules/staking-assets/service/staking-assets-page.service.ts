import { TokenMetaDTO } from '@app/common/dtos/default-dao-common.dto';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { ToolMeta } from '@app/common/entities/transactions';
import { DataSupportedStakingTokensService } from '@app/common/modules/data-supported-staking-tokens/service/data-supported-staking-tokens.service';
import { SupportedStakingAssetsInfoBase } from '@app/common/modules/data-supported-staking-tokens/types/data-supported-staking-tokens-common.dto';
import { FetchWalletBalancesService } from '@app/common/modules/priced-wallet/services/fetch-wallet-balances.service';
import { calculateDefaultProfits } from '@app/common/utils/calcaulate-profits.util';
import { Injectable } from '@nestjs/common';
import { StakingAssetsWithMetaAndAPRDTO } from '../dto/staking-assets-common.dto';
import { FormStakingAssetsPageWithAPRDTO } from '../dto/staking-assets-request.dto';
import { StakingAssetsPageWithAPRDTO } from '../dto/staking-assets-response.dto';

@Injectable()
export class StakingAssetsPageService {
  constructor(
    private fetchWalletBalancesService: FetchWalletBalancesService,
    private dataSupportedStakingTokensService: DataSupportedStakingTokensService,
  ) {}

  async getPage(
    body: FormStakingAssetsPageWithAPRDTO,
    userId: string,
  ): Promise<StakingAssetsPageWithAPRDTO> {
    const platformCoinIdsWithBalances =
      await this.fetchWalletBalancesService.getPlatformCoinIdsWithBalances(
        userId,
      );
    const stakingAssetsPageAndTotal =
      await this.dataSupportedStakingTokensService.getStakingPageForCalculationWithTotal(
        body,
        platformCoinIdsWithBalances,
      );
    const result = await this.attachMetaToAssets(
      stakingAssetsPageAndTotal.result,
    );
    const pages = Math.ceil(stakingAssetsPageAndTotal.total / body.size);

    return {
      size: body.size,
      total: stakingAssetsPageAndTotal.total,
      pages,
      page: body.page,
      result,
    };
  }

  private async attachMetaToAssets(
    result: SupportedStakingAssetsInfoBase[],
  ): Promise<StakingAssetsWithMetaAndAPRDTO[]> {
    return await Promise.all(
      result.map(async (asset): Promise<StakingAssetsWithMetaAndAPRDTO> => {
        const provider = await ToolMeta.findOne({
          where: { id: asset.toolMetaId },
        });

        const coreTokenMeta = await this.formTokensMetaByTokenId(
          asset.coreTokenId,
        );
        return {
          profits: calculateDefaultProfits(Number(asset.stakingAPR)),
          providerMeta: {
            name: provider.name,
            type: 'Staking',
            image: provider.image,
          },
          stakingMeta: {
            provider: asset.provider,
            stakingAssetAddress: asset.stakingAddress,
            chainIdDB: asset.chainId,
          },
          coreTokenMeta,
          canUserStake: asset.canUserStake,
        };
      }),
    );
  }

  private async formTokensMetaByTokenId(
    tokenId: string,
  ): Promise<TokenMetaDTO> {
    const corePlatformCoin = await PlatformCoin.findOne({
      where: { id: tokenId },
      relations: { coinMetadata: true, chain: true },
      select: {
        id: true,
        coinMetadata: { symbol: true, name: true, image: true },
        chain: { id: true, image: true },
        tokenAddress: true,
      },
    });

    return {
      platformCoinId: corePlatformCoin.id,
      symbol: corePlatformCoin.coinMetadata.symbol,
      name: corePlatformCoin.coinMetadata.name,
      image: corePlatformCoin.coinMetadata.image,
      chainImage: corePlatformCoin.chain.image,
      address: corePlatformCoin.tokenAddress,
    };
  }
}
