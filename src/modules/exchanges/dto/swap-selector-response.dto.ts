import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { PayableDEXHttpSlugs } from '@app/common/constants';

export class TokenExchangeChainDTO {
  @ApiProperty({
    example: '77ab6528-618b-49b3-b78e-e88afe3f569f',
    description: 'Chain database id',
  })
  id: string;

  @ApiProperty({
    example: '137',
    description: 'Chain id',
  })
  chainId: string;

  @ApiProperty({
    example: 'Polygon Mainnet',
    description: 'Chain name',
  })
  name: string;

  @ApiProperty({
    example: 'https://matic.com/chain.png',
    description: 'Chain image',
  })
  image: string | null;

  @ApiProperty({
    example: 'matic',
    description: 'Chain slug',
  })
  slug: string;
}

export class TokenExchangeDTO {
  @ApiProperty({
    example: '0205c081-9deb-4f82-a632-8eb7f1aaf91e',
    description: 'Token id',
  })
  id: string;

  @ApiProperty({
    example: '0x0000000000000000000000000000000000000000',
    description: 'Token address',
  })
  tokenAddress: string;

  @ApiProperty({
    example: 'MATIC',
    description: 'Token name',
  })
  name: string;

  @ApiProperty({
    example: 'MATIC',
    description: 'Token symbol',
  })
  symbol: string;

  @ApiProperty({
    example:
      'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
    description: 'Token image',
  })
  image: string | null;

  @ApiProperty({
    example: {
      id: '77ab6528-618b-49b3-b78e-e88afe3f569f',
      name: 'Polygon Mainnet',
      image: null,
      slug: 'matic',
      chainId: '137',
    },
    description: 'Token chain object',
  })
  chain: TokenExchangeChainDTO;
}

export class PairsForSellTokenPageDTO extends PagedResultDTO {
  result: TokenExchangeDTO[];
}

export class TokenCexExchangeDTO {
  @ApiProperty({
    example: '0205c081-9deb-4f82-a632-8eb7f1aaf91e',
    description: 'Token id',
  })
  poolId: string;

  @ApiProperty({
    example: 'MATIC',
    description: 'Token name',
  })
  name: string;

  @ApiProperty({
    example: 'MATIC',
    description: 'Token symbol',
  })
  symbol: string;

  @ApiProperty({
    example:
      'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
    description: 'Token image',
  })
  image: string | null;
}

export class PairsForCexTokenPageDTO extends PagedResultDTO {
  result: TokenCexExchangeDTO[];
}

export class ExchangeMetaDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({
    example: 'Rango Exchange',
    description: 'Service name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'afbf8d26-7910-43be-8729-f1e7a6ebe495',
    description: 'Chain ID',
  })
  @IsString()
  image: string | null;

  @ApiProperty()
  @IsString()
  urlSlug: PayableDEXHttpSlugs;

  @ApiProperty()
  @IsBoolean()
  canSingleChain: boolean;

  @ApiProperty()
  @IsBoolean()
  canMultiChain: boolean;
}

export class FoundExchangesByTokenPairsDTO {
  @IsArray()
  @Type(() => ExchangeMetaDTO)
  services: ExchangeMetaDTO[];
}
