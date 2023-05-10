import { Fiat } from '@app/common/entities/alphaping';
import { ExchangeOnOffRampPairs, IRampEnum } from '@app/common/entities/pairs';
import { ChainSlugs } from '@app/common/types/chain.types';
import { emptyPagedResult } from '@app/common/utils/empty-paged-result.util';
import { Injectable } from '@nestjs/common';
import {
  GetDepositFiatsQueryDTO,
  GetExchangesByOnRampPairDTO,
  GetPagePairsForFiatQueryDTO,
} from '../dto/on-ramp-send.requests.dto';
import {
  ExchangeOnRampMetaDTO,
  OnRampFiatsPageDTO,
  OnRampsByFiatCryptoPairDTO,
  PairsForDepositFiatPageDTO,
} from '../dto/on-ramp-send.responses.dto';
import { TokenExchangeDTO } from '../dto/swap-selector-response.dto';
import { Chain } from '@app/common/entities/transactions';
import { DataExchangeSwapSelectorService } from '@app/common/modules/data-exchange-swap/services/data.exchange-swap-selector.service';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';

@Injectable()
export class ExchOnRampUserService {
  constructor(
    private exchangeSwapSelectorService: DataExchangeSwapSelectorService,
    private dataChainService: DataChainService,
  ) {}

  async getPairsForFiatPaged(
    userId: string,
    body: GetPagePairsForFiatQueryDTO,
  ): Promise<PairsForDepositFiatPageDTO> {
    const { fiatId, page, size, search = '' } = body;

    const offset = (page - 1) * size;

    const andSearchQuery = search.length
      ? `AND (pcm.symbol ILIKE('${search}%') OR pcm.name ILIKE('${search}%'))`
      : '';

    const userChains = await this.dataChainService.findManyByUserIdOrFail(
      userId,
    );

    // TODO
    //  add binance chain here
    const allowedChainIds = userChains.map((chain: Chain) => chain.id);
    const stringifiedChainIds = allowedChainIds.length
      ? `'${allowedChainIds.join("','")}'`
      : '';
    const andFilterResultByWhatUserCanReceive = `AND c.id in (${stringifiedChainIds})`;

    const queryBody = `
      JOIN exchange_supported_coin esc on esc.id = pairs."exchangeSupportedCoinId"
      JOIN exchange_supported_fiat esf on esf.id = pairs."exchangeSupportedFiatId"
      JOIN platform_coin pc on esc."platformCoinId" = pc.id
      JOIN platform_coin_metadata pcm on pc."coinMetadataId" = pcm.id
      JOIN chain c on pc."chainId" = c.id
      WHERE esf."fiatId" = '${fiatId}' ${andFilterResultByWhatUserCanReceive} ${andSearchQuery}
    `;

    const getPairsQuery = `
      SELECT DISTINCT ON (pcm.symbol) pc.id            id,
                                  pc."tokenAddress" "tokenAddress",
                                  pcm.name          name,
                                  pcm.symbol        symbol,
                                  pcm.image         image,
                                  c.id              "cId",
                                  c.name            "chainName",
                                  c.image           "chainImage",
                                  c.slug            "chainSlug",
                                  c."chainId"       "chainId"
      FROM exchange_on_off_ramp_pairs pairs
      ${queryBody}
      LIMIT ${size} OFFSET ${offset}
    `;

    const getPairsTotal = `
      SELECT COUNT(DISTINCT (pcm.symbol)) FROM exchange_on_off_ramp_pairs pairs
      ${queryBody}
    `;

    const foundPairsByFiat: [
      {
        id: string;
        tokenAddress: string;
        name: string;
        symbol: string;
        image: string | null;
        cId: string;
        chainName: string;
        chainSlug: ChainSlugs;
        chainId: string;
        chainImage: string | null;
      },
    ] = await ExchangeOnOffRampPairs.query(getPairsQuery);

    if (!foundPairsByFiat.length) return emptyPagedResult({ page, size });

    const mappedPairs: TokenExchangeDTO[] = foundPairsByFiat.map((token) => ({
      id: token.id,
      name: token.name,
      image: token.image,
      symbol: token.symbol,
      tokenAddress: token.tokenAddress,
      chain: {
        id: token.cId,
        image: token.chainImage,
        name: token.chainName,
        chainId: token.chainId,
        slug: token.chainSlug,
      },
    }));

    const foundPairsByFiatTotalResult: [{ count: number }] =
      await ExchangeOnOffRampPairs.query(getPairsTotal);

    const foundPairsByFiatTotal = Number(foundPairsByFiatTotalResult[0].count);
    const pages = Math.ceil(foundPairsByFiatTotal / size);

    return {
      page,
      pages,
      size,
      total: foundPairsByFiatTotal,
      result: mappedPairs,
    };
  }

