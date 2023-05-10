import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class NewUniswapV3PoolAprDTO {
  @ApiProperty()
  @IsNumber()
  apr: number;

  @ApiProperty()
  @IsNumber()
  priceAssumptionValue: number;
}

export class NewUniswapV3PoolDepositAmountDTO {
  @ApiProperty()
  @IsString()
  quoteTokenAmount: string;

  @ApiProperty()
  @IsBoolean()
  quoteTokenDisabled: boolean;

  @ApiProperty()
  @IsString()
  baseTokenAmount: string;

  @ApiProperty()
  @IsBoolean()
  baseTokenDisabled: boolean;
}

export class UniswapV3PoolCorrectRangesDTO {
  @ApiProperty()
  @IsNumber()
  lowerRange: number;

  @ApiProperty()
  @IsNumber()
  upperRange: number;
}
