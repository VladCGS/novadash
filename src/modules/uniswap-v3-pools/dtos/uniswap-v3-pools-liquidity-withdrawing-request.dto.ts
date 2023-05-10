import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FormUniswapV3WithdrawingModalInitializationDataDTO {
  @ApiProperty()
  @IsString()
  chainIdDB: string;

  @ApiProperty()
  @IsString()
  positionId: string;
}

export class FormUniswapV3ClaimFeeTransactionDTO {
  @ApiProperty()
  @IsString()
  positionId: string;

  @ApiProperty()
  @IsString()
  chainIdDB: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useWrappedNativeToken?: boolean;

  @ApiProperty()
  @IsString()
  ownerAddress: string;
}

export class FormUniswapV3RemoveLiquidityTransactionDTO extends FormUniswapV3ClaimFeeTransactionDTO {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(100)
  removePercentage: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeUncollectedFees?: boolean;
}
