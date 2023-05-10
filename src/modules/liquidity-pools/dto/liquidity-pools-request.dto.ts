import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PageQueryDTO } from '../../transaction/dto/transaction-requests.dto';
import { PoolProviders } from '@app/common/entities/pairs';
import { OrderKeywordsEnum } from '@app/common/types/common.types';

export enum OrderByEnum {
  APR = 'apr',
  PROVIDER = 'provider',
}

export class FormLendingPoolsWithAPRDTO extends PageQueryDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  providers?: PoolProviders[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;
}
