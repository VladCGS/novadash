import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  SwapAssetDTO,
  SwapAssetWithAmountDTO,
} from './payable-common.requests.dto';

export class CEXFetchSwapStatusDTO {
  @IsString()
  swapId?: string;
}

export class CEXSwapGetQuoteDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SwapAssetWithAmountDTO)
  sell: SwapAssetWithAmountDTO;

  @ApiProperty({ description: 'Token name' })
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SwapAssetDTO)
  buy: SwapAssetDTO;
}
