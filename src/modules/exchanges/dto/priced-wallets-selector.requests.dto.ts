import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { OrderNativePricedHotWallets } from '../types/orders.enum';
import { SupportedCEXProviders } from '@app/common/entities/pairs';

export class FetchSelectorHotPricedWalletsDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  onlyPlatformCoinsIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onlySupportedByDEXs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onlySupportedByCEX?: SupportedCEXProviders;
}

export class FetchHotWalletsPricedNativeBalanceDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  chainIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  orderType?: OrderKeywordsEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  orderBy?: OrderNativePricedHotWallets;
}
