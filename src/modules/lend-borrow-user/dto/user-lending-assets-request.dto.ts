import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageQueryDTO } from '../../transaction/dto/transaction-requests.dto';

export enum OrderLendingAssetsByEnum {
  USD_BALANCE = 'usdBalance',
  PROVIDER = 'provider',
}

export class UserLendingAssetsPagedRequestDTO extends PageQueryDTO {
  @ApiPropertyOptional({ description: 'Search' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderLendingAssetsByEnum)
  orderBy?: OrderLendingAssetsByEnum;
}
