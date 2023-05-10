import { TokenPositionProfit } from '@app/common/modules/uniswap-pools/types/uniswap-v3-positions-provider-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { PoolMetasBaseDTO } from './liquidity-pools-common.dto';

export class PositionInfoBaseDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  chainIdDB: string;
}

export class ActivePositionInfoDTO extends PositionInfoBaseDTO {
  @ApiProperty()
  @IsBoolean()
  inRange: boolean;

  @ApiProperty()
  @IsNumber()
  usdProfitLoss: number;

  @ApiProperty()
  @IsNumber()
  profitLossPercentChanges: number;

  @ApiProperty()
  @Type(() => TokenPositionProfit)
  tokensProfits: TokenPositionProfit[];
}

export class InactivePositionInfoDTO extends PositionInfoBaseDTO {
  @ApiProperty()
  @IsDate()
  dateLastActive: Date;
}

export class PositionQuantityDTO {
  @ApiProperty()
  @IsNumber()
  quantityBalance: number;
}

export class TokenPositionProfitDTO {
  @ApiProperty()
  @IsNumber()
  positionDepositSummary: number;

  @ApiProperty()
  @IsNumber()
  positionBalance: number;

  @ApiProperty()
  @IsNumber()
  positionChanges: number;

  @ApiProperty()
  @IsNumber()
  positionChangesUsd: number;

  @ApiProperty()
  @IsNumber()
  usdPrice: number;

  @ApiProperty()
  @Type(() => PositionQuantityDTO)
  uncollectedFee: PositionQuantityDTO;

  @ApiProperty()
  liquidity: PositionQuantityDTO;
}

export class PoolActivePositionInfoWithMetaDTO extends PoolMetasBaseDTO {
  @ApiProperty()
  @Type(() => ActivePositionInfoDTO)
  positionInfo: ActivePositionInfoDTO;
}

export class PoolInactivePositionInfoWithMetaDTO extends PoolMetasBaseDTO {
  @ApiProperty()
  @Type(() => InactivePositionInfoDTO)
  positionInfo: InactivePositionInfoDTO;
}
