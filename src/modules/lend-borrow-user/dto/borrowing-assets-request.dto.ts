import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FetchLendBorrowAssetsWithAPYBaseDTO } from './lending-assets-request.dto';

export enum OrderBorrowingAssetsByEnum {
  PROVIDER = 'provider',
  VARIABLE_BORROW_APY = 'borrowVariableAPY',
  STABLE_BORROW_APY = 'borrowStableAPY',
}

export class FormBorrowingAssetsWithAPYDTO extends FetchLendBorrowAssetsWithAPYBaseDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderBorrowingAssetsByEnum)
  orderBy?: OrderBorrowingAssetsByEnum;
}
