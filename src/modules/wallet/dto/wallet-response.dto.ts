import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ChainSlugs } from '@app/common/types/chain.types';

export class WalletAddressAndChainDTO {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  chainSlug: ChainSlugs;

  @ApiProperty()
  @IsString()
  chainId: string;

  @ApiProperty()
  @IsString()
  chainIdDB: string;
}
