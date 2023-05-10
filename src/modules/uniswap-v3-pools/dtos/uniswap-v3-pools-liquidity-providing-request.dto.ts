import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FormUniswapV3AddLiquidityModalInitializationDataDTO {
  @ApiProperty()
  @IsString()
  poolAddress: string;

  @ApiProperty()
  @IsString()
  chainIdDB: string;
}

export class FormUniswapV3AddLiquidityTransactionDTO extends FormUniswapV3AddLiquidityModalInitializationDataDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useWrappedNativeToken?: boolean;

  @ApiProperty()
  @IsString()
  tokenAmountQuote: string;

  @ApiProperty()
  @IsString()
  tokenAmountBase: string;

  @ApiProperty()
  @IsString()
  walletAddress: string;
}