  async getPageFiats(
    userId: string,
    body: GetDepositFiatsQueryDTO,
  ): Promise<OnRampFiatsPageDTO> {
    const { page, size, search } = body;
    const offset = (page - 1) * size;

    const searchLine = search.length
      ? `AND (f.symbol ILIKE('${search}%') OR f.name ILIKE('${search}%'))`
      : '';

    const symbolsQuery = `
      SELECT DISTINCT ON (pcm.symbol) pcm.symbol FROM wallet w
      LEFT JOIN "user" u on w."userId" = u.id
      LEFT JOIN chain c on w."chainId" = c.id
      LEFT JOIN platform_coin pc on pc."chainId" = c.id
      LEFT JOIN platform_coin_metadata pcm on pc."coinMetadataId" = pcm.id
      WHERE u.id = '${userId}'
    `;

    const queryBody = `
      JOIN exchange_supported_coin esc on esc.id = pairs."exchangeSupportedCoinId"
      JOIN exchange_supported_fiat esf on esf.id = pairs."exchangeSupportedFiatId"
          JOIN fiat f on esf."fiatId" = f.id
      JOIN platform_coin pc on esc."platformCoinId" = pc.id
      JOIN platform_coin_metadata pcm on pc."coinMetadataId" = pcm.id
      JOIN exchange_on_off_ramp eoor on pairs."exchangeOnOffRampId" = eoor.id
      WHERE pcm.symbol IN (${symbolsQuery}) ${searchLine}
      AND eoor.type = '${IRampEnum.ON_RAMP}'
    `;

    const getFiatsQuery = `
      SELECT DISTINCT ON(f.symbol) f.id, f.name, f.description, f.symbol, f.image FROM exchange_on_off_ramp_pairs pairs
      ${queryBody}
      LIMIT ${size} OFFSET ${offset}
    `;

    const countFiatsQuery = `
      SELECT COUNT(DISTINCT (f.symbol)) FROM exchange_on_off_ramp_pairs pairs
      ${queryBody}
    `;

    const foundSupportedFiats: Fiat[] = await ExchangeOnOffRampPairs.query(
      getFiatsQuery,
    );

    const foundSupportedFiatsTotalResult: [{ count: number }] =
      await ExchangeOnOffRampPairs.query(countFiatsQuery);

    const supportedFiatsTotal = Number(foundSupportedFiatsTotalResult[0].count);
    const pages = Math.ceil(supportedFiatsTotal / size);

    if (!foundSupportedFiats.length) return emptyPagedResult({ page, size });

    return {
      pages,
      page,
      size,
      total: supportedFiatsTotal,
      result: foundSupportedFiats,
    };
  }

  async getExchangesByPair({
    fiatId,
    platformCoinId,
  }: GetExchangesByOnRampPairDTO): Promise<OnRampsByFiatCryptoPairDTO> {
    const getExchangesByPairQuery = `
      SELECT DISTINCT ON(eoor.id) eoor.id, tm.name, eoor.url, tm.image, eoor."urlSlug"
      FROM exchange_on_off_ramp_pairs p
        JOIN exchange_supported_fiat esf on p."exchangeSupportedFiatId" = esf.id
        JOIN exchange_supported_coin esc on p."exchangeSupportedCoinId" = esc.id
        JOIN fiat f on esf."fiatId" = f.id
        JOIN platform_coin pc on esc."platformCoinId" = pc.id
        JOIN platform_coin_metadata pcm on pc."coinMetadataId" = pcm.id
        JOIN exchange_on_off_ramp eoor on p."exchangeOnOffRampId" = eoor.id
        JOIN tool_meta tm on eoor."metaId" = tm.id
      WHERE f.id = '${fiatId}' AND pc.id = '${platformCoinId}'
    `;

    const foundExchangesByPair: ExchangeOnRampMetaDTO[] =
      await ExchangeOnOffRampPairs.query(getExchangesByPairQuery);

    const services = foundExchangesByPair.length ? foundExchangesByPair : [];

    return { services };
  }
}
