import { ExchangeSwap } from '@app/common/entities/pairs';
import {
  IGetSupportedTokensByServices,
  IRequestedToken,
} from '@app/common/modules/data-exchange-swap/types/swap.types';
import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { formAlphapingExceptionBody } from '@app/common/utils/form-alphaping-exception-body.util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  PairsForSellTokenPageDTO,
  TokenExchangeDTO,
} from '../dto/swap-selector-response.dto';

@Injectable()
export class PairsForTokenService {
  async getSupportedTokensByExchangesPage(
    {
      chainIds,
      exchangeIds,
      page,
      size,
      search,
    }: IGetSupportedTokensByServices,
    { tokenAddress, chainId }: IRequestedToken,
  ): Promise<PairsForSellTokenPageDTO> {
    const andSelectExchangeQuery = await this.formExchangesQuery(
      exchangeIds,
      chainId,
    );

    if (!andSelectExchangeQuery) {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.notFoundPairsForToken),
        HttpStatus.NOT_FOUND,
      );
    }

    const selectAllFieldsQuery = `
    SELECT DISTINCT ON (pc."tokenAddress") pc."tokenAddress",
                      pc.id,
                      pcm.symbol,
                      pcm.name, 
                      pcm.image,
                      ch.id "chDbId", 
                      ch."chainId", 
                      ch.name "chainName", 
                      ch.image "chainImage", 
                      ch.slug "chainSlug"`;

    const groupByAllFieldsQuery = `
    GROUP BY  pc."tokenAddress",
              pc.id,
              pcm.symbol,
              pcm.name, 
              pcm.image,
              "chDbId", 
              ch."chainId", 
              "chainName", 
              "chainImage", 
              "chainSlug"`;

    const stringifiedChainIds = chainIds.length
      ? `'${chainIds.join("','")}'`
      : '';
    const andFilterResultByWhatUserCanReceive = `AND ch.id in (${stringifiedChainIds})`;

    const limit = size;
    const skip = (page - 1) * limit;

    const andSearchQuery = search
      ? `AND (pcm.name ILIKE '${search}%'
        OR pcm.symbol ILIKE '${search}%'
        OR pc."tokenAddress" ILIKE '${search}%')`
      : '';

    const andExcludeRequestedTokenQuery = `AND NOT (pc."tokenAddress" = '${tokenAddress}' AND ch.id = '${chainId}')`;

    const selectAddressQuery = `SELECT DISTINCT ON (pc."tokenAddress") pc."tokenAddress"`;

    const groupByAddressQuery = `
    GROUP BY  pc."tokenAddress"`;

    const logicSearchQuery = `
    FROM exchange_supported_coin esc
      JOIN platform_coin pc on esc."platformCoinId" = pc.id
      JOIN chain ch on pc."chainId" = ch.id
      JOIN exchange_swap es on esc."exchangeSwapId" = es.id
      JOIN platform_coin_metadata pcm on pc."coinMetadataId" = pcm.id
    WHERE ${andSelectExchangeQuery} ${andFilterResultByWhatUserCanReceive} ${andSearchQuery}
    ${andExcludeRequestedTokenQuery}`;

    const foundTokensAll = await ExchangeSwap.query(`
    ${selectAddressQuery}
    ${logicSearchQuery}
    ${groupByAddressQuery}
    `);

    const total = foundTokensAll.length;
    const pages = Math.ceil(total / limit);

    const result = await ExchangeSwap.query(`
    ${selectAllFieldsQuery}
    ${logicSearchQuery}
    ${groupByAllFieldsQuery}
      LIMIT ${limit} OFFSET ${skip};
    `);

    return {
      page,
      size,
      pages,
      total,
      result: result.map((token) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        image: token.image,
        tokenAddress: token.tokenAddress,
        chain: {
          id: token.chDbId,
          name: token.chainName,
          image: token.chainImage,
          slug: token.chainSlug,
          chainId: token.chainId,
        },
      })),
    };
  }

  private formSingleExchangeQuery(
    exchange: ExchangeSwap,
    requestedTokenChainId: string,
  ) {
    let exchangeQuery;

    if (exchange.canMultiChain && exchange.canSingleChain) {
      exchangeQuery = `es.id = '${exchange.id}'`;
    } else if (exchange.canMultiChain) {
      exchangeQuery = `(es.id = '${exchange.id}' AND ch.id != '${requestedTokenChainId}')`;
    } else if (exchange.canSingleChain) {
      exchangeQuery = `(es.id = '${exchange.id}' AND ch.id = '${requestedTokenChainId}')`;
    } else {
      exchangeQuery = '';
    }

    return exchangeQuery;
  }

  private async formExchangesQuery(
    exchangesIds: string[],
    requestedTokenChainId: string,
  ) {
    let exchangesWhereQuery = '';

    const exchangesLength = exchangesIds.length;
    for (let i = 0; i < exchangesLength; i++) {
      const exchangeId = exchangesIds[i];
      const foundExchange = await ExchangeSwap.findOneBy({
        id: exchangeId,
      });

      const exchangeSingleQuery = this.formSingleExchangeQuery(
        foundExchange,
        requestedTokenChainId,
      );
      if (exchangeSingleQuery) {
        if (exchangesWhereQuery) {
          exchangesWhereQuery += ` OR `;
        }
        exchangesWhereQuery += exchangeSingleQuery;
      }
    }

    return exchangesWhereQuery ? `(${exchangesWhereQuery})` : '';
  }
}
