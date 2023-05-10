import { ApiProperty } from '@nestjs/swagger';
import { TokenExchangeDTO } from './swap-selector-response.dto';

export class StableCoinChainDTO {
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

export class StableCoinDTO {
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
  chain: StableCoinChainDTO;
}

export class StableCoinsPairsDTO {
  @ApiProperty()
  result: StableCoinDTO[];
}
