import { StakingProvider } from '@app/common/entities/staking/supported-staking-token.entity';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PageQueryDTO } from '../../transaction/dto/transaction-requests.dto';

export enum OrderStakingAssetsByEnum {
  STAKING_APR = 'stakingAPR',
  PROVIDER = 'provider',
}

export class FormStakingAssetsPageWithAPRDTO extends PageQueryDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  providers?: StakingProvider[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderStakingAssetsByEnum)
  orderBy?: OrderStakingAssetsByEnum;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  onlyAvailableToStaking?: boolean;
}
