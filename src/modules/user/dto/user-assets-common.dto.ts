import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TokenAnalyticFromAssetDTO {
  @ApiProperty()
  @IsNumber()
  usdBalance: number;

  @ApiProperty()
  @IsNumber()
  quantityBalance: number;

  @ApiProperty()
  @IsNumber()
  usdTokenPriceAvg: number;

  @ApiProperty()
  @IsNumber()
  usdProfitLoss: number;
}

export class TokenAnalyticChangesDTO {
  @ApiProperty()
  @IsNumber()
  usdBalanceChanges: number;

  @ApiProperty()
  @IsNumber()
  usdBalancePercentChanges: number;

  @ApiProperty()
  @IsNumber()
  quantityBalanceChanges: number;

  @ApiProperty()
  @IsNumber()
  quantityBalancePercentChanges: number;

  @ApiProperty()
  @IsNumber()
  usdTokenPriceAvgChanges: number;

  @ApiProperty()
  @IsNumber()
  usdTokenPriceAvgPercentChanges: number;

  @ApiProperty()
  @IsNumber()
  usdProfitLossChanges: number;

  @ApiProperty()
  @IsNumber()
  usdProfitLossPercentChanges: number;
}
