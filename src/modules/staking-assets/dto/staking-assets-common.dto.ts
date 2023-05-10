import {
  DefaultProfitsDTO,
  ProviderMetaDTO,
  TokenMetaDTO,
} from '@app/common/dtos/default-dao-common.dto';
import { StakingProvider } from '@app/common/entities/staking/supported-staking-token.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class StakingAssetMetaDTO {
  @ApiProperty()
  @IsString()
  provider: StakingProvider;

  @ApiProperty()
  @IsString()
  stakingAssetAddress: string;

  @ApiProperty()
  @IsString()
  chainIdDB: string;
}

export class StakingAssetsWithMetaAndAPRDTO {
  @ApiProperty()
  @Type(() => DefaultProfitsDTO)
  profits: DefaultProfitsDTO;

  @ApiProperty()
  @Type(() => ProviderMetaDTO)
  providerMeta: ProviderMetaDTO;

  @ApiProperty()
  @Type(() => StakingAssetMetaDTO)
  stakingMeta: StakingAssetMetaDTO;

  @ApiProperty()
  @Type(() => TokenMetaDTO)
  coreTokenMeta: TokenMetaDTO;

  @ApiProperty()
  @IsBoolean()
  canUserStake: boolean;
}
