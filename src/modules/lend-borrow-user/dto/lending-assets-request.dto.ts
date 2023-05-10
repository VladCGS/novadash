import { LendBorrowProviders } from '@app/common/entities/borrowing/reserve.entity';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageQueryDTO } from '../../transaction/dto/transaction-requests.dto';

export enum OrderLendingAssetsByEnum {
  LEND_APY = 'lendAPY',
  PROVIDER = 'provider',
}

export class FetchLendBorrowAssetsWithAPYBaseDTO extends PageQueryDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  providers?: LendBorrowProviders[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;
}

export class FormLendingAssetsPageWithAPYDTO extends FetchLendBorrowAssetsWithAPYBaseDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderLendingAssetsByEnum)
  orderBy?: OrderLendingAssetsByEnum;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  onlyAvailableToLend?: boolean;
}
