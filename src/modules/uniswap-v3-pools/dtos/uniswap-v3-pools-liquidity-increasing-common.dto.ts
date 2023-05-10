import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { UniswapV3AddLiquidityTokenDataDTO } from './uniswap-v3-pools-liquidity-providing-common.dto';

export class UniswapV3IncreaseLiquidityTokenDataDTO extends UniswapV3AddLiquidityTokenDataDTO {
  @ApiProperty()
  @IsString()
  liquidityQuantity: string;

  @ApiProperty()
  @IsBoolean()
  disabledDeposit: boolean;
}
