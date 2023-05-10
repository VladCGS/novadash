import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CalculateUniswapV3PoolBaseDTO {
  @ApiProperty()
  @IsString()
  chainIdDB: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  address: string;
}

export class CalculateUniswapV3TicksDTO extends CalculateUniswapV3PoolBaseDTO {
  @ApiProperty()
  @IsNumber()
  lowerRange: number;

  @ApiProperty()
  @IsNumber()
  upperRange: number;
}

export class CalculateUniswapV3PoolAprDTO extends CalculateUniswapV3TicksDTO {
  @ApiProperty()
  @IsNumber()
  priceAssumptionValue: number;
}

export class CalculateUniswapV3DepositDTO extends CalculateUniswapV3PoolBaseDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  quoteTokenAmount?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  baseTokenAmount?: string;
}
