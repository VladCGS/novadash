import { Injectable } from '@nestjs/common';
import { GetPagePairsForCexTokenQueryDTO } from '../dto/swap-selector-requests.dto';
import { SupportedPoolCex } from '@app/common/entities/pairs';
import {
  PairsForCexTokenPageDTO,
  TokenCexExchangeDTO,
} from '../dto/swap-selector-response.dto';

@Injectable()
export class SwapPairsForCexTokenService {
  async getPagePairsForCexToken(
    params: GetPagePairsForCexTokenQueryDTO,
  ): Promise<PairsForCexTokenPageDTO> {
    const skip = (params.page - 1) * params.size;
    const searchPattern = params.search || '';
    const coreQuery = `
      FROM supported_pool_cex spc
         JOIN supported_pool_cex_platform_coin_metas_platform_coin_metadata spcpcmpcm on spc.id = spcpcmpcm."supportedPoolCexId"
         JOIN platform_coin_metadata pcm on spcpcmpcm."platformCoinMetadata" = pcm.id
WHERE
    (pcm.symbol = '${params.symbolOfInitialToken}' AND EXISTS (
            SELECT 1 FROM supported_pool_cex_platform_coin_metas_platform_coin_metadata spcpcmpcm2
                              JOIN platform_coin_metadata pcm2 ON spcpcmpcm2."platformCoinMetadata" = pcm2.id
            WHERE spcpcmpcm2."supportedPoolCexId" = spc.id AND pcm2.symbol ILIKE '${searchPattern}%'
        ))
   OR
    (pcm.symbol ILIKE '${searchPattern || ''}%' AND EXISTS (
            SELECT 1 FROM supported_pool_cex_platform_coin_metas_platform_coin_metadata spcpcmpcm2
                              JOIN platform_coin_metadata pcm2 ON spcpcmpcm2."platformCoinMetadata" = pcm2.id
            WHERE spcpcmpcm2."supportedPoolCexId" = spc.id AND pcm2.symbol = '${
              params.symbolOfInitialToken
            }'
        ))
ORDER BY spc.id, pcm.symbol = '${params.symbolOfInitialToken}' ASC
    `;

    const foundPoolsCount: { id: string; symbol: string }[] =
      await SupportedPoolCex.query(`
       SELECT DISTINCT ON (spc.id) spc.id, pcm.symbol
            ${coreQuery}`);

    const pages = Math.ceil(foundPoolsCount.length / params.size);

    const foundPools: TokenCexExchangeDTO[] = await SupportedPoolCex.query(`
       SELECT DISTINCT ON (spc.id) spc.id, pcm.symbol, pcm.name, pcm.image
            ${coreQuery}
            LIMIT ${params.size} OFFSET ${skip};
    `);

    return {
      page: params.page,
      size: params.size,
      pages,
      total: foundPoolsCount.length,
      result: foundPools,
    };
  }
}
