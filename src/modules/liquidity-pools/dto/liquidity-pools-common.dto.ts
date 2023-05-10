import {
  DefaultProfitsDTO,
  ProviderMetaDTO,
  TokenMetaDTO,
} from '@app/common/dtos/default-dao-common.dto';
import { PoolProviders } from '@app/common/entities/pairs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class PoolInfoMetaDTO {
  @ApiProperty()
  @IsString()
  provider: PoolProviders;

  @ApiProperty()
  @IsString()
  feePercentage: number;

  @ApiProperty()
  @IsString()
  poolAddress: string;

  @ApiProperty()
  @IsString()
  chainIdDB: string;
}

export class PoolMetasBaseDTO {
  @ApiProperty()
  @Type(() => ProviderMetaDTO)
  providerMeta: ProviderMetaDTO;

  @ApiProperty()
  @Type(() => TokenMetaDTO)
  tokensMeta: TokenMetaDTO[];

  @ApiProperty()
  @Type(() => PoolInfoMetaDTO)
  poolMeta: PoolInfoMetaDTO;
}

export class PoolWithMetasAndAprDTO extends PoolMetasBaseDTO {
  @ApiProperty()
  @Type(() => DefaultProfitsDTO)
  profits: DefaultProfitsDTO;
}
