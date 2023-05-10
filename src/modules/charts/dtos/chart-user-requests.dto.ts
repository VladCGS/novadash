import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum FetchingToolsEnum {
  MORALIS = 'moralis',
  COINGECKO = 'coingecko',
}
export enum TradeAssetChartPeriodsEnum {
  DAY = '1D',
  WEEK = '7D',
  MONTH = '1M',
  THREE_MONTH = '3M',
  YEAR = '1Y',
  YTD = 'YTD',
  ALL = 'ALL',
}

export class FormTokenChartBaseDTO {
  @ApiProperty()
  @IsString()
  tokenAddress: string;

  @ApiProperty()
  @IsString()
  chainId: string;

  @ApiProperty()
  @IsString()
  mode: TradeAssetChartPeriodsEnum;
}

export class FormUserTokenChartDTO extends FormTokenChartBaseDTO {}

export class FormTokenChartDTO extends FormTokenChartBaseDTO {
  @ApiProperty()
  @IsEnum(FetchingToolsEnum)
  @IsOptional()
  fetchingTool?: FetchingToolsEnum;
}
