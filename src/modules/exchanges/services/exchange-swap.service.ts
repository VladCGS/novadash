import { PlatformCoin } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { DataExchangeSwapSelectorService } from '@app/common/modules/data-exchange-swap/services/data.exchange-swap-selector.service';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { emptyPagedResult } from '@app/common/utils/empty-paged-result.util';
import { Injectable } from '@nestjs/common';
import {
  GetPagePairsForTokenQueryDTO,
  TokenSearchDTO,
} from '../dto/swap-selector-requests.dto';
import { PairsForSellTokenPageDTO } from '../dto/swap-selector-response.dto';
import { PairsForTokenService } from './pairs-for-token.service';

@Injectable()
export class ExchangeSwapService {
  constructor(
    private exchangeSwapSelectorService: DataExchangeSwapSelectorService,
    private dataChainService: DataChainService,
    private dataPlatformCoinService: DataPlatformCoinService,
    private pairsForTokenService: PairsForTokenService,
  ) {}

  async getPairsForToken(
    userId: string,
    { tokenAddress, chainId, search, page, size }: GetPagePairsForTokenQueryDTO,
  ): Promise<PairsForSellTokenPageDTO> {
    const platCoin =
      await this.dataPlatformCoinService.findOneByAddressAndChainIdOrFail(
        tokenAddress,
        chainId,
      );

    const supportedServices =
      await this.exchangeSwapSelectorService.getServicesIdsByTokenAddress({
        tokenAddress: platCoin.tokenAddress,
        chainId: platCoin.chain.id,
      });

    if (!supportedServices.length) {
      return emptyPagedResult({ page, size });
    }

    const servicesIds = supportedServices.map((item) => item.id);

    const userChains = await this.dataChainService.findManyByUserIdOrFail(
      userId,
    );

    // TODO
    //  add binance chain here
    const allowedChainIds = userChains.map((chain: Chain) => chain.id);

    return this.pairsForTokenService.getSupportedTokensByExchangesPage(
      {
        chainIds: allowedChainIds,
        exchangeIds: servicesIds,
        page,
        size,
        search,
      },
      { tokenAddress, chainId },
    );
  }

  async getTokenIdsByTokensData(
    tokens: TokenSearchDTO[],
  ): Promise<string[] | null> {
    const formedSearchedData = tokens.map((data) => ({
      tokenAddress: data.tokenAddress,
      chain: {
        id: data.chainId,
      },
    }));
    const foundTokens = await PlatformCoin.find({
      where: [...formedSearchedData],
    });

    if (foundTokens && foundTokens.length) {
      return foundTokens.map((pc) => pc.id);
    }

    return null;
  }

  checkAreTokensSingleChain(tokens: TokenSearchDTO[]): boolean {
    for (let i = 1, len = tokens.length; i < len; i++) {
      if (tokens[i - 1].chainId !== tokens[i].chainId) {
        return false;
      }
    }
    return true;
  }
}
