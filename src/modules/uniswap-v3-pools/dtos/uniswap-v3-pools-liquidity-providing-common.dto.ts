import { TokenMetaDTO } from '@app/common/dtos/default-dao-common.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class UniswapWrappedPositionSwitcherMetaDTO {
  @ApiProperty()
  @Type(() => TokenMetaDTO)
  native: TokenMetaDTO;

  @ApiProperty()
  @Type(() => TokenMetaDTO)
  wrapped: TokenMetaDTO;
}

export class UniswapV3AddLiquidityTokenDataDTO {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  usdPrice: string;
}
